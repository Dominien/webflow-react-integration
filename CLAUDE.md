# CLAUDE.md - WebFlow React Integration Assistant Guide

## Build Commands
- Start dev server: `npm start` (http://localhost:3000)
- Build production: `npm run build` (creates dist/bundle.js)
- Deploy to S3: `npm run deploy` (update bucket name in package.json first)
- Build & deploy: `npm run bd`
- Deploy to Vercel: `vercel` or `vercel --prod` (after installing Vercel CLI)

## Code Style Guidelines
- **Formatting:** 2 space indentation
- **Naming:** PascalCase for components, camelCase for variables/functions
- **React Pattern:** Functional components with hooks (useState)
- **CSS:** Separate CSS files imported in component JS files
- **Error Handling:** Console logging, DOM element validation
- **Imports:** Clean ES6 imports at top of file
- **Exports:** Standard export default at bottom of file

## Project Structure
- Entry: src/index.js initializes ROI calculator on DOM load
- Components: Reusable React components in src/components/
- Build: webpack for bundling with babel for transpilation
- Integration: Global window exposure for Webflow initialization
- Deployment: S3 or Vercel (use Vercel URL instead of S3 URL in Webflow integration)