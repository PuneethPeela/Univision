const { execSync } = require('child_process');
const fs = require('fs');

console.log('--- Environment Check ---');
console.log('Node Version:', process.version);

try {
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (fs.existsSync(chromePath)) {
    console.log('Chrome found at:', chromePath);
  } else {
    console.log('Chrome NOT found at standard macOS path');
  }
} catch (e) {
  console.log('Error checking Chrome path:', e.message);
}

try {
  require.resolve('puppeteer');
  console.log('Puppeteer: available');
} catch (e) {
  console.log('Puppeteer: NOT available in workspace');
}

try {
  require.resolve('playwright');
  console.log('Playwright: available');
} catch (e) {
  console.log('Playwright: NOT available in workspace');
}
