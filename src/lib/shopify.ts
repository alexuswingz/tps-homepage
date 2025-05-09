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