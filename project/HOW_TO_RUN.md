# 🚀 How to Run Loop - Habit Tracker PWA

This guide shows you all the ways to run your PWA app.

---

## 📋 Prerequisites

Make sure you have:
- **Node.js** installed (v18 or higher)
- **npm** package manager
- A modern web browser (Chrome, Edge, Firefox, Safari)

---

## 🔧 Method 1: Development Mode (Hot Reload)

**Best for**: Making changes and testing new features

### Steps:

```bash
# 1. Open PowerShell/Terminal and navigate to project
cd c:\Users\Admin\Downloads\Loop\project

# 2. Allow script execution (first time only)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 3. Start development server
npm run dev
```

### What happens:
- Metro bundler starts
- Server runs on `http://localhost:8081`
- Press **`w`** when prompted to open in browser
- Changes auto-refresh when you save files

---

## 🌐 Method 2: Production Build (Optimized)

**Best for**: Testing the final production version

### Quick Way (One Command):

```bash
cd c:\Users\Admin\Downloads\Loop\project
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run start:prod
```

### Step-by-Step Way:

```bash
# 1. Navigate to project
cd c:\Users\Admin\Downloads\Loop\project

# 2. Allow scripts (if needed)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 3. Build the web app
npm run build:web

# 4. Serve the built files
npm run serve
```

### What happens:
- Creates optimized build in `dist/` folder
- Starts server on `http://localhost:3000`
- Open browser to `http://localhost:3000`

---

## 🌍 Method 3: Serve Already Built Files

If you've already built the app and just want to serve it:

```bash
cd c:\Users\Admin\Downloads\Loop\project
npm run serve
```

Then open: `http://localhost:3000`

---

## 📱 Installing as PWA

Once the app is running in your browser:

### Chrome/Edge:
1. Click the **⊕** icon in the address bar
2. Click "Install Loop"
3. App opens in standalone window

### Firefox:
1. Click menu (⋮)
2. Select "Install this site as an app"

### Safari (iOS):
1. Tap Share button
2. Select "Add to Home Screen"

---

## ⚙️ Available npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build:web` | Build optimized production files |
| `npm run serve` | Serve already built files from dist/ |
| `npm run start:prod` | Build + serve in one command |
| `npm run lint` | Run code linting |

---

## 🔍 Troubleshooting

### "Scripts are disabled" Error
```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Port Already in Use
If port 3000 or 8081 is busy, you can specify a different port:
```bash
npx serve dist -p 4000
```

### Build Errors
Clear cache and reinstall:
```bash
rm -rf node_modules
npm install
npm run build:web
```

---

## 🔗 Important URLs

- **Development**: http://localhost:8081
- **Production**: http://localhost:3000
- **Your .env file**: Make sure Supabase credentials are set

---

## 📦 Deploying to Production

### Deployment Options:

1. **Vercel** (Recommended - Free)
   ```bash
   npm install -g vercel
   vercel deploy dist
   ```

2. **Netlify**
   - Drag & drop the `dist` folder to netlify.com

3. **GitHub Pages**
   - Push the `dist` folder contents to gh-pages branch

4. **Any Static Host**
   - Upload contents of `dist/` folder

---

## 💡 Pro Tips

- **PWA Features**: Only work on HTTPS or localhost
- **Notifications**: Require user permission
- **Offline Mode**: Works after first load
- **Dark Mode**: Saved per user in database
- **Time Zone**: Uses system local time

---

## 📞 Need Help?

- Check browser console (F12) for errors
- Verify `.env` file has Supabase credentials
- Ensure Node.js version is 18+

---

**Developer**: Vishwas Chakilam  
**Version**: 1.0.0  
**Build Date**: December 2025
