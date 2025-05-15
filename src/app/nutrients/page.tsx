'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiX, FiShoppingCart } from 'react-icons/fi';
import { RiPlantLine, RiLeafLine, RiArrowDownSLine } from 'react-icons/ri';
import Link from 'next/link';
import { searchProducts } from '@/lib/shopify';
import { useCart } from '@/context/CartContext';
import { useCartUI } from '@/app/template';

// Configure API base URL - replace with your actual API server URL when deployed
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Define a function to get the correct API base URL based on the environment
function getApiBaseUrl() {
  // Check if we're in a production environment (static export)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Production API endpoint - use the AWS API Gateway endpoint
    console.log('Using production API endpoint');
    return 'https://sjjd9r6oo7.execute-api.ap-southeast-2.amazonaws.com';
  }
  
  // For development or local testing
  console.log('Using development API endpoint');
  return 'https://sjjd9r6oo7.execute-api.ap-southeast-2.amazonaws.com';
}

interface PlantIdentification {
  name: string;
  probability: number;
  details: {
    common_names: string[];
    scientific_name: string;
    family: string;
    genus: string;
    care_level: string;
    growth_info: {
      soil_ph?: string;
      light?: string;
      atmospheric_humidity?: string;
      soil_nutrient?: string;
    };
  };
  image_url: string;
}

interface RecommendedProduct {
  id: string;
  handle?: string;
  name: string;
  description: string;
  image: string;
  price: number;
  link: string;
  variants?: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        quantityAvailable: number;
        selectedOptions?: Array<{
          name: string;
          value: string;
        }>;
      }
    }>;
  };
  quantityAvailable?: number;
}

