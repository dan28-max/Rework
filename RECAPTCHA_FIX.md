# Fixing "Invalid key type" Error

This error occurs when:
1. **Site Key and Secret Key don't match** - They must be from the same reCAPTCHA site registration
2. **Domain not registered** - Your domain (localhost) needs to be added in the reCAPTCHA admin console
3. **Wrong reCAPTCHA type** - The keys must be for "reCAPTCHA v2 - I'm not a robot" checkbox

## Solution Steps:

### Step 1: Verify Your Keys Match
1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Find your reCAPTCHA site
3. Verify both keys are from the **same site registration**
4. Make sure the type is **"reCAPTCHA v2"** → **"I'm not a robot" Checkbox**

### Step 2: Register Your Domain
1. In the reCAPTCHA admin console, click on your site
2. Scroll to **"Domains"** section
3. Add these domains:
   - `localhost`
   - `127.0.0.1`
   - Your actual domain (if applicable)
4. Click **"Save"**

### Step 3: Get Fresh Keys (Recommended)
If the keys still don't work:

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click **"+ Create"** to create a new site
3. Fill in:
   - **Label**: "Spartan Data Login" (or any name)
   - **reCAPTCHA type**: Select **"reCAPTCHA v2"** → **"I'm not a robot" Checkbox**
   - **Domains**: Add `localhost` and `127.0.0.1`
4. Click **"Submit"**
5. Copy the **Site Key** and **Secret Key**
6. Update `config/recaptcha.php` with the new keys

### Step 4: Update Your Config
Edit `config/recaptcha.php`:
```php
define('RECAPTCHA_SITE_KEY', 'YOUR_NEW_SITE_KEY_HERE');
define('RECAPTCHA_SECRET_KEY', 'YOUR_NEW_SECRET_KEY_HERE');
```

### Step 5: Clear Browser Cache
1. Clear browser cache or do a hard refresh (Ctrl+Shift+R)
2. Reload the login page

## Important Notes:
- Site Key and Secret Key **MUST** be from the same reCAPTCHA site
- For localhost testing, you **MUST** add `localhost` and `127.0.0.1` to the domains list
- The reCAPTCHA type must be **"v2 - I'm not a robot"** (not v3)
- Keys are case-sensitive - copy them exactly as shown

