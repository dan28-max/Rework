<?php
/**
 * Setup Report Tables
 * This script creates all report data tables in the database
 */

require_once __DIR__ . '/config/database.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Setup Report Tables - Spartan Data</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            width: 100%;
            padding: 40px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .status {
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .status.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .status.info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        .icon {
            font-size: 20px;
        }
        .table-list {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 20px;
            margin-top: 20px;
        }
        .table-item {
            padding: 10px;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .table-item:last-child {
            border-bottom: none;
        }
        .badge {
            background: #28a745;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #dc143c;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #b01030;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗄️ Report Tables Setup</h1>
        <p class="subtitle">Creating database tables for all report types</p>

        <?php
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            // Read SQL file
            $sqlFile = __DIR__ . '/database/create_all_report_tables.sql';
            
            if (!file_exists($sqlFile)) {
                throw new Exception('SQL file not found: ' . $sqlFile);
            }
            
            $sql = file_get_contents($sqlFile);
            
            // Split SQL into individual statements
            $statements = array_filter(
                array_map('trim', explode(';', $sql)),
                function($stmt) {
                    return !empty($stmt) && 
                           !preg_match('/^--/', $stmt) && 
                           !preg_match('/^\/\*/', $stmt);
                }
            );
            
            $successCount = 0;
            $errors = [];
            $createdTables = [];
            
            foreach ($statements as $statement) {
                try {
                    $db->exec($statement);
                    $successCount++;
                    
                    // Extract table name if CREATE TABLE statement
                    if (preg_match('/CREATE TABLE.*?`?(\w+)`?/i', $statement, $matches)) {
                        $createdTables[] = $matches[1];
                    }
                } catch (PDOException $e) {
                    $errors[] = $e->getMessage();
                }
            }
            
            if ($successCount > 0) {
                echo '<div class="status success">';
                echo '<span class="icon">✅</span>';
                echo '<div>';
                echo '<strong>Success!</strong><br>';
                echo "Executed $successCount SQL statements successfully.";
                echo '</div>';
                echo '</div>';
                
                if (!empty($createdTables)) {
                    echo '<div class="table-list">';
                    echo '<h3 style="margin-bottom: 15px; color: #333;">Created Tables:</h3>';
                    
                    $tableNames = [
                        'campuspopulation' => 'Campus Population',
                        'admissiondata' => 'Admission Data',
                        'enrollmentdata' => 'Enrollment Data',
                        'graduatesdata' => 'Graduates Data',
                        'employee' => 'Employee Data',
                        'leaveprivilege' => 'Leave Privilege',
                        'libraryvisitor' => 'Library Visitor',
                        'pwd' => 'PWD Data',
                        'waterconsumption' => 'Water Consumption',
                        'treatedwastewater' => 'Treated Wastewater',
                        'electricityconsumption' => 'Electricity Consumption',
                        'solidwaste' => 'Solid Waste',
                        'foodwaste' => 'Food Waste',
                        'fuelconsumption' => 'Fuel Consumption',
                        'distancetraveled' => 'Distance Traveled',
                        'budgetexpenditure' => 'Budget Expenditure',
                        'flightaccommodation' => 'Flight Accommodation'
                    ];
                    
                    foreach ($tableNames as $table => $displayName) {
                        if (in_array($table, $createdTables)) {
                            echo '<div class="table-item">';
                            echo '<span>' . $displayName . '</span>';
                            echo '<span class="badge">Created</span>';
                            echo '</div>';
                        }
                    }
                    
                    echo '</div>';
                }
            }
            
            if (!empty($errors)) {
                echo '<div class="status error">';
                echo '<span class="icon">❌</span>';
                echo '<div>';
                echo '<strong>Some errors occurred:</strong><br>';
                echo '<ul style="margin-top: 10px; margin-left: 20px;">';
                foreach (array_slice($errors, 0, 5) as $error) {
                    echo '<li>' . htmlspecialchars($error) . '</li>';
                }
                echo '</ul>';
                echo '</div>';
                echo '</div>';
            }
            
            echo '<div class="status info">';
            echo '<span class="icon">ℹ️</span>';
            echo '<div>';
            echo '<strong>Next Steps:</strong><br>';
            echo '1. Go to Admin Dashboard → Data Tables Management<br>';
            echo '2. Select a report type from the dropdown<br>';
            echo '3. Click "Load Data" to view the table data';
            echo '</div>';
            echo '</div>';
            
            echo '<a href="admin-dashboard.html" class="btn">Go to Admin Dashboard</a>';
            
        } catch (Exception $e) {
            echo '<div class="status error">';
            echo '<span class="icon">❌</span>';
            echo '<div>';
            echo '<strong>Error:</strong><br>';
            echo htmlspecialchars($e->getMessage());
            echo '</div>';
            echo '</div>';
        }
        ?>
    </div>
</body>
</html>
