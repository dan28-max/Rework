# reCAPTCHA Setup Instructions

This guide will help you set up Google reCAPTCHA for the login form.

## Step 1: Get Your reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Sign in with your Google account
3. Click **"+ Create"** to create a new site
4. Fill in the form:
   - **Label**: Enter a name (e.g., "Spartan Data Login")
   - **reCAPTCHA type**: Select **"reCAPTCHA v2"** → **"I'm not a robot" Checkbox**
   - **Domains**: Add your domains:
     - For local development: `localhost`
     - For production: your actual domain (e.g., `yourdomain.com`, `www.yourdomain.com`)
   - Accept the reCAPTCHA Terms of Service
5. Click **"Submit"**
6. You'll receive two keys:
   - **Site Key** (public key - used in frontend)
   - **Secret Key** (private key - used in backend verification)

## Step 2: Configure Your Keys

1. Open `config/recaptcha.php`
2. Replace the placeholder values:
   ```php
   define('RECAPTCHA_SITE_KEY', 'your-actual-site-key-here');
   define('RECAPTCHA_SECRET_KEY', 'your-actual-secret-key-here');
   ```

## Step 3: Test the Setup

1. Open `login.html` in your browser
2. The reCAPTCHA widget should appear below the "Remember me" checkbox
3. Try logging in:
   - Complete the reCAPTCHA challenge
   - Enter your credentials
   - Submit the form

## Troubleshooting

### reCAPTCHA widget not showing
- Check that your Site Key is correctly set in `config/recaptcha.php`
- Verify that `localhost` (or your domain) is added in the reCAPTCHA admin console
- Check browser console for any JavaScript errors
- Ensure the reCAPTCHA API script is loading (check Network tab)

### "reCAPTCHA verification failed" error
- Verify your Secret Key is correct in `config/recaptcha.php`
- Check that the domain matches what you registered in reCAPTCHA admin
- Ensure your server can make outbound HTTPS requests (to Google's API)
- Check PHP error logs for detailed error messages

### reCAPTCHA works but login still fails
- The reCAPTCHA verification is separate from authentication
- Check your username and password are correct
- Verify your database connection is working

## Development Notes

- If keys are not configured (still have placeholder values), reCAPTCHA verification will be skipped for easier development
- For production, always configure proper reCAPTCHA keys
- The reCAPTCHA widget will automatically reset after a failed login attempt

## Security Notes

- Never commit your Secret Key to version control
- Keep your Secret Key secure and private
- Use different keys for development and production environments
- Consider adding `config/recaptcha.php` to `.gitignore` if it contains sensitive keys

