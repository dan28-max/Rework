<?php
/**
 * Migration script to move from single reports table to individual report tables
 * 
 * This script should be run once to migrate existing data to the new structure
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/ReportManager.php';

// Initialize database connection and ReportManager
$database = new Database();
$db = $database->getConnection();
$reportManager = new ReportManager($db);

echo "Starting report migration...\n";

try {
    // Begin transaction
    $db->beginTransaction();
    
    // 1. Create the reports_metadata table if it doesn't exist
    $createTableSql = "
        CREATE TABLE IF NOT EXISTS reports_metadata (
            id INT AUTO_INCREMENT PRIMARY KEY,
            report_id VARCHAR(50) UNIQUE NOT NULL,
            table_name VARCHAR(100) UNIQUE NOT NULL,
            display_name VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            created_by INT,
            is_active BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";
    
    $db->exec($createTableSql);
    echo "Created reports_metadata table\n";
    
    // 2. Get all distinct report types from the current reports table
    $stmt = $db->query("SELECT DISTINCT report_type FROM reports");
    $reportTypes = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($reportTypes)) {
        echo "No report types found to migrate.\n";
        exit(0);
    }
    
    echo "Found " . count($reportTypes) . " report types to migrate.\n";
    
    // 3. Create a table for each report type and migrate data
    foreach ($reportTypes as $reportType) {
        $reportId = strtolower(preg_replace('/[^a-zA-Z0-9_]/', '_', $reportType));
        $displayName = ucwords(str_replace('_', ' ', $reportType));
        
        echo "\nMigrating report type: {$reportType} (ID: {$reportId})\n";
        
        // Create the report type
        $result = $reportManager->createReportType(
            $reportId,
            $displayName,
            "Migrated report for {$displayName}",
            1 // admin user
        );
        
        if (!$result['success']) {
            echo "  - Error creating report type: {$result['message']}\n";
            continue;
        }
        
        $tableName = $result['table_name'];
        echo "  - Created table: {$tableName}\n";
        
        // Get the schema of the reports table to determine columns
        $stmt = $db->query("DESCRIBE reports");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Remove ID and other metadata columns that will be handled separately
        $excludeColumns = ['id', 'created_at', 'updated_at', 'submitted_by', 'status'];
        $dataColumns = array_diff($columns, $excludeColumns);
        
        // Add data columns to the new table
        foreach ($dataColumns as $column) {
            if ($column === 'report_type') continue;
            
            // Get column type from the reports table
            $stmt = $db->query("SHOW COLUMNS FROM reports WHERE Field = '{$column}'");
            $colInfo = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($colInfo) {
                $dataType = $colInfo['Type'];
                $isNullable = $colInfo['Null'] === 'YES' ? false : true;
                $defaultValue = $colInfo['Default'] ?? null;
                
                $columnDef = [
                    'name' => $column,
                    'type' => $dataType,
                    'required' => $isNullable,
                ];
                
                if ($defaultValue !== null) {
                    $columnDef['default'] = $defaultValue;
                }
                
                $reportManager->addColumn($tableName, $columnDef);
                echo "    - Added column: {$column} ({$dataType})\n";
            }
        }
        
        // 4. Migrate data for this report type
        $stmt = $db->prepare("SELECT * FROM reports WHERE report_type = ?");
        $stmt->execute([$reportType]);
        $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($reports)) {
            echo "  - No data to migrate for this report type\n";
            continue;
        }
        
        $migratedCount = 0;
        
        foreach ($reports as $report) {
            $data = [];
            
            // Prepare data for the new table
            foreach ($dataColumns as $column) {
                if (isset($report[$column]) && $column !== 'report_type') {
                    $data[$column] = $report[$column];
                }
            }
            
            // Add metadata
            $submittedBy = $report['submitted_by'] ?? 1;
            $officeId = 1; // Default office ID, should be set based on your data
            
            // Submit the data
            $result = $reportManager->submitReportData(
                $tableName,
                $data,
                $submittedBy,
                $officeId
            );
            
            if ($result['success']) {
                $migratedCount++;
            } else {
                echo "    - Error migrating record ID {$report['id']}: {$result['message']}\n";
            }
        }
        
        echo "  - Migrated {$migratedCount} records\n";
    }
    
    // Commit the transaction
    $db->commit();
    
    echo "\nMigration completed successfully!\n";
    
} catch (Exception $e) {
    // Rollback the transaction on error
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    
    echo "\nMigration failed: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
