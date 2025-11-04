<?php
/**
 * Recreate Admission Data Table
 * This script will drop and recreate the admissiondata table
 */

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    echo "Starting recreation of admissiondata table...\n";
    
    // Drop the existing table if it exists
    echo "Dropping existing admissiondata table...\n";
    $pdo->exec("DROP TABLE IF EXISTS admissiondata");
    echo "✓ Table dropped successfully\n";
    
    // Create the new Admission Data Table
    echo "Creating new admissiondata table...\n";
    $sql = "CREATE TABLE admissiondata (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campus VARCHAR(100) NOT NULL,
        semester VARCHAR(50),
        academic_year VARCHAR(20),
        category VARCHAR(100),
        program VARCHAR(200),
        male INT DEFAULT 0,
        female INT DEFAULT 0,
        batch_id VARCHAR(100),
        submitted_by VARCHAR(255),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_campus (campus),
        INDEX idx_batch (batch_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo "✓ Table created successfully\n";
    
    // Verify the table was created
    $checkStmt = $pdo->query("SELECT COUNT(*) as count FROM information_schema.tables 
                              WHERE table_schema = 'spartan_data' AND table_name = 'admissiondata'");
    $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result['count'] > 0) {
        echo "\n✓ SUCCESS: Admission Data table has been recreated successfully!\n";
        echo "✓ Table structure verified\n";
        
        // Show table structure
        echo "\nTable structure:\n";
        $descStmt = $pdo->query("DESCRIBE admissiondata");
        $columns = $descStmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo str_pad("Field", 20) . str_pad("Type", 30) . str_pad("Null", 10) . str_pad("Key", 10) . "Default\n";
        echo str_repeat("-", 90) . "\n";
        foreach ($columns as $col) {
            echo str_pad($col['Field'], 20) . 
                 str_pad($col['Type'], 30) . 
                 str_pad($col['Null'], 10) . 
                 str_pad($col['Key'], 10) . 
                 ($col['Default'] ?? 'NULL') . "\n";
        }
    } else {
        echo "\n✗ ERROR: Table was not created successfully\n";
        exit(1);
    }
    
} catch (PDOException $e) {
    echo "\n✗ ERROR: Database error occurred\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "\n✗ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>

