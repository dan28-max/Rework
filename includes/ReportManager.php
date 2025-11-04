<?php
/**
 * Report Manager
 * 
 * Handles all report-related database operations with individual tables per report
 */

class ReportManager {
    private $db;
    private $reportsMetadataTable = 'reports_metadata';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Create a new report type with its own table
     */
    public function createReportType($reportId, $displayName, $description, $createdBy, $columns = []) {
        try {
            // Start transaction
            $this->db->beginTransaction();
            
            // Generate table name
            $tableName = 'report_' . preg_replace('/[^a-z0-9_]/', '', strtolower($reportId));
            
            // Add to metadata
            $stmt = $this->db->prepare("INSERT INTO {$this->reportsMetadataTable} 
                (report_id, table_name, display_name, description, created_by) 
                VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$reportId, $tableName, $displayName, $description, $createdBy]);
            
            // Create the table with common fields
            $sql = "CREATE TABLE IF NOT EXISTS `{$tableName}` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                submission_id INT NOT NULL,
                submitted_by INT NOT NULL,
                office_id INT NOT NULL,
                status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                submitted_at TIMESTAMP NULL,
                reviewed_by INT NULL,
                reviewed_at TIMESTAMP NULL,
                review_notes TEXT,
                FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE,
                FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
            
            $this->db->exec($sql);
            
            // Add custom columns if provided
            foreach ($columns as $column) {
                $this->addColumn($tableName, $column);
            }
            
            $this->db->commit();
            return [
                'success' => true,
                'table_name' => $tableName,
                'message' => 'Report type created successfully'
            ];
            
        } catch (PDOException $e) {
            $this->db->rollBack();
            return [
                'success' => false,
                'message' => 'Failed to create report type: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Add a column to a report table
     */
    public function addColumn($tableName, $column) {
        try {
            $sql = "ALTER TABLE `{$tableName}` ADD COLUMN `{$column['name']}` {$column['type']}";
            
            if (isset($column['required']) && $column['required']) {
                $sql .= ' NOT NULL';
            }
            
            if (isset($column['default'])) {
                $sql .= " DEFAULT '{$column['default']}'";
            }
            
            $this->db->exec($sql);
            return true;
            
        } catch (PDOException $e) {
            throw new Exception("Failed to add column: " . $e->getMessage());
        }
    }
    
    /**
     * Submit report data
     */
    public function submitReportData($tableName, $data, $submittedBy, $officeId) {
        try {
            // Start building the query
            $columns = ['submitted_by', 'office_id', 'status', 'created_at', 'updated_at', 'submitted_at'];
            $placeholders = [':submitted_by', ':office_id', ':status', 'NOW()', 'NOW()', 'NOW()'];
            $values = [
                ':submitted_by' => $submittedBy,
                ':office_id' => $officeId,
                ':status' => 'submitted'
            ];
            
            // Add data fields
            foreach ($data as $key => $value) {
                $columns[] = $key;
                $param = ':' . $key;
                $placeholders[] = $param;
                $values[$param] = $value;
            }
            
            // Prepare and execute the query
            $columnsStr = '`' . implode('`, `', $columns) . '`';
            $placeholdersStr = implode(', ', $placeholders);
            
            $sql = "INSERT INTO `{$tableName}` ({$columnsStr}) VALUES ({$placeholdersStr})";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($values);
            
            return [
                'success' => true,
                'id' => $this->db->lastInsertId(),
                'message' => 'Report submitted successfully'
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Failed to submit report: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Get report data with pagination
     */
    public function getReportData($tableName, $page = 1, $pageSize = 10, $filters = []) {
        try {
            $offset = ($page - 1) * $pageSize;
            $where = [];
            $params = [];
            
            // Build where clause from filters
            foreach ($filters as $key => $value) {
                $where[] = "`{$key}` = :{$key}";
                $params[":{$key}"] = $value;
            }
            
            $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
            
            // Get paginated data
            $sql = "SELECT * FROM `{$tableName}` {$whereClause} ORDER BY created_at DESC LIMIT :offset, :limit";
            $stmt = $this->db->prepare($sql);
            
            // Bind parameters
            $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
            $stmt->bindValue(':limit', (int)$pageSize, PDO::PARAM_INT);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get total count
            $countSql = "SELECT COUNT(*) as total FROM `{$tableName}` {$whereClause}";
            $countStmt = $this->db->prepare($countSql);
            $countStmt->execute($params);
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            return [
                'success' => true,
                'data' => $data,
                'pagination' => [
                    'total' => (int)$total,
                    'page' => (int)$page,
                    'page_size' => (int)$pageSize,
                    'total_pages' => ceil($total / $pageSize)
                ]
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Failed to fetch report data: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Update report status
     */
    public function updateReportStatus($tableName, $recordId, $status, $reviewedBy = null, $reviewNotes = '') {
        try {
            $sql = "UPDATE `{$tableName}` 
                   SET status = :status, 
                       reviewed_by = :reviewed_by, 
                       reviewed_at = NOW(),
                       review_notes = :review_notes,
                       updated_at = NOW()
                   WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                ':status' => $status,
                ':reviewed_by' => $reviewedBy,
                ':review_notes' => $reviewNotes,
                ':id' => $recordId
            ]);
            
            return [
                'success' => $result,
                'affected_rows' => $stmt->rowCount(),
                'message' => $result ? 'Status updated successfully' : 'No records updated'
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Failed to update status: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Get report metadata
     */
    public function getReportMetadata($reportId = null) {
        try {
            if ($reportId) {
                $stmt = $this->db->prepare("SELECT * FROM {$this->reportsMetadataTable} WHERE report_id = ?");
                $stmt->execute([$reportId]);
                return $stmt->fetch(PDO::FETCH_ASSOC);
            } else {
                $stmt = $this->db->query("SELECT * FROM {$this->reportsMetadataTable} ORDER BY display_name");
                return $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
        } catch (PDOException $e) {
            return [];
        }
    }
    
    /**
     * Get report schema (column definitions)
     */
    public function getReportSchema($tableName) {
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    COLUMN_NAME,
                    DATA_TYPE,
                    CHARACTER_MAXIMUM_LENGTH,
                    IS_NULLABLE,
                    COLUMN_DEFAULT,
                    COLUMN_COMMENT
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
            
            ");
            
            $stmt->execute([$tableName]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            return [];
        }
    }
    
    /**
     * Delete a report type and optionally its data
     */
    public function deleteReportType($reportId, $deleteData = false) {
        try {
            $this->db->beginTransaction();
            
            // Get the table name
            $metadata = $this->getReportMetadata($reportId);
            if (!$metadata) {
                throw new Exception('Report not found');
            }
            
            $tableName = $metadata['table_name'];
            
            // Delete the metadata
            $stmt = $this->db->prepare("DELETE FROM {$this->reportsMetadataTable} WHERE report_id = ?");
            $stmt->execute([$reportId]);
            
            // Delete the table if requested
            if ($deleteData) {
                $this->db->exec("DROP TABLE IF EXISTS `{$tableName}`");
            }
            
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => 'Report type deleted successfully',
                'table_dropped' => $deleteData
            ];
            
        } catch (Exception $e) {
            $this->db->rollBack();
            return [
                'success' => false,
                'message' => 'Failed to delete report type: ' . $e->getMessage()
            ];
        }
    }
}
