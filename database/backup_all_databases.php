<?php
/**
 * Full Database Backup Script
 * Creates a complete backup of all databases and converts to PostgreSQL format
 */

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    echo "Starting full database backup...\n\n";
    
    // Get database name
    $dbName = 'spartan_data';
    
    // Create backup directory
    $backupDir = __DIR__ . '/backups';
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0777, true);
    }
    
    $timestamp = date('Y-m-d_H-i-s');
    $mysqlFile = $backupDir . "/spartan_data_mysql_backup_{$timestamp}.sql";
    $postgresFile = $backupDir . "/spartan_data_postgres_backup_{$timestamp}.sql";
    
    echo "Backup directory: $backupDir\n";
    echo "MySQL backup file: $mysqlFile\n";
    echo "PostgreSQL backup file: $postgresFile\n\n";
    
    // Start MySQL backup
    $mysqlBackup = "-- MySQL Backup for spartan_data database\n";
    $mysqlBackup .= "-- Generated: " . date('Y-m-d H:i:s') . "\n";
    $mysqlBackup .= "-- Database: $dbName\n\n";
    $mysqlBackup .= "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n";
    $mysqlBackup .= "SET time_zone = '+00:00';\n\n";
    $mysqlBackup .= "CREATE DATABASE IF NOT EXISTS `$dbName`;\n";
    $mysqlBackup .= "USE `$dbName`;\n\n";
    
    // Start PostgreSQL backup
    $postgresBackup = "-- PostgreSQL Backup for spartan_data database\n";
    $postgresBackup .= "-- Generated: " . date('Y-m-d H:i:s') . "\n";
    $postgresBackup .= "-- Converted from MySQL\n\n";
    
    // Get all tables
    $tablesStmt = $pdo->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Found " . count($tables) . " tables to backup\n\n";
    
    foreach ($tables as $table) {
        echo "Processing table: $table\n";
        
        // Get table structure
        $createStmt = $pdo->query("SHOW CREATE TABLE `$table`");
        $createRow = $createStmt->fetch(PDO::FETCH_ASSOC);
        $createSQL = $createRow['Create Table'];
        
        // Add to MySQL backup
        $mysqlBackup .= "\n-- Table structure for `$table`\n";
        $mysqlBackup .= "DROP TABLE IF EXISTS `$table`;\n";
        $mysqlBackup .= $createSQL . ";\n\n";
        
        // Get table data
        $dataStmt = $pdo->query("SELECT * FROM `$table`");
        $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($rows) > 0) {
            $mysqlBackup .= "-- Dumping data for table `$table`\n";
            
            // Get column names
            $columnStmt = $pdo->query("SHOW COLUMNS FROM `$table`");
            $columns = $columnStmt->fetchAll(PDO::FETCH_COLUMN);
            
            foreach ($rows as $row) {
                $values = [];
                foreach ($columns as $col) {
                    $value = $row[$col];
                    if ($value === null) {
                        $values[] = 'NULL';
                    } else {
                        // Escape single quotes and backslashes
                        $escaped = str_replace(['\\', "'"], ['\\\\', "''"], $value);
                        $values[] = "'$escaped'";
                    }
                }
                $mysqlBackup .= "INSERT INTO `$table` (`" . implode('`, `', $columns) . "`) VALUES (" . implode(', ', $values) . ");\n";
            }
            $mysqlBackup .= "\n";
            
            echo "  - Backed up " . count($rows) . " rows\n";
        } else {
            echo "  - Table is empty\n";
        }
        
        // Convert to PostgreSQL
        $postgresBackup .= convertToPostgreSQL($table, $pdo);
    }
    
    // Write MySQL backup
    file_put_contents($mysqlFile, $mysqlBackup);
    echo "\n✓ MySQL backup saved to: $mysqlFile\n";
    
    // Write PostgreSQL backup
    file_put_contents($postgresFile, $postgresBackup);
    echo "✓ PostgreSQL backup saved to: $postgresFile\n";
    
    echo "\n✓ Backup completed successfully!\n";
    
} catch (Exception $e) {
    echo "\n✗ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    exit(1);
}

/**
 * Convert MySQL table structure and data to PostgreSQL
 */
