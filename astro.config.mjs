// @ts-check
import { defineConfig } from 'astro/config';

// Static output — deploys to Vercel (or any static host) with zero backend.
// The page is the designer kit: vanilla HTML/CSS/JS (in /public/landing) served
// by Astro. No framework runtime in the bundle.
export default defineConfig({
  site: 'https://panchito.dev',
  prefetch: true,
  devToolbar: { enabled: false },
});
