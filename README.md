# Safe Deal Extension

## Development

### Hot Reloading

This project uses `webpack-ext-reloader` for hot reloading during development. When you run the development script, any changes to your code will automatically trigger a reload of the extension in your browser.

#### How to use

1. Run the development script:

   ```
   yarn dev
   ```

2. Load the unpacked extension from the `dist` directory into your browser.

3. Make changes to your code, and the extension will automatically reload.

#### Configuration

The webpack-ext-reloader is configured in `webpack/webpack.dev.js` with the following settings:

- Port: 9090
- Content Scripts: All content scripts are configured for hot reloading
- Background Script: The service worker is configured for hot reloading
- Extension Pages: The popup is configured for hot reloading

## Building for Production

To build the extension for production:

```
yarn dist:rel
```

This will create a production build without the hot reloading functionality.
