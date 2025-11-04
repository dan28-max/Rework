<?php
/**
 * Database Manager - phpMyAdmin-style interface
 * Easy database table management and tracking
 */

require_once __DIR__ . '/config/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Get action
$action = $_GET['action'] ?? 'list';
$table = $_GET['table'] ?? '';

// Get all tables
function getAllTables($db) {
    $stmt = $db->query("SHOW TABLES");
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

// Get table structure
function getTableStructure($db, $table) {
    $stmt = $db->query("DESCRIBE `$table`");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Get table data
function getTableData($db, $table, $limit = 25, $offset = 0) {
    $stmt = $db->query("SELECT * FROM `$table` LIMIT $limit OFFSET $offset");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Get row count
function getRowCount($db, $table) {
    $stmt = $db->query("SELECT COUNT(*) as count FROM `$table`");
    return $stmt->fetch(PDO::FETCH_ASSOC)['count'];
}

$tables = getAllTables($db);
$tableData = [];
$tableStructure = [];
$rowCount = 0;

if ($table && in_array($table, $tables)) {
    $limit = $_GET['limit'] ?? 25;
    $offset = $_GET['offset'] ?? 0;
    $tableData = getTableData($db, $table, $limit, $offset);
    $tableStructure = getTableStructure($db, $table);
    $rowCount = getRowCount($db, $table);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Manager - Spartan Data</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            display: flex;
            min-height: 100vh;
        }

        .sidebar {
            width: 250px;
            background: #2c3e50;
            color: white;
            padding: 20px;
            overflow-y: auto;
        }

        .sidebar h2 {
            margin-bottom: 20px;
            font-size: 18px;
            color: #ecf0f1;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .table-list {
            list-style: none;
        }

        .table-item {
            padding: 10px;
            margin-bottom: 5px;
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }

        .table-item:hover {
            background: #34495e;
        }

        .table-item.active {
            background: #dc143c;
        }

        .table-item i {
            font-size: 12px;
            opacity: 0.7;
        }

        .main-content {
            flex: 1;
            padding: 20px;
            overflow-x: auto;
        }

        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header h1 {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 5px;
        }

        .header .breadcrumb {
            color: #7f8c8d;
            font-size: 14px;
        }

        .toolbar {
            background: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .toolbar-left {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .toolbar-right {
            display: flex;
            gap: 10px;
        }

        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
            text-decoration: none;
            color: white;
        }

        .btn-primary {
            background: #3498db;
        }

        .btn-primary:hover {
            background: #2980b9;
        }

        .btn-success {
            background: #27ae60;
        }

        .btn-success:hover {
            background: #229954;
        }

        .btn-danger {
            background: #e74c3c;
        }

        .btn-danger:hover {
            background: #c0392b;
        }

        .btn-secondary {
            background: #95a5a6;
        }

        .btn-secondary:hover {
            background: #7f8c8d;
        }

        .table-container {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }

        .data-table thead {
            background: #34495e;
            color: white;
        }

        .data-table thead th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            white-space: nowrap;
        }

        .data-table tbody tr {
            border-bottom: 1px solid #ecf0f1;
        }

        .data-table tbody tr:hover {
            background: #f8f9fa;
        }

        .data-table tbody td {
            padding: 10px 12px;
            color: #2c3e50;
        }

        .action-btns {
            display: flex;
            gap: 5px;
        }

        .action-btn {
            padding: 4px 8px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            color: white;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .action-btn.edit {
            background: #3498db;
        }

        .action-btn.delete {
            background: #e74c3c;
        }

        .action-btn.copy {
            background: #95a5a6;
        }

        .info-bar {
            background: #ecf0f1;
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
            color: #2c3e50;
        }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #95a5a6;
        }

        .empty-state i {
            font-size: 64px;
            margin-bottom: 20px;
            opacity: 0.3;
        }

        .pagination {
            display: flex;
            gap: 5px;
            align-items: center;
        }

        .pagination a {
            padding: 6px 12px;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 12px;
        }

        .pagination a:hover {
            background: #2980b9;
        }

        .pagination span {
            padding: 6px 12px;
            color: #7f8c8d;
            font-size: 12px;
        }

        .search-box {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            width: 250px;
        }

        select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }

        .badge {
            background: #dc143c;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <div class="sidebar">
        <h2><i class="fas fa-database"></i> Database Tables</h2>
        <ul class="table-list">
            <?php foreach ($tables as $t): ?>
                <li class="table-item <?php echo $table === $t ? 'active' : ''; ?>" 
                    onclick="window.location.href='?table=<?php echo $t; ?>'">
                    <i class="fas fa-table"></i>
                    <?php echo $t; ?>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>

    <!-- Main Content -->
    <div class="main-content">
        <!-- Header -->
        <div class="header">
            <h1><i class="fas fa-database"></i> Database Manager</h1>
            <div class="breadcrumb">
                <i class="fas fa-home"></i> Home / 
                <?php if ($table): ?>
                    <span><?php echo $table; ?></span>
                <?php else: ?>
                    <span>Select a table</span>
                <?php endif; ?>
            </div>
        </div>

        <?php if ($table): ?>
            <!-- Toolbar -->
            <div class="toolbar">
                <div class="toolbar-left">
                    <input type="text" class="search-box" placeholder="Search this table..." id="searchBox">
                    <select id="rowsPerPage" onchange="changeLimit(this.value)">
                        <option value="25" <?php echo ($limit ?? 25) == 25 ? 'selected' : ''; ?>>25 rows</option>
                        <option value="50" <?php echo ($limit ?? 25) == 50 ? 'selected' : ''; ?>>50 rows</option>
                        <option value="100" <?php echo ($limit ?? 25) == 100 ? 'selected' : ''; ?>>100 rows</option>
                        <option value="500" <?php echo ($limit ?? 25) == 500 ? 'selected' : ''; ?>>500 rows</option>
                    </select>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-success" onclick="exportTable()">
                        <i class="fas fa-download"></i> Export
                    </button>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        <i class="fas fa-sync"></i> Refresh
                    </button>
                    <a href="admin-dashboard.html" class="btn btn-secondary">
                        <i class="fas fa-arrow-left"></i> Back to Dashboard
                    </a>
                </div>
            </div>

            <!-- Table Container -->
            <div class="table-container">
                <div class="info-bar">
                    <div>
                        <strong><?php echo $table; ?></strong> 
                        <span class="badge"><?php echo $rowCount; ?> rows</span>
                    </div>
                    <div class="pagination">
                        <?php
                        $currentPage = floor($offset / $limit) + 1;
                        $totalPages = ceil($rowCount / $limit);
                        
                        if ($currentPage > 1): ?>
                            <a href="?table=<?php echo $table; ?>&limit=<?php echo $limit; ?>&offset=<?php echo ($currentPage - 2) * $limit; ?>">
                                <i class="fas fa-chevron-left"></i> Previous
                            </a>
                        <?php endif; ?>
                        
                        <span>Page <?php echo $currentPage; ?> of <?php echo $totalPages; ?></span>
                        
                        <?php if ($currentPage < $totalPages): ?>
                            <a href="?table=<?php echo $table; ?>&limit=<?php echo $limit; ?>&offset=<?php echo $currentPage * $limit; ?>">
                                Next <i class="fas fa-chevron-right"></i>
                            </a>
                        <?php endif; ?>
                    </div>
                </div>

                <?php if (!empty($tableData)): ?>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <?php foreach (array_keys($tableData[0]) as $column): ?>
                                    <th><?php echo $column; ?></th>
                                <?php endforeach; ?>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($tableData as $row): ?>
                                <tr>
                                    <?php foreach ($row as $value): ?>
                                        <td><?php echo htmlspecialchars($value ?? '-'); ?></td>
                                    <?php endforeach; ?>
                                    <td>
                                        <div class="action-btns">
                                            <button class="action-btn edit" onclick="editRow(<?php echo $row['id'] ?? 0; ?>)">
                                                <i class="fas fa-edit"></i> Edit
                                            </button>
                                            <button class="action-btn copy" onclick="copyRow(<?php echo $row['id'] ?? 0; ?>)">
                                                <i class="fas fa-copy"></i> Copy
                                            </button>
                                            <button class="action-btn delete" onclick="deleteRow(<?php echo $row['id'] ?? 0; ?>)">
                                                <i class="fas fa-trash"></i> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h3>No Data Found</h3>
                        <p>This table is empty</p>
                    </div>
                <?php endif; ?>
            </div>
        <?php else: ?>
            <div class="table-container">
                <div class="empty-state">
                    <i class="fas fa-table"></i>
                    <h3>Select a Table</h3>
                    <p>Choose a table from the sidebar to view its data</p>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <script>
        function changeLimit(limit) {
            const table = '<?php echo $table; ?>';
            window.location.href = `?table=${table}&limit=${limit}&offset=0`;
        }

        function editRow(id) {
            alert('Edit functionality - Coming soon for ID: ' + id);
        }

        function copyRow(id) {
            alert('Copy functionality - Coming soon for ID: ' + id);
        }

        function deleteRow(id) {
            if (confirm('Are you sure you want to delete this record?')) {
                alert('Delete functionality - Coming soon for ID: ' + id);
            }
        }

        function exportTable() {
            const table = '<?php echo $table; ?>';
            window.location.href = `api/export_table.php?table=${table}`;
        }

        // Search functionality
        document.getElementById('searchBox')?.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('.data-table tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    </script>
</body>
</html>
