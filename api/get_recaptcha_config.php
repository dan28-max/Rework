<?php
/**
 * Get reCAPTCHA Configuration
 * Returns the reCAPTCHA site key for frontend use
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/recaptcha.php';

echo json_encode([
    'success' => true,
    'siteKey' => RECAPTCHA_SITE_KEY
]);
?>

