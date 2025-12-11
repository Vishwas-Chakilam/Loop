# PWA Setup Instructions

Your PWA has been configured with the necessary files. Follow these steps to complete the setup:

## ✅ What's Already Done

1. ✅ Web manifest (`public/manifest.json`) - Configured with app details
2. ✅ Service worker (`public/sw.js`) - Created for offline functionality
3. ✅ HTML updated (`index.html`) - Manifest linked and service worker registered
4. ✅ PWA meta tags added - For better mobile app experience

## 🔧 Next Steps

### 1. Generate Icons

You need to create two icon files in the `public` folder:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

**Option A: Using the HTML Generator (Easiest)**
1. Open `public/generate-icons.html` in your browser
2. Click the download buttons for both icon sizes
3. Save the downloaded files to the `public` folder

**Option B: Using Node.js Script**
1. Install canvas: `npm install canvas`
2. Run: `node scripts/generate-icons.js`
3. Icons will be created in the `public` folder

**Option C: Create Your Own Icons**
- Use any image editor to create 192x192 and 512x512 PNG icons
- Save them as `icon-192.png` and `icon-512.png` in the `public` folder
- Recommended: Use your app logo/branding with Apple Blue (#007AFF) background

### 2. Test the PWA

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open in browser:**
   - Navigate to `http://localhost:3000`
   - Open DevTools (F12) and check the Console for service worker registration

3. **Test Installation:**
   - **Chrome/Edge**: Look for the install icon (⊕) in the address bar
   - **Firefox**: Menu → "Install this site as an app"
   - **Safari (iOS)**: Share → "Add to Home Screen"

### 3. Verify PWA Requirements

Your PWA should meet these requirements for installation:
- ✅ HTTPS or localhost (development)
- ✅ Web manifest with required fields
- ✅ Service worker registered
- ⚠️ Icons (need to be created - see step 1)
- ✅ `display: "standalone"` in manifest

## 🔍 Troubleshooting

### PWA Still Shows as "Shortcut" Instead of "App"

**Common causes:**
1. **Missing icons** - Browsers require icons for full PWA installation
2. **Service worker not registered** - Check browser console for errors
3. **Manifest not accessible** - Verify `/manifest.json` loads correctly
4. **Not on HTTPS/localhost** - PWAs require secure context

**Check these:**
- Open DevTools → Application → Manifest (should show your manifest)
- Open DevTools → Application → Service Workers (should show registered worker)
- Check Console for any errors

### Service Worker Not Registering

- Ensure `public/sw.js` exists and is accessible at `/sw.js`
- Check browser console for registration errors
- Clear browser cache and reload

### Manifest Not Loading

- Verify `public/manifest.json` exists
- Check that it's accessible at `http://localhost:3000/manifest.json`
- Validate JSON syntax (no trailing commas, proper quotes)

## 📱 Testing Checklist

- [ ] Icons created and placed in `public` folder
- [ ] Manifest loads at `/manifest.json`
- [ ] Service worker registers successfully (check console)
- [ ] Install prompt appears in browser
- [ ] App installs and opens in standalone window
- [ ] Offline functionality works (disconnect internet and reload)

## 🚀 Production Deployment

When deploying to production:
1. Ensure HTTPS is enabled (required for PWA)
2. Update `start_url` in manifest if needed
3. Test on multiple browsers/devices
4. Verify icons display correctly
5. Test offline functionality

## 📝 Notes

- The service worker caches essential files for offline use
- Icons are required for PWA installation (browsers will reject without them)
- `display: "standalone"` makes the app feel like a native app
- Service worker scope is set to `/` to cover the entire app