function convertToPostgreSQL($tableName, $pdo) {
    $output = "\n-- Table: $tableName\n";
    $output .= "DROP TABLE IF EXISTS $tableName CASCADE;\n\n";
    
    // Get column information
    $columnsStmt = $pdo->query("SHOW COLUMNS FROM `$tableName`");
    $columns = $columnsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $columnDefs = [];
    $hasAutoIncrement = false;
    $autoIncrementCol = null;
    
    foreach ($columns as $col) {
        $colName = $col['Field'];
        $isAutoIncrement = ($col['Key'] === 'PRI' && strpos($col['Extra'], 'auto_increment') !== false);
        
        if ($isAutoIncrement) {
            $hasAutoIncrement = true;
            $autoIncrementCol = $colName;
            // Use SERIAL for auto-increment in PostgreSQL
            $colDef = "$colName SERIAL";
        } else {
            $colType = convertMySQLTypeToPostgreSQL($col['Type']);
            $colDef = "$colName $colType";
        }
        
        if ($col['Key'] === 'PRI' && !$isAutoIncrement) {
            $colDef .= " PRIMARY KEY";
        }
        
        if ($col['Null'] === 'NO' && !$isAutoIncrement) {
            $colDef .= " NOT NULL";
        }
        
        if ($col['Default'] !== null && !$isAutoIncrement) {
            $default = $col['Default'];
            if ($default === 'CURRENT_TIMESTAMP' || $default === 'current_timestamp()') {
                $colDef .= " DEFAULT CURRENT_TIMESTAMP";
            } elseif (is_numeric($default)) {
                $colDef .= " DEFAULT $default";
            } else {
                // Escape for PostgreSQL (single quotes)
                $escapedDefault = str_replace("'", "''", $default);
                $colDef .= " DEFAULT '$escapedDefault'";
            }
        }
        
        $columnDefs[] = $colDef;
    }
    
    // If we used SERIAL, add PRIMARY KEY constraint
    if ($hasAutoIncrement && $autoIncrementCol) {
        // Remove SERIAL from column def and add PRIMARY KEY separately
        $columnDefs = array_map(function($def) use ($autoIncrementCol) {
            if (strpos($def, "$autoIncrementCol SERIAL") === 0) {
                return "$autoIncrementCol SERIAL PRIMARY KEY";
            }
            return $def;
        }, $columnDefs);
    }
    
    $output .= "CREATE TABLE $tableName (\n";
    $output .= "    " . implode(",\n    ", $columnDefs) . "\n";
    $output .= ");\n\n";
    
    // Add indexes
    $indexStmt = $pdo->query("SHOW INDEXES FROM `$tableName`");
    $indexes = $indexStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $indexGroups = [];
    foreach ($indexes as $index) {
        $keyName = $index['Key_name'];
        if ($keyName === 'PRIMARY') continue;
        
        if (!isset($indexGroups[$keyName])) {
            $indexGroups[$keyName] = [
                'unique' => $index['Non_unique'] == 0,
                'columns' => []
            ];
        }
        $indexGroups[$keyName]['columns'][] = $index['Column_name'];
    }
    
    foreach ($indexGroups as $indexName => $indexInfo) {
        $unique = $indexInfo['unique'] ? 'UNIQUE ' : '';
        $output .= "CREATE {$unique}INDEX {$indexName} ON $tableName (" . implode(', ', $indexInfo['columns']) . ");\n";
    }
    $output .= "\n";
    
    // Get table data
    $dataStmt = $pdo->query("SELECT * FROM `$tableName`");
    $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($rows) > 0) {
        $columnNames = array_column($columns, 'Field');
        
        foreach ($rows as $row) {
            $values = [];
            foreach ($columnNames as $colName) {
                $value = $row[$colName];
                if ($value === null) {
                    $values[] = 'NULL';
                } else {
                    // PostgreSQL uses single quotes and escapes single quotes with ''
                    $escaped = str_replace("'", "''", $value);
                    $values[] = "'$escaped'";
                }
            }
            $output .= "INSERT INTO $tableName (" . implode(', ', $columnNames) . ") VALUES (" . implode(', ', $values) . ");\n";
        }
        $output .= "\n";
    }
    
    return $output;
}

/**
 * Convert MySQL data types to PostgreSQL
 */
function convertMySQLTypeToPostgreSQL($mysqlType) {
    $mysqlType = strtolower(trim($mysqlType));
    
    // Handle length specifications
    preg_match('/(\w+)(?:\(([^)]+)\))?/', $mysqlType, $matches);
    $type = $matches[1] ?? $mysqlType;
    $length = $matches[2] ?? null;
    
    $typeMap = [
        'tinyint' => 'SMALLINT',
        'smallint' => 'SMALLINT',
        'mediumint' => 'INTEGER',
        'int' => 'INTEGER',
        'bigint' => 'BIGINT',
        'float' => 'REAL',
        'double' => 'DOUBLE PRECISION',
        'decimal' => 'NUMERIC',
        'numeric' => 'NUMERIC',
        'char' => 'CHAR',
        'varchar' => 'VARCHAR',
        'text' => 'TEXT',
        'tinytext' => 'TEXT',
        'mediumtext' => 'TEXT',
        'longtext' => 'TEXT',
        'blob' => 'BYTEA',
        'tinyblob' => 'BYTEA',
        'mediumblob' => 'BYTEA',
        'longblob' => 'BYTEA',
        'date' => 'DATE',
        'time' => 'TIME',
        'datetime' => 'TIMESTAMP',
        'timestamp' => 'TIMESTAMP',
        'year' => 'INTEGER',
        'enum' => 'VARCHAR',
        'set' => 'VARCHAR',
        'json' => 'JSONB',
        'boolean' => 'BOOLEAN',
        'bool' => 'BOOLEAN'
    ];
    
    $postgresType = $typeMap[$type] ?? 'TEXT';
    
    // Add length if specified
    if ($length !== null && in_array($postgresType, ['CHAR', 'VARCHAR', 'NUMERIC', 'DECIMAL'])) {
        $postgresType .= "($length)";
    }
    
    return $postgresType;
}
?>

