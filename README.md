# Webflow React Integration: ROI Calculator

This project demonstrates how to integrate a React component (ROI Calculator) into a Webflow website.

## Setup Instructions

### 1. Install Dependencies

Install all required dependencies:

```bash
# First, navigate to the project directory
cd webflow-react-integration

# Install dependencies
npm install --save react react-dom
npm install --save-dev webpack webpack-cli webpack-dev-server
npm install --save-dev @babel/core @babel/preset-env babel-loader @babel/preset-react
npm install --save-dev style-loader css-loader url-loader file-loader
```

### 2. Local Development

Run the development server to test the ROI Calculator locally:

```bash
npm start
```

Then open your browser and navigate to `http://localhost:3000` to see the calculator in action.

### 3. Build for Production

Build the project for production:

```bash
npm run build
```

This will create a `bundle.js` file in the `dist` directory.

### 4. Deployment Options

#### Deploy to AWS S3

To deploy the bundle to AWS S3:

1. Update the `deploy` script in `package.json` with your S3 bucket name.
2. Configure AWS CLI with your credentials.
3. Run the deployment script:

```bash
npm run deploy
```

Or to build and deploy in one step:

```bash
npm run bd
```

#### Deploy to Vercel

To deploy with Vercel:

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` to deploy to a preview URL or `vercel --prod` for production

## Integrating with Webflow

### 1. Add React Libraries

In your Webflow project settings, add these scripts to the `<head>` section:

```html
<script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
```

### 2. Add Container Element

In your Webflow page, add a div element with the ID `roi-calculator-root` where you want the calculator to appear.

### 3. Add Bundle Script

Add your bundle script before the closing `</body>` tag:

```html
<!-- If using AWS S3 -->
<script src="https://your-bucket-name.s3.your-region.amazonaws.com/bundle.js"></script>

<!-- If using Vercel -->
<script src="https://your-project-name.vercel.app/bundle.js"></script>
```

### 4. Publish Your Webflow Site

Publish your Webflow site to see the ROI Calculator in action.

## Troubleshooting

If the calculator doesn't appear:
- Check the browser console for errors
- Verify that all scripts are loading correctly (no 404 errors)
- Make sure the div with ID `roi-calculator-root` exists on the page
- Ensure CORS is properly configured in your S3 bucket if you're hosting there