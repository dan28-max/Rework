<?php
// Test password hash verification
$hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

$passwords = ['admin123', 'user123', 'password', 'admin', 'user'];

echo "<h2>Password Hash Verification Test</h2>";
echo "<p>Testing hash: <code>$hash</code></p>";
echo "<hr>";

foreach ($passwords as $password) {
    $result = password_verify($password, $hash);
    $status = $result ? '✓ MATCH' : '✗ No match';
    $color = $result ? 'green' : 'red';
    echo "<p style='color: $color;'><strong>$status</strong> - Testing: '$password'</p>";
}
?>
