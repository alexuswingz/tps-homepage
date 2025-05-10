import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';
import { houseplantsList, gardenPlantsList, hydroAquaticList, supplementsList } from '@/lib/productLists';

interface PlantCharacteristics {
  isIndoor: boolean;
  isAquatic: boolean;
  needsHighNutrients: boolean;
  isFlowering: boolean;
  commonName: string;
  scientificName: string;
  genus: string;
}

function analyzePlantName(plantName: string): PlantCharacteristics {
  const name = plantName.toLowerCase();
  
  // Extract genus if scientific name is provided (e.g., "Monstera deliciosa" -> "monstera")
  const words = name.split(' ');
  const genus = words[0];
  
  // Common indoor plants
  const indoorPlants = ['monstera', 'philodendron', 'pothos', 'snake plant', 'zz plant', 'fiddle leaf', 'orchid', 'peace lily'];
  // Aquatic plants
  const aquaticPlants = ['lotus', 'water lily', 'hydrilla', 'duckweed', 'water hyacinth'];
  // High nutrient demanding plants
  const highNutrientPlants = ['monstera', 'tomato', 'rose', 'hydrangea', 'vegetable', 'fruit'];
  // Flowering plants
  const floweringPlants = ['rose', 'orchid', 'hibiscus', 'hydrangea', 'gardenia', 'flowering'];

  // Debug log
  console.log('Analyzing plant name:', {
    input: plantName,
    normalized: name,
    genus,
    matchesIndoor: indoorPlants.filter(p => name.includes(p)),
    matchesAquatic: aquaticPlants.filter(p => name.includes(p)),
    matchesHighNutrient: highNutrientPlants.filter(p => name.includes(p)),
    matchesFlowering: floweringPlants.filter(p => name.includes(p))
  });

  return {
    isIndoor: indoorPlants.some(plant => name.includes(plant)),
    isAquatic: aquaticPlants.some(plant => name.includes(plant)),
    needsHighNutrients: highNutrientPlants.some(plant => name.includes(plant)),
    isFlowering: floweringPlants.some(plant => name.includes(plant)),
    commonName: name,
    scientificName: name,
    genus: genus
  };
}

function getRelevantProducts(characteristics: PlantCharacteristics): string[] {
  const relevantProducts = new Set<string>();
  const searchTerms = new Set<string>();

  // Debug log
  console.log('Plant characteristics:', characteristics);

  // Add the genus and common name as search terms
  searchTerms.add(characteristics.genus);
  searchTerms.add(characteristics.commonName);

  // Add category-specific products and search terms
  if (characteristics.isIndoor) {
    searchTerms.add('Indoor Plant Food');
    searchTerms.add('House Plant Food');
    
    // Add specific plant products if available
    const matchingProducts = houseplantsList.filter(product => {
      const productLower = product.toLowerCase();
      return searchTerms.size > 0 && Array.from(searchTerms).some(term => 
        productLower.includes(term.toLowerCase())
      );
    });

    // Debug log
    console.log('Matching houseplant products:', matchingProducts);

    matchingProducts.forEach(product => relevantProducts.add(product));
  }

  if (characteristics.isAquatic) {
    hydroAquaticList.forEach(product => relevantProducts.add(product));
  }

  if (characteristics.needsHighNutrients) {
    relevantProducts.add('All Purpose NPK Fertilizer');
    supplementsList.forEach(product => {
      if (product.includes('Nitrogen') || product.includes('Phosphorus') || product.includes('Potassium')) {
        relevantProducts.add(product);
      }
    });
  }

  if (characteristics.isFlowering) {
    relevantProducts.add('Flowering Fertilizer');
    relevantProducts.add('Bloom Fertilizer');
    gardenPlantsList.forEach(product => {
      if (product.toLowerCase().includes('flower') || product.toLowerCase().includes('bloom')) {
        relevantProducts.add(product);
      }
    });
  }

  // Always add some general supplements that are good for most plants
  relevantProducts.add('Root Booster for Plants');
  relevantProducts.add('Mycorrhizal Fungi');
  relevantProducts.add('Cal-Mag Fertilizer');

  // Debug log
  console.log('Selected relevant products:', Array.from(relevantProducts));
  console.log('Search terms:', Array.from(searchTerms));

  return Array.from(relevantProducts);
}

interface RecommendedProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  link: string;
}

export async function POST(request: Request) {
  try {
    const { plantName } = await request.json();
    console.log('Received plant name:', plantName);

    // Extract the genus name if it's a scientific name (e.g., "Monstera deliciosa" -> "Monstera")
    const genusName = plantName.split(' ')[0];
    
    // Create variations of the plant name for better matching
    const searchTerms = [
      plantName.toLowerCase(),
      genusName.toLowerCase(),
      ...plantName.toLowerCase().split(' ')
    ];

    console.log('Search terms:', searchTerms);

    const characteristics = analyzePlantName(plantName);
    const relevantProducts = getRelevantProducts(characteristics);

    // Add direct product name matches
    const directMatches = houseplantsList.filter(product => 
      searchTerms.some(term => product.toLowerCase().includes(term))
    );
    console.log('Direct product matches:', directMatches);
    directMatches.forEach(match => relevantProducts.push(match));

    // Create a search query that combines exact product names and search terms
    const searchQuery = `(${relevantProducts.join(' OR ')}) OR (${searchTerms.join(' OR ')})`;
    console.log('Final search query:', searchQuery);

    // Query to fetch products from Shopify with better filtering
    const query = `
      query Products($query: String!) {
        products(first: 10, query: $query) {
          edges {
            node {
              id
              title
              description
              handle
              featuredImage {
                url
                altText
              }
              variants(first: 1) {
                edges {
                  node {
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await shopifyFetch({ 
      query,
      variables: {
        query: searchQuery
      }
    });

    if (response.status !== 200 || !response.body?.data?.products?.edges) {
      console.error('Shopify API response:', response);
      throw new Error('Failed to fetch products');
    }

    // Map Shopify products to recommended products
    const products = response.body.data.products.edges.map(({ node }: any) => ({
      id: node.id,
      name: node.title,
      description: node.description,
      image: node.featuredImage?.url || '/placeholder-image.jpg',
      price: parseFloat(node.variants.edges[0]?.node.price.amount || '0'),
      link: `/product/${node.handle}`,
    }));

    console.log('Found products:', products.map((p: RecommendedProduct) => p.name));

    // Sort products by relevance to the plant
    products.sort((a: RecommendedProduct, b: RecommendedProduct) => {
      const aTitle = a.name.toLowerCase();
      const bTitle = b.name.toLowerCase();
      
      // Check against all search terms
      const aMatches = searchTerms.filter(term => aTitle.includes(term)).length;
      const bMatches = searchTerms.filter(term => bTitle.includes(term)).length;
      
      // Return based on number of matches (more matches = higher priority)
      return bMatches - aMatches;
    });

    return NextResponse.json({ 
      products,
      characteristics,
      relevantProducts,
      debug: {
        searchTerms,
        directMatches,
        searchQuery
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to get product recommendations' },
      { status: 500 }
    );
  }
} 