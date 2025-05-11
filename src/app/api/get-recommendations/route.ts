import { NextRequest, NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';

// Real product list from your Shopify store
const realProducts = [
  "Granulated Fertilizer",
  "Cactus/Succulent Fertilizer",
  "Cut Flower Food",
  "Flower Plant Food",
  "African Violet Plant Food",
  "Hanging Basket Plant Food",
  "Trailing Plant Food",
  "Hydrangea Fertilizer",
  "Aquatic Plant Food",
  "Azalea Fertilizer",
  "Rhododendron Fertilizer",
  "Citrus Fertilizer",
  "Rose Food",
  "Tomato Plant Food",
  "Vegetable Fertilizer",
  "Herb Fertilizer",
  "Fruit Fertilizer",
  "Palm Fertilizer",
  "Bonsai Fertilizer",
  "Bulb Fertilizer",
  "Organic Fertilizer",
  "Ericaceous Fertilizer",
  "Tree Fertilizer",
  "All Purpose NPK Fertilizer",
  "Indoor Plant Food",
  "Acid-Loving Plant Food",
  "Plant Food Outdoor",
  "Root Booster",
  "Water Soluble Fertilizer",
  "Bone Meal",
  "Blood Meal",
  "Fish Emulsion Fertilizer",
  "Seaweed Extract For Plants",
  "Liquid Plant Food",
  "Controlled Release Fertilizer",
  "Slow Release Fertilizer",
  "Lawn Fertilizer",
  "Grass Fertilizer",
  "Worm Castings Concentrate",
  "Foliar Fertilizer",
  "Sulfur for Plants",
  "Phosphorus Fertilizer",
  "Potassium Sulfate For Plants",
  "Compost Tea",
  "Kelp Fertilizer",
  "Amino Acid Fertilizer",
  "Orchid Fertilizer",
  "Houseplant Fertilizer",
  "Cactus Fertilizer",
  "Tropical Plant Fertilizer",
  "Clematis Fertilizer",
  "Magnolia Tree Fertilizer",
  "Maple Tree Fertilizer",
  "Pine Tree Fertilizer",
  "Orange Tree Fertilizer",
  "Apple Tree Fertilizer",
  "Lemon Tree Fertilizer",
  "Sage Palm Fertilizer",
  "Hibiscus Fertilizer",
  "African Plant Food",
  "Amaryllis Fertilizer",
  "Avocado Plant Food",
  "Gardenia Fertilizer",
  "Camellia Fertilizer",
  "Gardenia Liquid Plant Food",
  "Gardenia Granular Fertilizer",
  "Succulent Plant Supplement",
  "Blossom End Rot Supplement",
  "10-10-10 NPK Vegetable",
  "15-30-15 NPK Plants",
  "Peace Lily Fertilizer",
  "Lavender Fertilizer",
  "Mint Fertilizer",
  "Micronutrient Supplements",
  "Aquatic Plant Fertilizer",
  "Algae Plant Fertilizer",
  "Bamboo Fertilizer",
  "California Plant Food",
  "Calathea Plant Food",
  "Bird of Paradise Fertilizer",
  "Carnivora Plant Fertilizer",
  "Ferns Fertilizer",
  "African Violet Fertilizer",
  "Commercial Plant Food",
  "Lord of Paradise Fertilizer",
  "Fiddle Leaf Fig Plant Food",
  "Fiddle Leaf",
  "Anthurium Fertilizer",
  "Sensitive Fertilizer",
  "Tillandsia Fertilizer",
  "Aloe Vera Fertilizer",
  "Alfalfa Meal Fertilizer",
  "Marijuana Plant Food",
  "Hemp Fertilizer",
  "Canna Plant Food",
  "Aquarium Plant Fertilizer",
  "Liquid Plant Food Advanced",
  "Water Plant Fertilizer",
  "Hydrangea Fertilizer",
  "Monstera Plant Food",
  "Fish Emulsion/Fertilizer",
  "Liquid All Purpose",
  "Pet Friendly Fertilizer",
  "Garden Plant Food",
  "Worm Compost Concentrate",
  "Water Soluble Plant Food",
  "Sulfur for Plants",
  "Phosphorus Fertilizer",
  "Potassium Sulfate for Plants",
  "Commercial Plant Food",
  "Potassium Fertilizer",
  "Ammonium Nitrate Fertilizer",
  "Compost Tea for Plants",
  "Bat Guano Fertilizer"
];

// Plant to recommended product search terms mapping
const plantProductRecommendations: Record<string, string[]> = {
  'Monstera': ['Monstera Plant Food', 'Tropical Plant Fertilizer', 'Indoor Plant Food', 'Liquid Plant Food'],
  'Snake Plant': ['Cactus/Succulent Fertilizer', 'Indoor Plant Food', 'Succulent Plant Supplement'],
  'Fiddle Leaf Fig': ['Fiddle Leaf Fig Plant Food', 'Fiddle Leaf', 'Tree Fertilizer', 'Indoor Plant Food'],
  'Orchid': ['Orchid Fertilizer', 'Liquid Plant Food'],
  'Tomato': ['Vegetable Fertilizer', '10-10-10 NPK Vegetable', 'Tomato Plant Food'],
  'Basil': ['Herb Fertilizer', 'Mint Fertilizer'],
  'Rose': ['Rose Food', 'Flower Plant Food'],
  'Citrus': ['Citrus Fertilizer', 'Orange Tree Fertilizer', 'Lemon Tree Fertilizer'],
  'default': ['All Purpose NPK Fertilizer', 'Fertilizer', 'Plant Food', 'Indoor Plant Food']
};

// Function to fetch products from Shopify based on search terms
async function fetchShopifyProducts(searchTerms: string[]): Promise<any[]> {
  if (!searchTerms.length) return [];
  
  // Create a query string for searching products
  // Using more general search to increase chance of matches
  const queryString = searchTerms
    .map(term => {
      const words = term.split(' ');
      // If term has multiple words, also search for individual words
      if (words.length > 1) {
        return `(title:*${term}* OR ${words.map(word => `title:*${word}*`).join(' OR ')})`;
      }
      return `title:*${term}*`;
    })
    .join(' OR ');
  
  const query = `
    query SearchProducts($queryString: String!) {
      products(first: 10, query: $queryString) {
        edges {
          node {
            id
            title
            handle
            description
            featuredImage {
              url
              altText
            }
            variants(first: 1) {
              edges {
                node {
                  id
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

  try {
    const response = await shopifyFetch({
      query,
      variables: { queryString }
    });

    if (response.status === 200 && response.body?.data?.products?.edges) {
      // Transform Shopify data to match our interface
      return response.body.data.products.edges.map(({ node }: any) => ({
        id: node.id,
        name: node.title,
        description: node.description || `Premium quality ${node.title.toLowerCase()} for your plants.`,
        image: node.featuredImage?.url || '',
        price: parseFloat(node.variants.edges[0]?.node.price.amount || "0"),
        link: `/product/${node.handle}`
      }));
    }
    
    console.error('Error fetching from Shopify:', response.body);
    return [];
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { plantName } = data;
    
    if (!plantName) {
      return NextResponse.json(
        { success: false, error: 'Plant name is required' },
        { status: 400 }
      );
    }
    
    console.log('Getting recommendations for plant:', plantName);
    
    // Find the best matching plant category
    let matchingPlant = 'default';
    let bestMatchScore = 0;
    
    for (const plant of Object.keys(plantProductRecommendations)) {
      if (plant === 'default') continue;
      
      // Check if the plant name contains this plant category
      if (plantName.toLowerCase().includes(plant.toLowerCase())) {
        // Use the length of the match to determine specificity
        const matchScore = plant.length;
        if (matchScore > bestMatchScore) {
          bestMatchScore = matchScore;
          matchingPlant = plant;
        }
      }
    }
    
    console.log('Best matching plant category:', matchingPlant);
    
    // Get recommended products for this plant
    const recommendedProductNames = plantProductRecommendations[matchingPlant];
    console.log('Recommended product names:', recommendedProductNames);
    
    // Fetch real product data from Shopify
    const recommendedProducts = await fetchShopifyProducts(recommendedProductNames);
    console.log('Found products from Shopify:', recommendedProducts.length);
    
    // If no products found, try a broader search with the default category
    if (recommendedProducts.length === 0 && matchingPlant !== 'default') {
      console.log('No specific products found, trying general recommendations');
      const defaultProducts = await fetchShopifyProducts(plantProductRecommendations['default']);
      return NextResponse.json({
        success: true,
        products: defaultProducts.slice(0, 6)
      });
    }
    
    // Limit to 6 products maximum
    const finalProducts = recommendedProducts.slice(0, 6);
    
    return NextResponse.json({
      success: true,
      products: finalProducts
    });
  } catch (error) {
    console.error('Error getting product recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
} 