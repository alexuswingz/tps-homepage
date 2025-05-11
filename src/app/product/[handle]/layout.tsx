import { shopifyFetch } from '@/lib/shopify';

export async function generateStaticParams() {
  try {
    // Fetch all product handles from Shopify
    const allProductHandles = await fetchAllProductHandles();
    
    // Return an array of objects with handle property for each product
    return allProductHandles.map(handle => ({ handle }));
  } catch (error) {
    console.error('Error generating static params:', error);
    // Fallback to hardcoded list in case of error
    return [
      { handle: 'monstera-plant-food' },
      { handle: 'fiddle-leaf-fig-plant-food' },
      { handle: 'snake-plant-fertilizer' },
      { handle: 'pothos-fertilizer' },
      { handle: 'zz-plant-fertilizer' },
      { handle: 'peace-lily-fertilizer' },
      { handle: 'orchid-plant-food' },
      { handle: 'succulent-plant-food' },
      { handle: 'cactus-fertilizer' },
      { handle: 'bonsai-fertilizer' },
      { handle: 'pitcher-plant-food' }
    ];
  }
}

// Function to fetch all product handles from Shopify
async function fetchAllProductHandles(): Promise<string[]> {
  let allHandles: string[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const query = `
      query Products${cursor ? '($cursor: String!)' : ''} {
        products(first: 100${cursor ? ', after: $cursor' : ''}) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              handle
            }
          }
        }
      }
    `;

    try {
      const response = await shopifyFetch({
        query,
        variables: cursor ? { cursor } : undefined
      });

      if (response.status === 200 && response.body?.data?.products?.edges) {
        const { products: { edges, pageInfo } } = response.body.data;
        
        // Extract handles from the response
        const handles = edges.map(({ node }: { node: { handle: string } }) => node.handle);
        allHandles = [...allHandles, ...handles];
        
        // Update pagination info
        hasNextPage = pageInfo.hasNextPage;
        cursor = pageInfo.endCursor;
      } else {
        console.error('Invalid response format:', response);
        break;
      }
    } catch (error) {
      console.error('Error fetching product handles:', error);
      break;
    }
  }

  return allHandles;
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 