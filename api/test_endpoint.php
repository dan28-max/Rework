<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set headers for JSON response
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Simple test response
echo json_encode([
    'success' => true,
    'message' => 'Test endpoint is working',
    'server_time' => date('Y-m-d H:i:s'),
    'session_active' => session_status() === PHP_SESSION_ACTIVE,
    'session_id' => session_id()
]);
