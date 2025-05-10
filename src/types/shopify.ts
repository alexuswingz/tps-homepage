export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: MoneyV2;
  compareAtPrice?: MoneyV2;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  quantityAvailable: number;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  featuredImage: {
    url: string;
    altText: string;
  };
  images: {
    edges: {
      node: {
        url: string;
        altText: string;
      };
    }[];
  };
  variants: {
    edges: {
      node: ProductVariant;
    }[];
  };
  // Additional fields for UI
  isBestSeller?: boolean;
  popularityScore?: number;
  reviews?: number;
} 