const NutrientsPage = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [identifiedPlant, setIdentifiedPlant] = useState<PlantIdentification | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load saved state on component mount
  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return;
    
    // Try to retrieve saved state from sessionStorage
    try {
      const savedImage = sessionStorage.getItem('plantImage');
      const savedPlant = sessionStorage.getItem('identifiedPlant');
      const savedProducts = sessionStorage.getItem('recommendedProducts');
      
      if (savedImage) {
        setImagePreview(savedImage);
      }
      
      if (savedPlant) {
        setIdentifiedPlant(JSON.parse(savedPlant));
      }
      
      if (savedProducts) {
        setRecommendedProducts(JSON.parse(savedProducts));
      }
    } catch (err) {
      console.error('Error loading saved state:', err);
      // If there's an error reading from storage, we'll just start fresh
    }
  }, []);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return;
    
    try {
      if (imagePreview) {
        sessionStorage.setItem('plantImage', imagePreview);
      }
      
      if (identifiedPlant) {
        sessionStorage.setItem('identifiedPlant', JSON.stringify(identifiedPlant));
      }
      
      if (recommendedProducts.length > 0) {
        sessionStorage.setItem('recommendedProducts', JSON.stringify(recommendedProducts));
      }
    } catch (err) {
      console.error('Error saving state:', err);
      // Continue without storage if it fails
    }
  }, [imagePreview, identifiedPlant, recommendedProducts]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Check file size - limit to 5MB to avoid issues with API
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large. Please select an image under 5MB.');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageResult = reader.result as string;
        setImagePreview(imageResult);
        
        // Clear previous results when uploading a new image
        sessionStorage.removeItem('identifiedPlant');
        sessionStorage.removeItem('recommendedProducts');
        setIdentifiedPlant(null);
        setRecommendedProducts([]);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 5 * 1024 * 1024 // 5MB max size
  });

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setIdentifiedPlant(null);
    setRecommendedProducts([]);
    
    // Also clear storage
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('plantImage');
        sessionStorage.removeItem('identifiedPlant');
        sessionStorage.removeItem('recommendedProducts');
      } catch (err) {
        console.error('Error clearing storage:', err);
      }
    }
  };

  const searchPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    setIsSearching(true);
    setError(null);
    setIdentifiedPlant(null);
    setRecommendedProducts([]);

    try {
      console.log('Preparing to submit plant image for identification');
      
      // Convert the image to base64 for the API
      const arrayBuffer = await selectedImage.arrayBuffer();
      const base64Image = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      
      console.log('Image converted to base64');
      
      // Call the Plant.ID API through our Lambda function
      const apiUrl = getApiBaseUrl() + '/identify-plant';
      console.log('Using API URL:', apiUrl);
      
      try {
        console.log('Sending request to identify plant API');
        const identifyResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image
          }),
          mode: 'cors',
        });

        console.log('Identify response status:', identifyResponse.status);
        
        if (!identifyResponse.ok) {
          let errorText;
          try {
            errorText = await identifyResponse.text();
          } catch (e) {
            errorText = 'Could not read error response';
          }
          
          console.error(`API error (${identifyResponse.status}):`, errorText);
          throw new Error(`Server error (${identifyResponse.status}): ${identifyResponse.statusText}`);
        }
        
        const identifyData = await identifyResponse.json();
        console.log('Plant API response received:', identifyData);
        
        // Add detailed logging to help debug the structure
        console.log('Plant API full response structure:', JSON.stringify(identifyData, null, 2));
        
        if (!identifyData.success) {
          throw new Error(identifyData.error || 'Failed to identify plant');
        }
        
        const identifiedPlantData = identifyData.result;
        
        // Log specific details of the identified plant, including image_url
        console.log('Plant identified:', identifiedPlantData.name);
        console.log('Plant image URL:', identifiedPlantData.image_url || 'No image URL provided');
        
        // Ensure the image_url is properly set
        if (!identifiedPlantData.image_url) {
          console.warn('No image URL was provided by the API - will use fallback image');
        }
        
        // Get product recommendations
        try {
          console.log('Calling recommendations API for plant:', identifiedPlantData.name);
          const apiUrl = getApiBaseUrl() + '/get-recommendations';
          console.log('Using API URL:', apiUrl);
          const recommendationsResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ plantName: identifiedPlantData.name }),
          });

          if (!recommendationsResponse.ok) {
            throw new Error(`Failed to get recommendations: ${recommendationsResponse.status}`);
          }

          // Get the product recommendations
          const recommendationsData = await recommendationsResponse.json();
          console.log('Recommendations API response:', recommendationsData);

          if (!recommendationsData.success) {
            throw new Error(recommendationsData.error || 'Failed to get recommendations');
          }

          // Use result from Lambda API response
          let products = recommendationsData.result || [];
          
          // When we receive product data from the API, ensure proper formatting
          const processProductsData = (products: any[]): RecommendedProduct[] => {
            return products.map(product => {
              // Extract the handle properly 
              const handle = product.handle || (product.id ? product.id.split('/').pop() : '');
              
              return {
                id: product.id || '',
                handle: handle, // Store the handle separately
                name: product.title || product.name || 'Unknown Product',
                description: product.description || `Premium quality plant nutrients`,
                image: product.featuredImage?.url || product.image || 'https://images.unsplash.com/photo-1611048268330-53de574cae3b',
                price: parseFloat(product.variants?.edges?.[0]?.node?.price?.amount || '0'),
                link: `/product/${handle}`, // Using correct path format
                variants: product.variants || undefined,
                quantityAvailable: product.variants?.edges?.[0]?.node?.quantityAvailable || 0
              };
            });
          };
          
          // If no products were found or returned from the API, use local recommendations
          if (!products || products.length === 0) {
            console.warn('No products returned from API, using local recommendations');
            const localProducts = await getLocalRecommendations(identifiedPlantData.name);
            products = localProducts;
          } else {
            console.log(`Found ${products.length} products from recommendations API`);
            // Format the products received from the API
            products = processProductsData(products);
          }

          // Log the product titles we found
          console.log('Recommended products:', products.map((p: any) => p.title || p.name || 'Unnamed product'));

          // Update state with the identified plant and product recommendations
          setIdentifiedPlant(identifiedPlantData);
          setRecommendedProducts(products);
          setIsSearching(false);
        } catch (error) {
          console.error('Error in plant identification process:', error);
          setError(error instanceof Error ? error.message : 'An unknown error occurred');
          setIsSearching(false);
        }
      } catch (error) {
        console.error('Error in plant identification:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to identify plant');
      }
    } catch (error) {
      console.error('Error in plant identification process:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSearching(false);
    }
  };

  // Helper function to get care level for plants
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

  // Helper function to get growth information for plants
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

  // Replace the mock implementation with a real one that uses the Shopify API
  async function getLocalRecommendations(plantName: string): Promise<RecommendedProduct[]> {
    try {
      // Generate search terms based on plant name to find relevant fertilizers
      const searchTerms = generateSearchTerms(plantName);
      
      // Use the searchProducts function from the Shopify lib to get real products
      let allProducts: any[] = [];
      
      for (const term of searchTerms) {
        try {
          const products = await searchProducts(term);
          console.log('Search products result for term:', term, products && products.length ? `Found ${products.length} products` : 'No products found');
          if (products && products.length > 0) {
            // Log the first product's structure to see what fields we have
            console.log('Example product structure:', JSON.stringify(products[0], null, 2));
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
      
      // Get the final products to return
      const finalProducts = Array.from(uniqueProductsMap.values())
        .slice(0, 4)
        .map(formatProductResponse);
        
      // Log the final formatted products for debugging
      console.log('Final formatted products:', finalProducts.map(p => ({
        id: p.id,
        handle: p.handle,
        name: p.name,
        link: p.link
      })));
        
      return finalProducts;
    } catch (error) {
      console.error('Error in local recommendations:', error);
      // If all else fails, return empty array
      return [];
    }
  }

  // Format Shopify product data for consistent response
  function formatProductResponse(product: any): RecommendedProduct {
    // Get price from the first variant
    const priceAmount = product.variants?.edges?.[0]?.node?.price?.amount || '0';
    const price = parseFloat(priceAmount);
    
    // Get quantity available from the first variant
    const quantityAvailable = product.variants?.edges?.[0]?.node?.quantityAvailable || 0;
    
    // Extract the handle from the product data
    const handle = product.handle || (product.id ? product.id.split('/').pop() : '');
    
    console.log('Formatting product response:', {
      id: product.id,
      handle: handle,
      title: product.title,
      productData: product
    });
    
    return {
      id: product.id,
      handle: handle,
      name: product.title,
      description: truncateDescription(product.description || `Premium quality fertilizer for your ${product.title}.`),
      price: price,
      image: product.featuredImage?.url || 'https://images.unsplash.com/photo-1611048268330-53de574cae3b',
      link: `/product/${handle}`,
      variants: product.variants,
      quantityAvailable: quantityAvailable
    };
  }

  // Truncate long descriptions
  function truncateDescription(description: string, maxLength = 150): string {
    if (description.length <= maxLength) return description;
    
    // Find the last space before maxLength
    const lastSpace = description.substring(0, maxLength).lastIndexOf(' ');
    return description.substring(0, lastSpace) + '...';
  }

  // Generate relevant search terms based on plant name
  function generateSearchTerms(plantName: string): string[] {
    const plantNameLower = plantName.toLowerCase();
    
    // Product catalog - comprehensive list based on products you shared
    const productCatalog = [
      "Drought Fertilizer",
      "Cactus Food",
      "Fish Super Food",
      "Desert Plants Fertilizer",
      "Indoor Plant Food",
      "Exotic Bulb Fertilizer",
      "Potted Plant Food",
      "Terrarium Fertilizer",
      "Fern Food",
      "Hydroponics Fertilizer",
      "House Plant Food",
      "Azalea Fertilizer",
      "Orchid Food",
      "Rhododendron Fertilizer",
      "Succulent Food",
      "Hanging Basket Plant Food",
      "Flowering Plant Food",
      "Tomato Fertilizer",
      "High Bulb Fertilizer",
      "Herb Fertilizer",
      "Tropical Plant Food",
      "Bulk Fertilizer",
      "Acid Plant Fertilizer",
      "Lily Bulb Fertilizer",
      "Rose Fertilizer",
      "Berry Fertilizer",
      "Pepper Fertilizer",
      "Fruit Food",
      "Strawberry Fertilizer",
      "Rubber Plant Food",
      "Monstera Deliciosa Plant Food",
      "Vegetable Fertilizer",
      "Tropical Fertilizer",
      "Garlic Fertilizer",
      "Sweet Potato Fertilizer",
      "Garden Fertilizer",
      "Plant Food Outdoor",
      "Plant Food",
      "All In One Fertilizer",
      "All Purpose NPK Fertilizer",
      "Cacti Monstera Fertilizer",
      "Monstera Plant Supplement",
      "Philadendron Fertilizer",
      "Fiddle Leaf Fig Plant Food"
    ];
    
    // Base search terms - always include these
    const terms = [`${plantName} fertilizer`, `${plantName} plant food`];
    
    // Plant categories that match specific product types
    const specificPlantMatches: Record<string, string[]> = {
      'monstera': [
        'Monstera Deliciosa Plant Food',
        'Monstera Plant Supplement', 
        'Indoor Plant Food',
        'Tropical Plant Food',
        'Tropical Fertilizer',
        'Tropical Plant Fertilizer',
        'Cacti Monstera Fertilizer',
        'Potted Plant Food',
        'House Plant Food'
      ],
      'succulent': [
        'Succulent Food', 
        'Succulent Root Supplement', 
        'Succulent Plant Supplement',
        'Cactus Food',
        'Cactus Fertilizer',
        'Desert Plants Fertilizer',
        'Drought Fertilizer'
      ],
      'orchid': [
        'Orchid Food',
        'Flowering Plant Food'
      ],
      'fiddle leaf': [
        'Fiddle Leaf Fig Plant Food',
        'Indoor Plant Food',
        'Tropical Plant Food'
      ],
      'snake plant': [
        'Indoor Plant Food',
        'House Plant Food',
        'Drought Fertilizer'
      ],
      'philodendron': [
        'Philadendron Fertilizer',
        'Indoor Plant Food',
        'Tropical Plant Food'
      ],
      'fern': [
        'Fern Food',
        'Fern Fertilizer'
      ],
      'pothos': [
        'Indoor Plant Food',
        'House Plant Food'
      ],
      'cactus': [
        'Cactus Food',
        'Cactus Fertilizer',
        'Drought Fertilizer',
        'Desert Plants Fertilizer'
      ]
    };
    
    // Find the best matching plant category
    let bestMatch = '';
    let bestMatchLength = 0;
    
    for (const plantType of Object.keys(specificPlantMatches)) {
      if (plantNameLower.includes(plantType) && plantType.length > bestMatchLength) {
        bestMatch = plantType;
        bestMatchLength = plantType.length;
      }
    }
    
    // Add specific product names for the matched plant type
    if (bestMatch && specificPlantMatches[bestMatch]) {
      console.log(`Found specific match for ${plantName}: ${bestMatch}`);
      const searchProducts = specificPlantMatches[bestMatch];
      terms.push(...searchProducts);
      console.log(`Adding specific product searches: ${searchProducts}`);
    } else {
      // If no specific match, add general terms based on plant categories
      const generalTerms = ['Plant Food', 'Plant Fertilizer', 'All Purpose NPK Fertilizer'];
      terms.push(...generalTerms);
      console.log(`No specific match found for ${plantName}, using general terms`);
      
      // For generic plant names, include common terms
      if (plantNameLower.includes('plant') || plantNameLower.length < 5) {
        const additionalTerms = ['Indoor Plant Food', 'House Plant Food'];
        terms.push(...additionalTerms);
        console.log(`Adding generic plant terms: ${additionalTerms}`);
      }
    }
    
    // Filter for exact matches in the product catalog
    const exactMatches: string[] = [];
    for (const product of productCatalog) {
      const productLower = product.toLowerCase();
      if (productLower.includes(plantNameLower)) {
        exactMatches.push(product);
      }
    }
    
    // If we found any exact matches in the product catalog, prioritize them
    if (exactMatches.length > 0) {
      console.log(`Found exact product matches for ${plantName}: ${exactMatches}`);
      return [...new Set([...exactMatches, ...terms])];
    }
    
    return [...new Set(terms)]; // Remove duplicates
  }

  // Create a separate ProductCard component to handle state for each product
  const ProductCard = ({ product }: { product: RecommendedProduct }) => {
    const [selectedVariant, setSelectedVariant] = useState(product.variants?.edges?.[0]?.node);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const { openCart } = useCartUI();
    
    // Get the available quantity from the selected variant or default value
    const availableQuantity = selectedVariant?.quantityAvailable || product.quantityAvailable || 0;
    
    // Format price properly
    const price = selectedVariant ? parseFloat(selectedVariant.price.amount) : product.price;
    
    const handleAddToCart = () => {
      if (!selectedVariant) return;
      
      addToCart({
        variantId: selectedVariant.id,
        productId: product.id,
        title: product.name,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        image: {
          url: product.image,
          altText: product.name
        },
        quantity: quantity
      });
      
      // Show confirmation animation and open cart drawer
      openCart();
    };
    
    // Format product title to match shop style
    const formatProductTitle = (title: string) => {
      const regex = /(.*?)(\s+(Fertilizer|Food|Plant Food|Supplement))$/i;
      const match = title.match(regex);
      if (match) {
        return (
          <>
            <span className="font-black">{match[1].trim()}</span>
            {" | "}
            <span className="font-medium text-[11px] sm:text-base text-gray-700">{match[3]}</span>
          </>
        );
      }
      const [first, ...rest] = title.split(' ');
      return (
        <>
          <span className="font-black">{first}</span>
          {rest.length ? <span className="font-medium text-[11px] sm:text-base text-gray-700">{' ' + rest.join(' ')}</span> : ''}
        </>
      );
    };
    
    return (
      <div className="rounded-2xl sm:rounded-3xl p-3 sm:p-5 bg-[#F2F7F2] transition-transform hover:scale-[1.02] flex flex-col h-full relative shadow-sm">
        {/* Bestseller badge */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-[#FF6B6B] text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold z-10">
          Recommended
        </div>
        
        <Link href={product.link} className="relative h-[140px] sm:h-[220px] flex-grow mb-2 sm:mb-4">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain mix-blend-multiply"
            sizes="(max-width: 640px) 140px, (max-width: 768px) 220px, 300px"
            loading="lazy"
          />
        </Link>
        
        <div className="flex flex-col justify-end space-y-1.5 sm:space-y-2">
          <div className="flex items-center mb-0.5 sm:mb-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-[#FF6B6B] fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-1 text-[10px] sm:text-xs text-gray-600">Reviews</span>
          </div>
          
          <h3 
            className="text-sm sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-3 line-clamp-2 leading-tight"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {formatProductTitle(product.name)}
          </h3>
          
          <div className="flex items-center w-full gap-0 mt-auto">
            <div className="w-[50%] relative">
              <select 
                className="w-full appearance-none bg-white rounded-l-full pl-2 sm:pl-3 pr-6 sm:pr-8 py-1.5 sm:py-2.5 border border-r-0 border-gray-200 text-[11px] sm:text-sm focus:outline-none focus:border-[#FF6B6B]"
                value={selectedVariant?.id || ""}
                onChange={(e) => {
                  const variant = product.variants?.edges.find(v => v.node.id === e.target.value)?.node;
                  if (variant) setSelectedVariant(variant);
                }}
              >
                {product.variants?.edges?.map(({ node }) => (
                  <option key={node.id} value={node.id}>
                    {node.title}
                  </option>
                )) || (
                  <option value="default">Default</option>
                )}
              </select>
              <div className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div className="w-[25%] bg-white border-y border-gray-200 flex items-center justify-center py-1.5 sm:py-2.5">
              <span className="text-[11px] sm:text-sm font-medium text-gray-900">
                ${price.toFixed(2)}
              </span>
            </div>
            
            <button 
              className="w-[25%] bg-[#FF6B6B] py-1.5 sm:py-2.5 rounded-r-full hover:bg-[#ff5252] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={availableQuantity <= 0}
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              <FiShoppingCart className="w-3 h-3 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FDF6EF] to-white">
      {/* Hero Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Find Your Plant's Perfect Nutrients
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload a photo of your plant, and we'll analyze its needs to recommend the best nutrients for optimal growth
          </p>
        </motion.div>

        {/* Search Form */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 mb-12 max-w-4xl mx-auto">
          <form onSubmit={searchPlant} className="space-y-8">
            {/* Image Upload Zone */}
            <div className="relative">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive ? 'border-[#4CAF50] bg-[#4CAF50]/5' : 'border-gray-300 hover:border-[#4CAF50] hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                {imagePreview ? (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={300}
                      height={300}
                      className="mx-auto rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearImage();
                      }}
                      className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-all duration-200"
                    >
                      <FiX className="text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <FiUploadCloud className="text-5xl text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        Drag & drop your plant photo here
                      </p>
                      <p className="text-gray-500">or click to browse</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tips for Best Results */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-2">Tips for Best Results:</h3>
              <ul className="text-blue-700 text-sm space-y-2 list-disc pl-5">
                <li>Use clear, well-lit images of your plant</li>
                <li>Focus on distinctive features like leaves or flowers</li>
                <li>Keep image files under 5MB in size</li>
                <li>If using a mobile device, ensure your camera has permission to access the site</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSearching || !selectedImage}
              className={`w-full py-4 px-6 rounded-2xl text-white font-medium text-lg transition-all duration-200 ${
                isSearching || !selectedImage
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#4CAF50] hover:bg-[#43A047] transform hover:-translate-y-1'
              }`}
            >
              {isSearching ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </div>
              ) : (
                'Identify Plant'
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 text-center"
            >
              <div className="text-red-600 font-medium text-lg mb-2">{error}</div>
              <p className="text-gray-700">
                Please ensure your image clearly shows the plant, with good lighting and focus.
                The plant identification service works best with close-up images of leaves or distinctive features.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    clearImage();
                    setError(null);
                  }}
                  className="px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors duration-200"
                >
                  Try Another Image
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  Refresh Page
                </button>
              </div>
            </motion.div>
          )}

          {identifiedPlant && (
            <motion.div
              key="plant-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Plant Information Card */}
              <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F2F7F2]">
                      {imagePreview ? (
                        <Image
                          src={imagePreview}
                          alt={identifiedPlant.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          priority
                        />
                      ) : (
                        <Image
                          src="https://images.unsplash.com/photo-1542728928-1413d1894ed1?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGxhbnQlMjBsZWFmfGVufDB8fDB8fHww"
                          alt="Plant placeholder"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          priority
                        />
                      )}
                      
                      {/* Confidence level indicator */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[#4CAF50] h-2 rounded-full" 
                              style={{ width: `${Math.round(identifiedPlant.probability * 100)}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs whitespace-nowrap">
                            {Math.round(identifiedPlant.probability * 100)}% match
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Scientific classification */}
                    <div className="mt-4 bg-[#F2F7F2] rounded-2xl p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Scientific Classification</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Scientific Name:</span>
                          <span className="font-medium italic">{identifiedPlant.details.scientific_name}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Family:</span>
                          <span className="font-medium">{identifiedPlant.details.family || "Unknown"}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Genus:</span>
                          <span className="font-medium">{identifiedPlant.details.genus || "Unknown"}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="w-full md:w-2/3 space-y-6">
                    <div>
                      <div className="flex items-center mb-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mr-2">
                          {identifiedPlant.name}
                        </h2>
                        <span className="bg-[#FF6B6B] text-white px-2 py-1 text-xs rounded-full">Identified</span>
                      </div>
                      
                      {identifiedPlant.details.common_names && identifiedPlant.details.common_names.length > 0 && (
                        <p className="text-gray-600 mb-4">
                          Also known as: {identifiedPlant.details.common_names.slice(0, 3).join(", ")}
                          {identifiedPlant.details.common_names.length > 3 && "..."}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <RiPlantLine className="text-[#4CAF50]" />
                          <span className="font-medium">Care Level</span>
                        </div>
                        <p className="text-gray-900">{identifiedPlant.details.care_level}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <RiLeafLine className="text-[#4CAF50]" />
                          <span className="font-medium">Type</span>
                        </div>
                        <p className="text-gray-900">
                          {identifiedPlant.name.toLowerCase().includes("indoor") ? "Indoor Plant" : 
                           identifiedPlant.name.toLowerCase().includes("outdoor") ? "Outdoor Plant" : 
                           "House Plant"}
                        </p>
                      </div>
                    </div>
                    
                    {identifiedPlant.details.growth_info && (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Growth Requirements</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.entries(identifiedPlant.details.growth_info).map(([key, value]) => (
                            value && (
                              <div key={key} className="bg-gray-50 rounded-xl p-4">
                                <p className="text-gray-600 capitalize mb-1">
                                  {key.replace(/_/g, ' ')}
                                </p>
                                <p className="text-gray-900 font-medium">{value}</p>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Care tips based on plant type */}
                    <div className="bg-[#F2F7F2] rounded-2xl p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Care Tips</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Water {identifiedPlant.details.care_level === "Beginner-friendly" ? "moderately" : "regularly"} and allow soil to dry between waterings.</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Place in {identifiedPlant.details.growth_info?.light?.toLowerCase() || "bright, indirect light"} for optimal growth.</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Use recommended fertilizers below for the best results.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Products */}
              {recommendedProducts.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Recommended Products
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {recommendedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-8 text-center">
                  <RiPlantLine className="text-4xl text-[#4CAF50] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    We couldn't find specific products for this plant. Please check our 
                    <Link href="/shop" className="text-[#4CAF50] font-medium mx-1 hover:underline">
                      shop
                    </Link>
                    for our full range of plant care products.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default NutrientsPage; 