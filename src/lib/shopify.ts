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