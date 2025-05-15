import { NextRequest, NextResponse } from 'next/server';

// Plant.ID API key and URL
const PLANT_ID_API_KEY = 'qfE1DVIUgbuivUtkjW8eD5w7xfUPMU9BdfNyONEFhfFZTKO6RT';
const PLANT_ID_API_URL = 'https://plant.id/api/v3/identification';

// Remove conflicting settings for static export
// export const dynamic = "force-static";
// export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    console.log('Received request for plant identification');

    // Parse the form data to get the image
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('Error parsing form data:', error);
      return NextResponse.json(
        { success: false, error: 'Error parsing form data. If on mobile, try using a different browser or device.' },
        { status: 400 }
      );
    }
    
    // Log all form data keys for debugging
    const formDataKeys = Array.from(formData.keys());
    console.log('Form data keys:', formDataKeys);
    
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      console.error('No image file provided in form data');
      return NextResponse.json(
        { success: false, error: 'No image provided. Please try again with a different image.' },
        { status: 400 }
      );
    }

    console.log('Image file received:', imageFile.name, imageFile.type, imageFile.size);

    // Validate the image file
    if (!imageFile.type.startsWith('image/')) {
      console.error('Invalid file type:', imageFile.type);
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
      console.error('File too large:', imageFile.size);
      return NextResponse.json(
        { success: false, error: 'Image file too large. Please upload an image under 5MB.' },
        { status: 400 }
      );
    }

    // Convert the image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    console.log('Image converted to base64, length:', base64Image.length);
    
    if (!base64Image || base64Image.length < 100) {
      console.error('Base64 conversion produced invalid result');
      return NextResponse.json(
        { success: false, error: 'Failed to process the image properly.' },
        { status: 400 }
      );
    }
    
    // Prepare data for Plant.ID API v3
    const plantIdData = {
      images: [base64Image],
      latitude: null,
      longitude: null,
      similar_images: true
    };
    
    console.log('Calling Plant.ID API v3');
    
    // Call the Plant.ID API v3
    const plantIdResponse = await fetch(PLANT_ID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PLANT_ID_API_KEY
      },
      body: JSON.stringify(plantIdData)
    });

    console.log('Plant.ID API response status:', plantIdResponse.status);
    
    // If the Plant.ID API call is successful
    if (plantIdResponse.ok) {
      const plantIdData = await plantIdResponse.json();
      console.log('Plant.ID API returned data successfully');
      
      if (plantIdData.result && plantIdData.result.classification && plantIdData.result.classification.suggestions && plantIdData.result.classification.suggestions.length > 0) {
        const topResult = plantIdData.result.classification.suggestions[0];
        
        // Format the response data
        const identifiedPlant = {
          name: topResult.name,
          probability: topResult.probability,
          details: {
            common_names: topResult.common_names || [],
            scientific_name: topResult.name,
            family: topResult.details?.taxonomy?.family || '',
            genus: topResult.details?.taxonomy?.genus || '',
            care_level: determineCareLevel(topResult.name),
            growth_info: getGrowthInfo(topResult.name)
          },
          image_url: plantIdData.result.images?.[0]?.url || ''
        };
        
        return NextResponse.json({
          success: true,
          result: identifiedPlant
        });
      } else {
        console.log('Plant.ID API returned no results');
        return NextResponse.json(
          { success: false, error: 'No plant identification results returned. Please try with a clearer image.' },
          { status: 404 }
        );
      }
    } else {
      // Log the error response
      const errorText = await plantIdResponse.text();
      console.error('Plant.ID API error:', plantIdResponse.status, errorText);
      return NextResponse.json(
        { success: false, error: `Plant.ID API error: ${plantIdResponse.status}` },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error identifying plant:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to identify plant' },
      { status: 500 }
    );
  }
}

// Helper function to determine care level based on plant species
function determineCareLevel(scientificName: string): string {
  // This is a simplified version. In a real app, you would have a more extensive database.
  const easyCare = ['Sansevieria', 'Dracaena', 'Zamioculcas', 'Aspidistra', 'Aglaonema'];
  const intermediateCare = ['Monstera', 'Ficus', 'Calathea', 'Philodendron', 'Alocasia'];
  const difficultCare = ['Orchidaceae', 'Adiantum', 'Dionaea', 'Platycerium'];
  
  for (const genus of easyCare) {
    if (scientificName.includes(genus)) return 'Beginner-friendly';
  }
  
  for (const genus of intermediateCare) {
    if (scientificName.includes(genus)) return 'Intermediate';
  }
  
  for (const genus of difficultCare) {
    if (scientificName.includes(genus)) return 'Advanced';
  }
  
  return 'Intermediate'; // Default
}

// Helper function to get growth information based on plant species
function getGrowthInfo(scientificName: string): any {
  // This would be a database of plant care requirements in a real app
  const growthInfoDatabase: Record<string, any> = {
    'Monstera deliciosa': {
      soil_ph: '5.5-7.0 (slightly acidic to neutral)',
      light: 'Bright, indirect light',
      atmospheric_humidity: 'High humidity (50-60%)',
      soil_nutrient: 'Rich, well-draining potting mix'
    },
    'Ficus lyrata': {
      soil_ph: '6.0-7.0',
      light: 'Bright, indirect light',
      atmospheric_humidity: 'Medium to high (40-60%)',
      soil_nutrient: 'Well-draining, rich potting mix'
    },
    'Dracaena trifasciata': {
      soil_ph: '5.5-7.5',
      light: 'Low to bright indirect light',
      atmospheric_humidity: 'Low to average (30-40%)',
      soil_nutrient: 'Well-draining, sandy soil'
    }
  };
  
  // Look for exact matches
  if (growthInfoDatabase[scientificName]) {
    return growthInfoDatabase[scientificName];
  }
  
  // Look for partial matches (genus level)
  for (const knownSpecies in growthInfoDatabase) {
    if (scientificName.split(' ')[0] === knownSpecies.split(' ')[0]) {
      return growthInfoDatabase[knownSpecies];
    }
  }
  
  // Default growth info if no match found
  return {
    soil_ph: '6.0-7.0 (neutral)',
    light: 'Medium to bright indirect light',
    atmospheric_humidity: 'Average humidity (40-50%)',
    soil_nutrient: 'Standard potting mix with good drainage'
  };
} 