export const SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'd5720278d38b25e4bc1118b31ff0f045';
export const SHOPIFY_STORE_DOMAIN = 'https://n3mpgz-ny.myshopify.com';

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