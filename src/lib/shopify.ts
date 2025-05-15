export const SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'd5720278d38b25e4bc1118b31ff0f045';
export const SHOPIFY_STORE_DOMAIN = 'https://checkout.tpsplantfoods.com';

export async function shopifyFetch({ query, variables }: { query: string; variables?: any }) {
  const endpoint = `${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    return {
      status: result.status,
      body: await result.json(),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      status: 500,
      error: 'Error receiving data',
    };
  }
}

const storefrontFetch = async (query: string, variables = {}) => {
  const response = await fetch(`${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const json = await response.json();

  if (json.errors) {
    console.error('Shopify Storefront API Error:', json.errors);
    throw new Error('Failed to fetch from Shopify Storefront API');
  }

  return json.data;
};

export const searchProducts = async (searchQuery: string) => {
  const query = `
    query searchProducts($query: String!) {
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
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                  quantityAvailable
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await storefrontFetch(query, { query: searchQuery });
  
  return data.products.edges.map(({ node }: any) => ({
    id: node.id,
    title: node.title,
    description: node.description,
    handle: node.handle,
    featuredImage: {
      url: node.featuredImage?.url || '/placeholder-image.jpg',
      altText: node.featuredImage?.altText || node.title
    },
    images: {
      edges: node.images?.edges || []
    },
    variants: {
      edges: node.variants?.edges || [{
        node: {
          id: 'default',
          title: 'Default',
          price: {
            amount: '0',
            currencyCode: 'USD'
          },
          selectedOptions: [],
          quantityAvailable: 0
        }
      }]
    }
  }));
};

/**
 * Prefetches common product data that might be needed across the application
 * to improve loading performance.
 */
export const prefetchCommonProductData = async () => {
  // Simple prefetch query to get basic product information
  const query = `
    query FeaturedProducts {
      products(first: 12, sortKey: BEST_SELLING) {
        edges {
          node {
            id
            title
            handle
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
    return await shopifyFetch({ query });
  } catch (error) {
    console.error("Error prefetching products:", error);
    return null;
  }
};

// Cache for product data to avoid duplicate requests
let productCache: Record<string, any> = {};

/**
 * Gets product data with caching to avoid redundant fetches
 */
export const getProductWithCache = async (handle: string) => {
  // Return from cache if available
  if (productCache[handle]) {
    return productCache[handle];
  }

  const query = `
    query ProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        featuredImage {
          url
          altText
        }
        images(first: 5) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
              quantityAvailable
            }
          }
        }
      }
    }
  `;

  try {
    const response = await shopifyFetch({
      query,
      variables: { handle }
    });

    if (response.status === 200 && response.body?.data?.product) {
      // Store in cache
      productCache[handle] = response.body.data.product;
      return response.body.data.product;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching product ${handle}:`, error);
    return null;
  }
};

// Clear cache when it gets too large (optional)
export const clearProductCache = () => {
  productCache = {};
};

// Creates a Shopify checkout URL from cart items
export const createCheckoutUrl = async (cart: any[], discountCode?: string) => {
  if (!cart || cart.length === 0) return null;
  
  try {
    // Format: /cart/{variant_id}:{quantity},{variant_id}:{quantity}
    const cartItemsString = cart.map(item => {
      // Extract variant ID properly, handling both full URLs and simple IDs
      const variantId = item.variantId.includes('gid://shopify/ProductVariant/') 
        ? item.variantId.replace('gid://shopify/ProductVariant/', '') 
        : item.variantId;
      
      return `${variantId}:${item.quantity}`;
    }).join(',');

    // Create checkout URL with cart parameters
    // Note: This will display the Shopify password page if the store is password protected
    // The user must enter the password first to proceed to checkout
    let url = `${SHOPIFY_STORE_DOMAIN}/cart/${cartItemsString}`;
    
    // Add discount code if provided
    if (discountCode) {
      url += `?discount=${encodeURIComponent(discountCode)}`;
    }
    
    return url;
  } catch (error) {
    console.error('Error creating checkout URL:', error);
    return null;
  }
};

/**
 * Fetches recommended add-on products for the cart
 * This can be customized with tags or collections for specific recommendations
 */
export const getRecommendedAddons = async (limit = 4) => {
  // First try to fetch products tagged as add-ons or with specific product types
  const query = `
    query RecommendedAddons($first: Int!) {
      products(first: $first, sortKey: BEST_SELLING, query: "tag:addon OR tag:essential OR tag:recommended OR product_type:supplement OR product_type:fertilizer") {
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
            variants(first: 3) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                  quantityAvailable
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
      variables: { first: limit }
    });

    const edges = response.status === 200 ? response.body?.data?.products?.edges : null;
    
    // If we got results, return them
    if (edges && edges.length > 0) {
      console.log(`Found ${edges.length} recommended add-on products`);
      return edges.map(({ node }: any) => ({
        id: node.id,
        title: node.title,
        description: node.description || "",
        handle: node.handle,
        featuredImage: {
          url: node.featuredImage?.url || 'https://cdn.shopify.com/s/files/1/0794/2920/1515/files/placeholder-image.jpg',
          altText: node.featuredImage?.altText || node.title
        },
        variant: node.variants.edges[0]?.node || {
          id: node.id.replace("Product", "ProductVariant"),
          title: "Default",
          price: {
            amount: "19.99",
            currencyCode: "USD"
          },
          selectedOptions: [],
          quantityAvailable: 0
        },
        variants: node.variants.edges.map((edge: any) => edge.node)
      }));
    }
    
    // If no tagged products found, fall back to best-selling products
    console.log("No tagged add-ons found, falling back to fetching best sellers");
    const fallbackQuery = `
      query BestSellingProducts($first: Int!) {
        products(first: $first, sortKey: BEST_SELLING) {
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
              variants(first: 3) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    selectedOptions {
                      name
                      value
                    }
                    quantityAvailable
                  }
                }
              }
            }
          }
        }
      }
    `;

    const fallbackResponse = await shopifyFetch({
      query: fallbackQuery,
      variables: { first: limit }
    });

    const fallbackEdges = fallbackResponse.status === 200 ? 
      fallbackResponse.body?.data?.products?.edges : null;
    
    if (fallbackEdges && fallbackEdges.length > 0) {
      console.log(`Found ${fallbackEdges.length} best-selling products`);
      return fallbackEdges.map(({ node }: any) => ({
        id: node.id,
        title: node.title,
        description: node.description || "",
        handle: node.handle,
        featuredImage: {
          url: node.featuredImage?.url || 'https://cdn.shopify.com/s/files/1/0794/2920/1515/files/placeholder-image.jpg',
          altText: node.featuredImage?.altText || node.title
        },
        variant: node.variants.edges[0]?.node || {
          id: node.id.replace("Product", "ProductVariant"),
          title: "Default",
          price: {
            amount: "19.99",
            currencyCode: "USD"
          },
          selectedOptions: [],
          quantityAvailable: 0
        },
        variants: node.variants.edges.map((edge: any) => edge.node)
      }));
    }
    
    // If still no products, try fetching by product names
    console.log("No best sellers found, trying to fetch specific product names");
    const productNamesQuery = `
      query ProductsByTitle($first: Int!) {
        products(first: $first, query: "title:silica OR title:seaweed OR title:cal-mag OR title:magnesium OR title:calcium OR title:fertilizer") {
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
              variants(first: 3) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    selectedOptions {
                      name
                      value
                    }
                    quantityAvailable
                  }
                }
              }
            }
          }
        }
      }
    `;
    
    const productNamesResponse = await shopifyFetch({
      query: productNamesQuery,
      variables: { first: limit }
    });
    
    const productNamesEdges = productNamesResponse.status === 200 ? 
      productNamesResponse.body?.data?.products?.edges : null;
      
    if (productNamesEdges && productNamesEdges.length > 0) {
      console.log(`Found ${productNamesEdges.length} products by name`);
      return productNamesEdges.map(({ node }: any) => ({
        id: node.id,
        title: node.title,
        description: node.description || "",
        handle: node.handle,
        featuredImage: {
          url: node.featuredImage?.url || 'https://cdn.shopify.com/s/files/1/0794/2920/1515/files/placeholder-image.jpg',
          altText: node.featuredImage?.altText || node.title
        },
        variant: node.variants.edges[0]?.node || {
          id: node.id.replace("Product", "ProductVariant"),
          title: "Default",
          price: {
            amount: "19.99",
            currencyCode: "USD"
          },
          selectedOptions: [],
          quantityAvailable: 0
        },
        variants: node.variants.edges.map((edge: any) => edge.node)
      }));
    }
    
    // Last attempt - fetch any available products
    console.log("Could not find specific products, fetching any available products");
    const anyProductsQuery = `
      query AnyProducts($first: Int!) {
        products(first: $first) {
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
              variants(first: 3) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    
    const anyProductsResponse = await shopifyFetch({
      query: anyProductsQuery,
      variables: { first: limit }
    });
    
    const anyProductsEdges = anyProductsResponse.status === 200 ? 
      anyProductsResponse.body?.data?.products?.edges : null;
      
    if (anyProductsEdges && anyProductsEdges.length > 0) {
      console.log(`Found ${anyProductsEdges.length} products from the store`);
      return anyProductsEdges.map(({ node }: any) => ({
        id: node.id,
        title: node.title,
        description: node.description || "",
        handle: node.handle,
        featuredImage: {
          url: node.featuredImage?.url || 'https://cdn.shopify.com/s/files/1/0794/2920/1515/files/placeholder-image.jpg',
          altText: node.featuredImage?.altText || node.title
        },
        variant: node.variants.edges[0]?.node || {
          id: node.id.replace("Product", "ProductVariant"),
          title: "Default",
          price: {
            amount: "19.99",
            currencyCode: "USD"
          },
          selectedOptions: []
        },
        variants: node.variants.edges.map((edge: any) => edge.node)
      }));
    }
    
    // If absolutely nothing is found, return an empty array
    console.log("No products found from the Shopify store");
    return [];

  } catch (error) {
    console.error('Error fetching recommended add-ons:', error);
    // Make another attempt with a simpler query if there was an error
    try {
      console.log("Error occurred, attempting to fetch any products");
      const simpleQuery = `
        query SimpleProducts($first: Int!) {
          products(first: $first) {
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
                      id
                      title
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
      
      const simpleResponse = await shopifyFetch({
        query: simpleQuery,
        variables: { first: limit }
      });
      
      const simpleEdges = simpleResponse.status === 200 ? 
        simpleResponse.body?.data?.products?.edges : null;
        
      if (simpleEdges && simpleEdges.length > 0) {
        console.log(`Found ${simpleEdges.length} products with simple query`);
        return simpleEdges.map(({ node }: any) => ({
          id: node.id,
          title: node.title,
          description: node.description || "",
          handle: node.handle,
          featuredImage: {
            url: node.featuredImage?.url || 'https://cdn.shopify.com/s/files/1/0794/2920/1515/files/placeholder-image.jpg',
            altText: node.featuredImage?.altText || node.title
          },
          variant: node.variants.edges[0]?.node || {
            id: node.id.replace("Product", "ProductVariant"),
            title: "Default",
            price: {
              amount: "19.99",
              currencyCode: "USD"
            }
          },
          variants: node.variants.edges.map((edge: any) => edge.node)
        }));
      }
    } catch (finalError) {
      console.error('Final error fetching products:', finalError);
    }
    
    // Return empty array if all attempts fail
    return [];
  }
}; 