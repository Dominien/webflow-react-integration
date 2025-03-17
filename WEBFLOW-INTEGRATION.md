# Adding the ROI Calculator to Your Webflow Site

Follow these steps to integrate the ROI Calculator into your Webflow website:

## 1. Add React Libraries

In your Webflow project:
1. Go to the project settings (the gear icon)
2. Find the "Custom Code" section
3. In the "Inside `<head>` tag" field, add the following scripts:

```html
<script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
```

## 2. Create a Container for the Calculator

1. In the Webflow designer, add an HTML Embed element where you want the calculator to appear
2. Add the following code inside the HTML Embed:

```html
<div id="roi-calculator-root" style="width: 100%; max-width: 600px; margin: 0 auto;"></div>
```

## 3. Add the Calculator Script

1. Go back to the project settings and Custom Code section
2. In the "Before `</body>` tag" field, add the following script:

```html
<!-- If using AWS S3 -->
<script src="https://your-bucket-name.s3.your-region.amazonaws.com/bundle.js"></script>

<!-- If using Vercel -->
<script src="https://your-project-name.vercel.app/bundle.js"></script>
```

Choose the appropriate script based on your deployment method.

## 4. Publish Your Webflow Site

After adding all the necessary code, save and publish your Webflow site to see the ROI Calculator in action.

## Alternative: All-in-One Embed

If you prefer to add everything in one place, you can use this HTML embed code:

```html
<div id="roi-calculator-root" style="width: 100%; max-width: 600px; margin: 0 auto;"></div>

<script>
  // Check if React is already loaded, if not load it
  if (typeof React === 'undefined') {
    var reactScript = document.createElement('script');
    reactScript.src = 'https://unpkg.com/react@18.2.0/umd/react.production.min.js';
    reactScript.onload = loadReactDOM;
    document.head.appendChild(reactScript);
  } else {
    loadReactDOM();
  }
  
  // Load ReactDOM after React
  function loadReactDOM() {
    if (typeof ReactDOM === 'undefined') {
      var reactDOMScript = document.createElement('script');
      reactDOMScript.src = 'https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js';
      reactDOMScript.onload = loadCalculator;
      document.head.appendChild(reactDOMScript);
    } else {
      loadCalculator();
    }
  }
  
  // Load the calculator script last
  function loadCalculator() {
    var calculatorScript = document.createElement('script');
    // Update with your deployment URL:
    
    // If using AWS S3:
    // calculatorScript.src = 'https://your-bucket-name.s3.your-region.amazonaws.com/bundle.js';
    
    // If using Vercel:
    calculatorScript.src = 'https://your-project-name.vercel.app/bundle.js';
    
    document.body.appendChild(calculatorScript);
  }
</script>
```

Replace the URL with your actual deployment URL.

## Troubleshooting

If the calculator doesn't appear:
- Check the browser console for errors
- Make sure the div with ID `roi-calculator-root` exists on the page
- Verify that all scripts are loading correctly (no 404 errors)
- If you get CORS errors, make sure your S3 bucket has CORS configured properly
- Try adding `crossorigin="anonymous"` to script tags if you encounter CORS issues