import { NextResponse } from 'next/server';

const TREFLE_API_KEY = 'UpBV80DfSit_-AXyjEP-VqX0GTIQJJgWrxdHkomM_BI';
const TREFLE_API_URL = 'https://trefle.io/api/v1';
const PLANTNET_API_KEY = '2b10B9mVsTluuyD63JPTIv6wO';
const PLANTNET_API_URL = 'https://my-api.plantnet.org/v2/identify/all';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const plantName = formData.get('plantName') as string;
    const imageFile = formData.get('image') as File | null;

    console.log('Request received:', { 
      hasPlantName: !!plantName, 
      hasImage: !!imageFile,
      imageType: imageFile?.type,
      imageSize: imageFile?.size
    });

    if (!plantName && !imageFile) {
      return NextResponse.json({ error: 'Plant name or image is required' }, { status: 400 });
    }

    let identificationResult;

    if (imageFile) {
      try {
        // Handle image-based identification using Pl@ntNet API
        const plantNetFormData = new FormData();

        // Convert the File object to a Blob with the correct MIME type
        const imageBlob = new Blob([await imageFile.arrayBuffer()], { type: imageFile.type });
        plantNetFormData.append('images', imageBlob, imageFile.name);

        console.log('Calling Pl@ntNet API...');
        const plantNetResponse = await fetch(
          `${PLANTNET_API_URL}?api-key=${PLANTNET_API_KEY}&include-related-images=true`, 
          {
            method: 'POST',
            body: plantNetFormData,
          }
        );

        if (!plantNetResponse.ok) {
          const errorText = await plantNetResponse.text();
          console.error('Pl@ntNet API error:', {
            status: plantNetResponse.status,
            statusText: plantNetResponse.statusText,
            error: errorText
          });
          throw new Error(`Pl@ntNet API error: ${errorText || plantNetResponse.statusText}`);
        }

        const plantNetData = await plantNetResponse.json();
        console.log('Pl@ntNet API response:', plantNetData);

        if (!plantNetData.results || plantNetData.results.length === 0) {
          throw new Error('No plant matches found in the image');
        }

        const bestMatch = plantNetData.results[0];

        if (bestMatch) {
          // Map Pl@ntNet response to our standardized format
          identificationResult = {
            name: bestMatch.species.commonNames?.[0] || bestMatch.species.scientificNameWithoutAuthor,
            probability: bestMatch.score,
            details: {
              common_names: bestMatch.species.commonNames || [],
              scientific_name: bestMatch.species.scientificNameWithoutAuthor,
              family: bestMatch.species.family.scientificNameWithoutAuthor,
              genus: bestMatch.species.genus.scientificNameWithoutAuthor,
              care_level: determineCareLevel({
                growth: {
                  light: 5,
                  atmospheric_humidity: 5,
                  soil_nutrient: 5
                }
              }),
              growth_info: {
                soil_ph: '6.0 - 7.0',
                light: 'Moderate',
                atmospheric_humidity: 'Moderate',
                soil_nutrient: 'Moderate',
              },
            },
            image_url: bestMatch.images[0]?.url?.m || bestMatch.images[0]?.url?.o || null,
            // Add raw identification data for debugging
            raw_data: {
              commonNames: bestMatch.species.commonNames,
              scientificName: bestMatch.species.scientificNameWithoutAuthor,
              family: bestMatch.species.family.scientificNameWithoutAuthor,
              genus: bestMatch.species.genus.scientificNameWithoutAuthor
            }
          };
        }
      } catch (error) {
        console.error('Error in image identification:', error);
        throw error;
      }
    } else {
      try {
        // Handle text-based search using Trefle API
        console.log('Calling Trefle API...');
        const searchResponse = await fetch(
          `${TREFLE_API_URL}/plants/search?token=${TREFLE_API_KEY}&q=${encodeURIComponent(plantName)}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!searchResponse.ok) {
          const errorText = await searchResponse.text();
          console.error('Trefle API error:', {
            status: searchResponse.status,
            statusText: searchResponse.statusText,
            error: errorText
          });
          throw new Error(`Trefle API error: ${searchResponse.status} ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();
        console.log('Trefle search response:', searchData);
        
        if (searchData.data && searchData.data.length > 0) {
          const bestMatch = searchData.data[0];
          
          // Get detailed plant information
          const detailsResponse = await fetch(
            `${TREFLE_API_URL}/plants/${bestMatch.id}?token=${TREFLE_API_KEY}`,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!detailsResponse.ok) {
            const errorText = await detailsResponse.text();
            console.error('Trefle details API error:', {
              status: detailsResponse.status,
              statusText: detailsResponse.statusText,
              error: errorText
            });
            throw new Error(`Trefle details API error: ${detailsResponse.status} ${detailsResponse.statusText}`);
          }

          const detailsData = await detailsResponse.json();
          console.log('Trefle details response:', detailsData);
          const plant = detailsData.data;

          identificationResult = {
            name: plant.common_name || plant.scientific_name,
            probability: 1,
            details: {
              common_names: [plant.common_name].filter(Boolean),
              scientific_name: plant.scientific_name,
              family: plant.family_common_name,
              genus: plant.genus,
              care_level: determineCareLevel(plant),
              growth_info: {
                soil_ph: plant.growth?.ph_minimum && plant.growth?.ph_maximum 
                  ? `${plant.growth.ph_minimum} - ${plant.growth.ph_maximum}`
                  : undefined,
                light: plant.growth?.light,
                atmospheric_humidity: plant.growth?.atmospheric_humidity,
                soil_nutrient: plant.growth?.soil_nutrient,
                soil_salinity: plant.growth?.soil_salinity,
                soil_texture: plant.growth?.soil_texture,
              },
            },
            image_url: plant.image_url,
          };
        }
      } catch (error) {
        console.error('Error in text search:', error);
        throw error;
      }
    }

    if (!identificationResult) {
      throw new Error('No plant matches found');
    }

    return NextResponse.json({ result: identificationResult });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to identify plant' },
      { status: 500 }
    );
  }
}

function determineCareLevel(plant: any): string {
  // Determine care level based on growth parameters
  const growth = plant.growth || {};
  
  if (!growth.light && !growth.atmospheric_humidity && !growth.soil_nutrient) {
    return 'Unknown';
  }

  let careScore = 0;
  let factors = 0;

  if (growth.light) {
    careScore += parseInt(growth.light);
    factors++;
  }
  if (growth.atmospheric_humidity) {
    careScore += parseInt(growth.atmospheric_humidity);
    factors++;
  }
  if (growth.soil_nutrient) {
    careScore += parseInt(growth.soil_nutrient);
    factors++;
  }

  const averageScore = factors > 0 ? careScore / factors : 0;

  if (averageScore >= 7) {
    return 'High maintenance';
  } else if (averageScore >= 4) {
    return 'Moderate care';
  } else {
    return 'Easy care';
  }
} 