const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n\x1b[36m====================================================\x1b[0m');
console.log('\x1b[36m🚀 UNIVISION Google OAuth Setup Assistant\x1b[0m');
console.log('\x1b[36m====================================================\x1b[0m\n');

console.log('1. I have already opened the Google Cloud Console in your browser.');
console.log('2. Please configure the OAuth Consent Screen (select "External", set App Name as "Univision" and save).');
console.log('3. Go to Credentials -> Create Credentials -> OAuth client ID.');
console.log('4. Select "Web application", and add this Redirect URI:');
console.log('   \x1b[32mhttps://univision-1.vercel.app/api/auth/callback/google\x1b[0m\n');

rl.question('🔑 Enter your Google Client ID: ', (clientId) => {
  if (!clientId.trim()) {
    console.log('\x1b[31m❌ Error: Client ID cannot be empty.\x1b[0m');
    process.exit(1);
  }

  rl.question('🔑 Enter your Google Client Secret: ', (clientSecret) => {
    if (!clientSecret.trim()) {
      console.log('\x1b[31m❌ Error: Client Secret cannot be empty.\x1b[0m');
      process.exit(1);
    }

    try {
      console.log('\n\x1b[33m⏳ Configuring Vercel environment variables...\x1b[0m');
      
      // Set GOOGLE_CLIENT_ID
      execSync(`npx vercel env add GOOGLE_CLIENT_ID production --value "${clientId.trim()}" --yes --force`, { stdio: 'inherit' });
      
      // Set GOOGLE_CLIENT_SECRET
      execSync(`npx vercel env add GOOGLE_CLIENT_SECRET production --value "${clientSecret.trim()}" --yes --force`, { stdio: 'inherit' });

      console.log('\n\x1b[32m✅ Variables successfully added to Vercel production!\x1b[0m');
      console.log('\x1b[33m⏳ Triggering production build redeployment...\x1b[0m');

      execSync('npx vercel --prod --yes', { stdio: 'inherit' });

      console.log('\n\x1b[32m🎉 SUCCESS! Google Sign-In is now enabled and fully live on Vercel!\x1b[0m\n');
    } catch (error) {
      console.log('\n\x1b[31m❌ Failed to configure environment or deploy. Make sure Vercel CLI is logged in.\x1b[0m\n');
    } finally {
      rl.close();
    }
  });
});
