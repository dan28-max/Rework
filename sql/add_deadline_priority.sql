-- Add deadline and priority fields to table_assignments
ALTER TABLE table_assignments 
ADD COLUMN deadline DATE NULL AFTER description,
ADD COLUMN has_deadline TINYINT(1) DEFAULT 0 AFTER deadline,
ADD COLUMN priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' AFTER has_deadline,
ADD COLUMN notes TEXT NULL AFTER priority;

-- Add index for deadline queries
CREATE INDEX idx_deadline ON table_assignments(deadline);
CREATE INDEX idx_priority ON table_assignments(priority);
CREATE INDEX idx_has_deadline ON table_assignments(has_deadline);

-- Update existing records to have no deadline by default
UPDATE table_assignments SET has_deadline = 0 WHERE has_deadline IS NULL;
