<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['action'] = 'get_submissions';

require 'api/user_submissions.php';
?>
