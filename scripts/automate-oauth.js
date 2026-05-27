const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function run() {
  console.log('Starting OAuth setup script...');

  // Ensure puppeteer is installed
  try {
    require.resolve('puppeteer');
    console.log('Puppeteer is already installed.');
  } catch (e) {
    console.log('Installing puppeteer locally...');
    execSync('npm install puppeteer --no-save', { stdio: 'inherit' });
  }

  const puppeteer = require('puppeteer');

  let browser;
  // Try connecting to existing debug Chrome first
  try {
    console.log('Attempting to connect to Chrome remote debugging on port 9222...');
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222'
    });
    console.log('Connected to existing Chrome instance!');
  } catch (e) {
    console.log('Could not connect to port 9222. Launching new Chrome instance with User Profile...');
    try {
      browser = await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        userDataDir: '/Users/apple/Library/Application Support/Google/Chrome',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-features=IsolateOrigins,site-per-process'
        ],
        defaultViewport: { width: 1280, height: 800 }
      });
      console.log('Launched new Chrome with user profile.');
    } catch (launchErr) {
      console.log('Failed to launch with user profile (profile probably locked). Launching temporary Chrome...');
      browser = await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1280, height: 800 }
      });
      console.log('Launched temporary Chrome.');
    }
  }

  const page = await browser.newPage();
  console.log('Navigating to Google Cloud Consent Screen...');
  
  await page.goto('https://console.cloud.google.com/apis/credentials/consent?project=univision-auth-prod', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  // Wait a few seconds for any redirects/rendering
  await new Promise(r => setTimeout(r, 5000));

  const screenshotDir = path.join(__dirname, '../artifacts');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const screenshotPath = path.join(screenshotDir, 'gcp_consent_initial.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`Saved initial screenshot to ${screenshotPath}`);

  // Check if we are on login screen
  const pageTitle = await page.title();
  const pageUrl = page.url();
  console.log('Page Title:', pageTitle);
  console.log('Page URL:', pageUrl);

  const bodyText = await page.evaluate(() => document.body.innerText);
  const isSignIn = bodyText.includes('Sign in') || bodyText.includes('Choose an account') || pageUrl.includes('accounts.google.com');

  if (isSignIn) {
    console.log('⚠️ Google Sign-In is required! Please authenticate or approve the sign-in.');
    console.log('Taking a screenshot of the Sign-In screen.');
    const loginScreenshot = path.join(screenshotDir, 'gcp_login_required.png');
    await page.screenshot({ path: loginScreenshot });
    console.log(`Saved login screenshot to ${loginScreenshot}`);
    
    // We cannot proceed automatically if login is required. We must inform the user/parent agent.
    await browser.disconnect().catch(() => {});
    process.exit(101); // Custom exit code for login required
  }

  console.log('User is logged in. Starting automation...');
  
  // Here we would perform the automation steps
  // 1. Consent Screen (External -> Create -> App Name: Univision, support email: peelapuneeth@gmail.com, developer email: peelapuneeth@gmail.com, Save all steps)
  // Let's implement the steps and selector checks:
  
  // Check if we are on the "OAuth consent screen" page where we select User Type
  const hasExternalRadio = await page.evaluate(() => {
    return !!document.querySelector('input[value="EXTERNAL"]');
  });

  if (hasExternalRadio) {
    console.log('Selecting "External" user type...');
    await page.click('input[value="EXTERNAL"]');
    await new Promise(r => setTimeout(r, 1000));
    
    // Find the Create button
    const createBtnSelector = 'button[type="submit"], button.cfc-button-primary, button:has-text("Create")';
    await page.evaluate(() => {
      // Find button containing Create
      const buttons = Array.from(document.querySelectorAll('button'));
      const createBtn = buttons.find(b => b.innerText.includes('Create') || b.textContent.includes('Create'));
      if (createBtn) createBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 5000));
    await page.screenshot({ path: path.join(screenshotDir, 'gcp_consent_details_form.png') });
    console.log('Navigated to OAuth Consent details form.');
  }

  // Now fill details:
  // App Name
  const appNameSelector = 'input[name="appName"], input[aria-label="Application name"], input[formcontrolname="displayName"]';
  const hasAppNameInput = await page.evaluate(() => {
    const input = document.querySelector('input[aria-label="App name"], input[formcontrolname="displayName"], input[placeholder="App name"]');
    if (input) {
      input.value = 'Univision';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    return false;
  });

  if (hasAppNameInput) {
    console.log('Filled App Name: Univision');
  } else {
    console.log('App Name input not found via direct selector, attempting general input search...');
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const appNameInput = inputs.find(i => i.placeholder?.includes('App name') || i.getAttribute('aria-label')?.includes('App name') || i.outerHTML.includes('appName'));
      if (appNameInput) {
        appNameInput.value = 'Univision';
        appNameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }

  // Support Email
  await page.evaluate(() => {
    // Select the support email dropdown
    const select = document.querySelector('mat-select, select');
    if (select) {
      select.click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    // Click the first option containing peelapuneeth@gmail.com
    const options = Array.from(document.querySelectorAll('mat-option, option'));
    const option = options.find(o => o.innerText.includes('peelapuneeth@gmail.com') || o.textContent.includes('peelapuneeth@gmail.com'));
    if (option) option.click();
  });
  console.log('Selected support email.');

  // Developer Email
  const developerEmailFilled = await page.evaluate(() => {
    const input = document.querySelector('input[type="email"], input[name="developerEmail"], input[formcontrolname="developerEmail"]');
    if (input) {
      input.value = 'peelapuneeth@gmail.com';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }
    return false;
  });

  if (developerEmailFilled) {
    console.log('Filled Developer Email.');
  } else {
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const devEmailInput = inputs.find(i => i.placeholder?.includes('email') || i.outerHTML.includes('developer'));
      if (devEmailInput) {
        devEmailInput.value = 'peelapuneeth@gmail.com';
        devEmailInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }

  // Click Save and Continue
  console.log('Clicking Save and Continue...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const saveBtn = buttons.find(b => b.innerText.includes('Save and Continue') || b.textContent.includes('Save and Continue') || b.innerText.includes('SAVE AND CONTINUE'));
    if (saveBtn) saveBtn.click();
  });
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: path.join(screenshotDir, 'gcp_consent_scopes.png') });

  // Click Save and Continue on Scopes
  console.log('Clicking Save and Continue on Scopes...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const saveBtn = buttons.find(b => b.innerText.includes('Save and Continue') || b.textContent.includes('Save and Continue') || b.innerText.includes('SAVE AND CONTINUE'));
    if (saveBtn) saveBtn.click();
  });
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: path.join(screenshotDir, 'gcp_consent_summary.png') });

  // Click Back to Dashboard
  console.log('Saving final step...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const saveBtn = buttons.find(b => b.innerText.includes('Back to Dashboard') || b.textContent.includes('Back to Dashboard') || b.innerText.includes('Save and Continue') || b.textContent.includes('Save and Continue'));
    if (saveBtn) saveBtn.click();
  });
  await new Promise(r => setTimeout(r, 5000));

  // Now navigate to Credentials page
  console.log('Navigating to Credentials Page...');
  await page.goto('https://console.cloud.google.com/apis/credentials?project=univision-auth-prod', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(screenshotDir, 'gcp_credentials_page.png') });

  // Click Create Credentials
  console.log('Clicking Create Credentials...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const createBtn = buttons.find(b => b.innerText.includes('Create Credentials') || b.textContent.includes('Create Credentials'));
    if (createBtn) createBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Click OAuth Client ID
  console.log('Clicking OAuth Client ID option...');
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('button, a, div, span'));
    const oauthItem = items.find(i => i.innerText.includes('OAuth client ID') || i.textContent.includes('OAuth client ID'));
    if (oauthItem) oauthItem.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(screenshotDir, 'gcp_create_oauth_client.png') });

  // Select Application Type: Web application
  console.log('Selecting Web application...');
  await page.evaluate(() => {
    // Click dropdown
    const select = document.querySelector('mat-select, select');
    if (select) select.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const options = Array.from(document.querySelectorAll('mat-option, option'));
    const webOption = options.find(o => o.innerText.includes('Web application') || o.textContent.includes('Web application'));
    if (webOption) webOption.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Fill Authorized Redirect URIs
  console.log('Adding Redirect URI...');
  await page.evaluate(() => {
    // Find "Add URI" button (usually the second one under Authorized redirect URIs)
    const buttons = Array.from(document.querySelectorAll('button'));
    const addUriBtn = buttons.find(b => b.innerText.includes('Add URI') || b.textContent.includes('Add URI'));
    if (addUriBtn) addUriBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    // Fill the last input under redirect URIs
    const inputs = Array.from(document.querySelectorAll('input'));
    // Redirect URI input usually doesn't have unique names, but we can look for the empty one or the one inside the redirect URIs section
    const uriInputs = inputs.filter(i => i.outerHTML.includes('uri') || i.outerHTML.includes('redirect') || i.placeholder?.includes('http'));
    const emptyInput = uriInputs.find(i => !i.value) || inputs[inputs.length - 1];
    if (emptyInput) {
      emptyInput.value = 'https://univision-1.vercel.app/api/auth/callback/google';
      emptyInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click Create
  console.log('Clicking Create client ID...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const createBtn = buttons.find(b => b.innerText.includes('Create') || b.textContent.includes('Create'));
    if (createBtn) createBtn.click();
  });
  await new Promise(r => setTimeout(r, 7000));
  await page.screenshot({ path: path.join(screenshotDir, 'gcp_client_created_popup.png') });

  // Extract Client ID and Secret
  console.log('Extracting credentials...');
  const result = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    // Find client ID and secret inputs (they are read-only or copyable text fields in the popup dialog)
    // Client ID typically ends with .apps.googleusercontent.com
    const clientIdInput = inputs.find(i => i.value?.includes('.apps.googleusercontent.com'));
    // The secret is usually another text input in the same dialog
    const secretInput = inputs.find(i => i.value && !i.value.includes('.apps.googleusercontent.com') && i.value.length > 20);
    
    return {
      clientId: clientIdInput ? clientIdInput.value : null,
      clientSecret: secretInput ? secretInput.value : null,
      allValues: inputs.map(i => i.value).filter(Boolean)
    };
  });

  console.log('Extracted Credentials Result:', result);
  
  if (result.clientId && result.clientSecret) {
    console.log('🎉 Successfully configured and retrieved credentials!');
    fs.writeFileSync(path.join(screenshotDir, 'credentials.json'), JSON.stringify(result, null, 2));
  } else {
    console.log('Could not extract credentials automatically. Values found:', result.allValues);
  }

  await browser.disconnect().catch(() => {});
}

run().catch(err => {
  console.error('Fatal Error running automation:', err);
  process.exit(1);
});
