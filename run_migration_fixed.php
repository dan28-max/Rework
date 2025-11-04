<?php
// Database configuration
$host = 'localhost';
$dbname = 'spartan_data';
$username = 'root';
$password = ''; // Default XAMPP password is empty

try {
    // Create connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Starting migration...\n";
    
    // Add deadline column first if it doesn't exist
    try {
        $pdo->exec("ALTER TABLE table_assignments ADD COLUMN IF NOT EXISTS deadline DATE NULL AFTER description");
        echo "Added 'deadline' column\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') === false) {
            throw $e;
        }
        echo "'deadline' column already exists\n";
    }
    
    // Add has_deadline column
    try {
        $pdo->exec("ALTER TABLE table_assignments ADD COLUMN IF NOT EXISTS has_deadline TINYINT(1) DEFAULT 0 AFTER deadline");
        echo "Added 'has_deadline' column\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') === false) {
            throw $e;
        }
        echo "'has_deadline' column already exists\n";
    }
    
    // Add priority column
    try {
        $pdo->exec("ALTER TABLE table_assignments ADD COLUMN IF NOT EXISTS priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' AFTER has_deadline");
        echo "Added 'priority' column\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') === false) {
            throw $e;
        }
        echo "'priority' column already exists\n";
    }
    
    // Add notes column
    try {
        $pdo->exec("ALTER TABLE table_assignments ADD COLUMN IF NOT EXISTS notes TEXT NULL AFTER priority");
        echo "Added 'notes' column\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') === false) {
            throw $e;
        }
        echo "'notes' column already exists\n";
    }
    
    // Add indexes
    $indexes = [
        'idx_deadline' => 'CREATE INDEX IF NOT EXISTS idx_deadline ON table_assignments(deadline)',
        'idx_priority' => 'CREATE INDEX IF NOT EXISTS idx_priority ON table_assignments(priority)',
        'idx_has_deadline' => 'CREATE INDEX IF NOT EXISTS idx_has_deadline ON table_assignments(has_deadline)'
    ];
    
    foreach ($indexes as $name => $sql) {
        try {
            $pdo->exec($sql);
            echo "Added index '$name'\n";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate key name') === false) {
                throw $e;
            }
            echo "Index '$name' already exists\n";
        }
    }
    
    // Set default values
    $pdo->exec("UPDATE table_assignments SET has_deadline = 0 WHERE has_deadline IS NULL");
    $pdo->exec("UPDATE table_assignments SET priority = 'medium' WHERE priority IS NULL");
    
    echo "\nMigration completed successfully!\n";
    
} catch (PDOException $e) {
    die("Error: " . $e->getMessage() . "\n");
}
?>
