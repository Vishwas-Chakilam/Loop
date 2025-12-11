import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const icon192 = path.join(publicDir, 'icon-192.png');
  const icon512 = path.join(publicDir, 'icon-512.png');
  
  function drawLoopIcon(ctx, size) {
    // Background - Apple Blue (#007AFF)
    ctx.fillStyle = '#007AFF';
    ctx.fillRect(0, 0, size, size);
    
    // Draw loop icon (two circles)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(1, size * 0.1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const center = size / 2;
    const radius = size * 0.3;
    
    // Outer circle
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner circle to create loop effect
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.6, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  try {
    const { createCanvas } = await import('canvas');
    
    console.log('Generating icon-192.png...');
    const canvas192 = createCanvas(192, 192);
    const ctx192 = canvas192.getContext('2d');
    drawLoopIcon(ctx192, 192);
    fs.writeFileSync(icon192, canvas192.toBuffer('image/png'));
    console.log('✅ Created icon-192.png');
    
    console.log('Generating icon-512.png...');
    const canvas512 = createCanvas(512, 512);
    const ctx512 = canvas512.getContext('2d');
    drawLoopIcon(ctx512, 512);
    fs.writeFileSync(icon512, canvas512.toBuffer('image/png'));
    console.log('✅ Created icon-512.png');
    
    console.log('\n🎉 All icons generated successfully!');
    console.log('Icons saved to:', publicDir);
    console.log('\n📱 Next steps:');
    console.log('1. Rebuild your app: npm run build');
    console.log('2. Test PWA installation in browser');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('\n❌ Canvas package not found.');
      console.log('\n📦 To generate icons programmatically, install canvas:');
      console.log('   npm install --save-dev canvas');
      console.log('   Then run this script again: npm run generate-icons');
      console.log('\n📝 OR use the browser-based generator (easier):');
      console.log('1. Start dev server: npm run dev');
      console.log('2. Open: http://localhost:3000/auto-generate-icons.html');
      console.log('3. Click "📥 Generate & Download All Icons"');
      console.log('4. Save both files to the public/ folder');
    } else {
      console.error('\n❌ Error generating icons:', error.message);
    }
    process.exit(1);
  }
}

generateIcons();