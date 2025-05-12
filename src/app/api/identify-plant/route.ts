import { NextRequest, NextResponse } from 'next/server';

// Plant.ID API key
const PLANT_ID_API_KEY = 'qfE1DVIUgbuivUtkjW8eD5w7xfUPMU9BdfNyONEFhfFZTKO6RT';

// Fallback mock plant data when we can't connect to the real API
const mockPlants = [
  {
    name: 'Monstera Deliciosa',
    probability: 0.95,
    details: {
      common_names: ['Swiss Cheese Plant', 'Split-leaf Philodendron'],
      scientific_name: 'Monstera deliciosa',
      family: 'Araceae',
      genus: 'Monstera',
      care_level: 'Beginner-friendly',
      growth_info: {
        soil_ph: '5.5-7.0 (slightly acidic to neutral)',
        light: 'Bright, indirect light',
        atmospheric_humidity: 'High humidity (50-60%)',
        soil_nutrient: 'Rich, well-draining potting mix'
      }
    },
    image_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80'
  }
];

export async function POST(request: NextRequest) {
  try {
    console.log('Received request for plant identification');

    // Check for proper Content-Type header
    const contentType = request.headers.get('content-type') || '';
    console.log('Request Content-Type:', contentType);
    
    if (!contentType.includes('multipart/form-data') && !contentType.includes('boundary')) {
      console.warn('Request may not have proper Content-Type header, common on some mobile browsers');
    }
    
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

    try {
      // Convert the image to base64
      let base64Image;
      try {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        base64Image = buffer.toString('base64');
        console.log('Image converted to base64, length:', base64Image.length);
        
        if (!base64Image || base64Image.length < 100) {
          console.error('Base64 conversion produced invalid result');
          throw new Error('Failed to process the image properly');
        }
      } catch (error) {
        console.error('Error converting image to base64:', error);
        
        // If the file is present but conversion failed, use the fallback data
        // This often happens with some mobile browsers
        console.log('Using fallback data due to image processing error');
        return NextResponse.json({
          success: true,
          result: mockPlants[0],
          fallback: true,
          error_info: 'Image processing failed, showing demo data instead'
        });
      }
      
      // Prepare data for Plant.ID API
      const plantIdData = {
        api_key: PLANT_ID_API_KEY,
        images: [base64Image],
        modifiers: ["crops_fast", "similar_images"],
        plant_language: "en",
        plant_details: ["common_names", "url", "name_authority", "wiki_description", "taxonomy", "synonyms"]
      };
      
      console.log('Calling Plant.ID API');
      
      // Call the Plant.ID API
      const plantIdResponse = await fetch('https://api.plant.id/v2/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(plantIdData)
      });

      console.log('Plant.ID API response status:', plantIdResponse.status);
      
      // If the Plant.ID API call is successful
      if (plantIdResponse.ok) {
        const plantIdData = await plantIdResponse.json();
        console.log('Plant.ID API returned data successfully');
        
        if (plantIdData.suggestions && plantIdData.suggestions.length > 0) {
          const topResult = plantIdData.suggestions[0];
          
          // Format the response data
          const identifiedPlant = {
            name: topResult.plant_name,
            probability: topResult.probability,
            details: {
              common_names: topResult.plant_details?.common_names || [],
              scientific_name: topResult.plant_name,
              family: topResult.plant_details?.taxonomy?.family || '',
              genus: topResult.plant_details?.taxonomy?.genus || '',
              care_level: determineCareLevel(topResult.plant_name),
              growth_info: getGrowthInfo(topResult.plant_name)
            },
            image_url: topResult.similar_images?.[0]?.url || ''
          };
          
          return NextResponse.json({
            success: true,
            result: identifiedPlant
          });
        } else {
          console.log('Plant.ID API returned no results');
          throw new Error('No plant identification results returned');
        }
      } else {
        // Log the error response
        const errorText = await plantIdResponse.text();
        console.error('Plant.ID API error:', plantIdResponse.status, errorText);
        throw new Error(`Plant.ID API error: ${plantIdResponse.status} - ${errorText}`);
      }
    } catch (apiError) {
      console.error('Error during API call:', apiError);
      
      // Use fallback data for demo purposes when real API fails
      console.log('Using fallback plant data due to API error');
      return NextResponse.json({
        success: true,
        result: mockPlants[0],
        fallback: true,
        error_info: apiError instanceof Error ? apiError.message : 'API connection issue'
      });
    }
  } catch (error) {
    console.error('Error identifying plant:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to identify plant',
        fallback: true
      },
      { status: 200 } // Return 200 with error flag instead of 500 to prevent fetch error
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