This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Development Modes

This project supports two development modes:

1. **Static Export Mode** (default): Uses client-side implementation for API features
   ```bash
   npm run dev
   ```

2. **API Mode**: Enables server-side API routes for development
   ```bash
   npm run dev:api
   ```

## Plant Nutrients Feature

The Plant Nutrients feature provides fertilizer recommendations based on identified plants:

- Uses Plant.ID API for plant identification
- Provides product recommendations from our product catalog
- Works in both static export and server-side API environments
- Implements client-side fallbacks for static hosting

### How Product Recommendations Work

The application provides product recommendations using three approaches, with automatic fallback:

1. **Server API** (when available): Uses `/api/get-recommendations` route
2. **Remote API** (when deployed): Calls `https://api.tpsplantfoods.com/api/get-recommendations`
3. **Client-side Fallback** (always available): Uses embedded product data matching algorithm

This ensures the application works in all environments, including:
- Local development with API routes
- Local development without API routes
- Static hosting on S3/CloudFront
- Production with API server
