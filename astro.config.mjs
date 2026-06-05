// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Static output — deploys to Vercel with native Astro integration.
// The page is the designer kit: vanilla HTML/CSS/JS (in /public/landing) served
// by Astro. No framework runtime in the bundle.
export default defineConfig({
  site: 'https://panchito.dev',
  output: 'static',
  adapter: vercel(),
  prefetch: true,
  devToolbar: { enabled: false },
});
