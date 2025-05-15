import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/shopify';

// Comment out dynamic export for static build
// export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { plantName } = await request.json();
    
    if (!plantName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Plant name is required' 
      }, { status: 400 });
    }
    
    // Generate search terms based on plant name to find relevant fertilizers
    const searchTerms = generateSearchTerms(plantName);
    
    // Use the searchProducts function from the Shopify lib to get real products
    // We'll search for each term and combine the results
    let allProducts: any[] = [];
    
    for (const term of searchTerms) {
      try {
        const products = await searchProducts(term);
        if (products && products.length > 0) {
          allProducts = [...allProducts, ...products];
          // Once we have 4 products, we can stop searching
          if (allProducts.length >= 4) break;
        }
      } catch (searchError) {
        console.error(`Error searching for term "${term}":`, searchError);
        // Continue with other search terms if one fails
      }
    }
    
    // If we didn't find any specific products, try a fallback search
    if (allProducts.length === 0) {
      try {
        // Try general fertilizer terms
        const fallbackProducts = await searchProducts("fertilizer OR plant food OR nutrient");
        if (fallbackProducts && fallbackProducts.length > 0) {
          allProducts = fallbackProducts;
        }
      } catch (fallbackError) {
        console.error("Error with fallback search:", fallbackError);
      }
    }
    
    // Deduplicate products by ID and limit to 4
    const uniqueProductsMap = new Map();
    allProducts.forEach(product => {
      if (!uniqueProductsMap.has(product.id)) {
        uniqueProductsMap.set(product.id, product);
      }
    });
    
    const recommendations = Array.from(uniqueProductsMap.values())
      .slice(0, 4)
      .map(formatProductResponse);
    
    return NextResponse.json({
      success: true,
      products: recommendations
    });
    
  } catch (error) {
    console.error('Error in product recommendations API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}

// Generate relevant search terms based on plant name
function generateSearchTerms(plantName: string): string[] {
  const plantNameLower = plantName.toLowerCase();
  
  // Base search terms - always include these
  const terms = [`${plantName} fertilizer`, `${plantName} plant food`];
  
  // Map plant categories to specific search terms
  const categoryTerms: Record<string, string[]> = {
    'monstera': ['monstera fertilizer', 'tropical plant food', 'indoor plant fertilizer'],
    'snake plant': ['succulent fertilizer', 'indoor plant food', 'desert plant fertilizer'],
    'fiddle leaf fig': ['fiddle leaf fig fertilizer', 'indoor tree fertilizer', 'tropical plant food'],
    'orchid': ['orchid fertilizer', 'orchid food', 'flowering plant food'],
    'tomato': ['vegetable fertilizer', 'tomato plant food', 'fruiting fertilizer'],
    'basil': ['herb fertilizer', 'herb plant food', 'vegetable fertilizer'],
    'rose': ['rose fertilizer', 'flowering plant food', 'flower fertilizer'],
    'citrus': ['citrus fertilizer', 'citrus plant food', 'fruit tree fertilizer'],
    'cactus': ['cactus fertilizer', 'succulent food', 'desert plant fertilizer'],
    'bonsai': ['bonsai fertilizer', 'bonsai plant food', 'tree fertilizer'],
    'palm': ['palm fertilizer', 'palm plant food', 'tropical plant fertilizer'],
    'succulent': ['succulent fertilizer', 'cactus food', 'desert plant food'],
    'fern': ['fern fertilizer', 'fern plant food', 'indoor plant fertilizer'],
    'hydroponic': ['hydroponic nutrients', 'hydroponic fertilizer', 'water soluble nutrients'],
    'vegetable': ['vegetable fertilizer', 'vegetable plant food', 'garden fertilizer'],
    'flowering': ['flowering plant food', 'bloom fertilizer', 'flower fertilizer'],
    'bamboo': ['bamboo fertilizer', 'bamboo plant food', 'tropical plant fertilizer'],
    'tree': ['tree fertilizer', 'tree food', 'woody plant fertilizer'],
    'anthurium': ['anthurium fertilizer', 'tropical plant food', 'flowering plant fertilizer'],
    'aquatic': ['aquatic plant fertilizer', 'water plant food', 'pond plant fertilizer'],
    'violet': ['african violet fertilizer', 'violet plant food', 'flowering plant fertilizer']
  };
  
  // Find the best matching plant category
  let bestMatch = '';
  let bestMatchLength = 0;
  
  for (const category of Object.keys(categoryTerms)) {
    if (plantNameLower.includes(category) && category.length > bestMatchLength) {
      bestMatch = category;
      bestMatchLength = category.length;
    }
  }
  
  // Add category-specific search terms
  if (bestMatch && categoryTerms[bestMatch]) {
    terms.push(...categoryTerms[bestMatch]);
  } else {
    // If no specific category matches, add general terms
    terms.push('all purpose fertilizer', 'plant food', 'universal plant fertilizer');
  }
  
  // For generic plant names, include common terms
  if (plantNameLower.includes('plant') || plantNameLower.length < 5) {
    terms.push('houseplant fertilizer', 'indoor plant food', 'all purpose plant food');
  }
  
  return [...new Set(terms)]; // Remove duplicates
}

// Format Shopify product data for consistent response
function formatProductResponse(product: any) {
  // Get price from the first variant
  const priceAmount = product.variants?.edges?.[0]?.node?.price?.amount || '0';
  const price = parseFloat(priceAmount);
  
  return {
    id: product.handle || product.id.split('/').pop(),
    name: product.title,
    description: truncateDescription(product.description || `Premium quality fertilizer for your ${product.title}.`),
    price: price,
    image: product.featuredImage?.url || 'https://images.unsplash.com/photo-1611048268330-53de574cae3b',
    link: `/shop/${product.handle || product.id.split('/').pop()}`
  };
}

// Truncate long descriptions
function truncateDescription(description: string, maxLength = 150): string {
  if (description.length <= maxLength) return description;
  
  // Find the last space before maxLength
  const lastSpace = description.substring(0, maxLength).lastIndexOf(' ');
  return description.substring(0, lastSpace) + '...';
} 