<?php
/**
 * reCAPTCHA Configuration for Spartan Data
 * 
 * To get your reCAPTCHA keys:
 * 1. Go to https://www.google.com/recaptcha/admin
 * 2. Click "+ Create" to create a new site
 * 3. Choose reCAPTCHA v2 (I'm not a robot checkbox)
 * 4. Add your domain (e.g., localhost for testing, yourdomain.com for production)
 * 5. Copy the Site Key and Secret Key below
 */

// reCAPTCHA Site Key (public key - used in frontend)
define('RECAPTCHA_SITE_KEY', '6LehTQEsAAAAALFiy8UvkGJKKGSPrZ-G1aq6HqZC');

// reCAPTCHA Secret Key (private key - used in backend verification)
define('RECAPTCHA_SECRET_KEY', '6LehTQEsAAAAAKrNkJxEVYQcRt3GxKM-DU6YuOFz');

// reCAPTCHA API endpoint
define('RECAPTCHA_VERIFY_URL', 'https://www.google.com/recaptcha/api/siteverify');

/**
 * Verify reCAPTCHA token
 * 
 * @param string $token The reCAPTCHA response token
 * @param string $remoteIp The user's IP address (optional)
 * @return array Returns ['success' => bool, 'error' => string|null]
 */
function verifyRecaptcha($token, $remoteIp = null) {
    // Check if keys are configured
    if (RECAPTCHA_SITE_KEY === 'your-site-key-here' || RECAPTCHA_SECRET_KEY === 'your-secret-key-here') {
        error_log('reCAPTCHA keys not configured. Skipping verification.');
        // Return success for development/testing when keys aren't configured
        return ['success' => true, 'error' => null];
    }
    
    // If token is empty, verification fails
    if (empty($token)) {
        return ['success' => false, 'error' => 'reCAPTCHA token is missing'];
    }
    
    // Prepare verification request
    $data = [
        'secret' => RECAPTCHA_SECRET_KEY,
        'response' => $token
    ];
    
    // Add remote IP if provided
    if ($remoteIp !== null) {
        $data['remoteip'] = $remoteIp;
    }
    
    // Make verification request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, RECAPTCHA_VERIFY_URL);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    
    $response = curl_exec($ch);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        error_log('reCAPTCHA verification CURL error: ' . $curlError);
        return ['success' => false, 'error' => 'Failed to verify reCAPTCHA: ' . $curlError];
    }
    
    $result = json_decode($response, true);
    
    if ($result === null) {
        error_log('reCAPTCHA verification: Invalid JSON response');
        return ['success' => false, 'error' => 'Invalid response from reCAPTCHA service'];
    }
    
    if (isset($result['success']) && $result['success'] === true) {
        return ['success' => true, 'error' => null];
    } else {
        $errorCodes = isset($result['error-codes']) ? implode(', ', $result['error-codes']) : 'Unknown error';
        error_log('reCAPTCHA verification failed: ' . $errorCodes);
        return ['success' => false, 'error' => 'reCAPTCHA verification failed: ' . $errorCodes];
    }
}
?>

