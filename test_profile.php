<?php
// Test script for get_admin_profile.php

// Start session and set test user
session_start();
$_SESSION['user_id'] = 1; // Assuming admin user has ID 1

// Include the API file
require_once 'api/get_admin_profile.php';
?>
