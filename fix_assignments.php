<?php
// Fix the table_assignments issues
require_once 'config/database.php';

try {
    $pdo = getDB();
    
    echo "=== FIXING TABLE ASSIGNMENTS ===\n";
    
    // 1. Fix NULL/empty status values
    $stmt = $pdo->prepare("UPDATE table_assignments SET status = 'active' WHERE status IS NULL OR status = ''");
    $stmt->execute();
    $updatedRows = $stmt->rowCount();
    echo "Updated $updatedRows assignments to 'active' status\n";
    
    // 2. Check current assignments after fix
    $stmt = $pdo->query("SELECT id, table_name, assigned_office, status FROM table_assignments ORDER BY id");
    $assignments = $stmt->fetchAll();
    
    echo "\n=== ASSIGNMENTS AFTER FIX ===\n";
    foreach ($assignments as $assign) {
        echo "ID: {$assign['id']}, Table: {$assign['table_name']}, Office: '{$assign['assigned_office']}', Status: '{$assign['status']}'\n";
    }
    
    // 3. Check what users will see
    echo "\n=== TESTING USER API ===\n";
    $testOffices = ['emu', 'EMU'];
    
    foreach ($testOffices as $office) {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM table_assignments WHERE LOWER(assigned_office) = LOWER(?) AND status = 'active'");
        $stmt->execute([$office]);
        $result = $stmt->fetch();
        echo "Office '$office' would see {$result['count']} active assignments\n";
    }
    
    echo "\nFix completed!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
