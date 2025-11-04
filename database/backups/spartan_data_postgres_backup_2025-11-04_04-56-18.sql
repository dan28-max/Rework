-- PostgreSQL Backup for spartan_data database
-- Generated: 2025-11-04 04:56:18
-- Converted from MySQL


-- Table: activity_logs
DROP TABLE IF EXISTS activity_logs CASCADE;

CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_id ON activity_logs (user_id);
CREATE INDEX idx_created ON activity_logs (created_at);

INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('170', '1', 'table_assignment', 'Assigned admissiondata table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:03');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('171', '1', 'table_assignment', 'Assigned enrollmentdata table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:03');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('172', '1', 'table_assignment', 'Assigned graduatesdata table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:03');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('173', '1', 'table_assignment', 'Assigned employee table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:03');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('174', '1', 'table_assignment', 'Assigned leaveprivilege table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('175', '1', 'table_assignment', 'Assigned libraryvisitor table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('176', '1', 'table_assignment', 'Assigned pwd table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('177', '1', 'table_assignment', 'Assigned waterconsumption table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('178', '1', 'table_assignment', 'Assigned treatedwastewater table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('179', '1', 'table_assignment', 'Assigned electricityconsumption table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('180', '1', 'table_assignment', 'Assigned solidwaste table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('181', '1', 'table_assignment', 'Assigned campuspopulation table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('182', '1', 'table_assignment', 'Assigned foodwaste table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('183', '1', 'table_assignment', 'Assigned fuelconsumption table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('184', '1', 'table_assignment', 'Assigned distancetraveled table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('185', '1', 'table_assignment', 'Assigned budgetexpenditure table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('186', '1', 'table_assignment', 'Assigned flightaccommodation table to RGO', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:02:04');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('187', '1', 'table_assignment', 'Assigned admissiondata table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('188', '1', 'table_assignment', 'Assigned enrollmentdata table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('189', '1', 'table_assignment', 'Assigned graduatesdata table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('190', '1', 'table_assignment', 'Assigned employee table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('191', '1', 'table_assignment', 'Assigned leaveprivilege table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('192', '1', 'table_assignment', 'Assigned libraryvisitor table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('193', '1', 'table_assignment', 'Assigned pwd table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('194', '1', 'table_assignment', 'Assigned waterconsumption table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('195', '1', 'table_assignment', 'Assigned treatedwastewater table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('196', '1', 'table_assignment', 'Assigned electricityconsumption table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('197', '1', 'table_assignment', 'Assigned solidwaste table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('198', '1', 'table_assignment', 'Assigned campuspopulation table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('199', '1', 'table_assignment', 'Assigned foodwaste table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('200', '1', 'table_assignment', 'Assigned fuelconsumption table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('201', '1', 'table_assignment', 'Assigned distancetraveled table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('202', '1', 'table_assignment', 'Assigned budgetexpenditure table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('203', '1', 'table_assignment', 'Assigned flightaccommodation table to GSO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:05:37');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('204', '1', 'table_assignment', 'Assigned admissiondata table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('205', '1', 'table_assignment', 'Assigned enrollmentdata table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('206', '1', 'table_assignment', 'Assigned graduatesdata table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('207', '1', 'table_assignment', 'Assigned employee table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('208', '1', 'table_assignment', 'Assigned leaveprivilege table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('209', '1', 'table_assignment', 'Assigned libraryvisitor table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('210', '1', 'table_assignment', 'Assigned pwd table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('211', '1', 'table_assignment', 'Assigned waterconsumption table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('212', '1', 'table_assignment', 'Assigned treatedwastewater table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('213', '1', 'table_assignment', 'Assigned electricityconsumption table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('214', '1', 'table_assignment', 'Assigned solidwaste table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('215', '1', 'table_assignment', 'Assigned campuspopulation table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('216', '1', 'table_assignment', 'Assigned foodwaste table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('217', '1', 'table_assignment', 'Assigned fuelconsumption table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('218', '1', 'table_assignment', 'Assigned distancetraveled table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('219', '1', 'table_assignment', 'Assigned budgetexpenditure table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('220', '1', 'table_assignment', 'Assigned flightaccommodation table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:07:30');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('221', '32', 'report_submission', 'Submitted report: Admission Data (1 records)', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:19:09');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('222', '32', 'report_submission', 'Submitted report: Admission Data (1 records)', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:19:24');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('223', '32', 'report_submission', 'Submitted report: Admission Data (1 records)', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:19:36');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('224', '32', 'report_submission', 'Submitted report: Enrollment Data (1 records)', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:21:55');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('225', '32', 'report_submission', 'Submitted report: Admission Data (1 records)', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:28:15');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('226', '1', 'table_assignment', 'Assigned admissiondata table to RGO Lipa', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:29:17');
INSERT INTO activity_logs (id, user_id, action, description, details, ip_address, user_agent, created_at) VALUES ('227', '32', 'report_submission', 'Submitted report: Graduates Data (1 records)', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-11-04 08:31:10');


-- Table: admissiondata
DROP TABLE IF EXISTS admissiondata CASCADE;

CREATE TABLE admissiondata (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    semester VARCHAR(50),
    academic_year VARCHAR(20),
    category VARCHAR(100),
    program VARCHAR(200),
    male INTEGER DEFAULT 0,
    female INTEGER DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by VARCHAR(255),
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON admissiondata (campus);
CREATE INDEX idx_batch ON admissiondata (batch_id);


-- Table: budgetexpenditure
DROP TABLE IF EXISTS budgetexpenditure CASCADE;

CREATE TABLE budgetexpenditure (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    year VARCHAR(10),
    particulars TEXT,
    category VARCHAR(200),
    budget_allocation NUMERIC(15,2) DEFAULT 0.00,
    actual_expenditure NUMERIC(15,2) DEFAULT 0.00,
    utilization_rate NUMERIC(5,2) DEFAULT 0.00,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON budgetexpenditure (campus);
CREATE INDEX idx_batch ON budgetexpenditure (batch_id);


-- Table: campuspopulation
DROP TABLE IF EXISTS campuspopulation CASCADE;

CREATE TABLE campuspopulation (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    year VARCHAR(10) NOT NULL,
    students INTEGER DEFAULT 0,
    is_students INTEGER DEFAULT 0,
    employees INTEGER DEFAULT 0,
    canteen INTEGER DEFAULT 0,
    construction INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON campuspopulation (campus);
CREATE INDEX idx_batch ON campuspopulation (batch_id);


-- Table: dashboard_stats
DROP TABLE IF EXISTS dashboard_stats CASCADE;

CREATE TABLE dashboard_stats (
    id SERIAL PRIMARY KEY,
    stat_name VARCHAR(255) NOT NULL,
    stat_value VARCHAR(255) NOT NULL,
    stat_type VARCHAR('number','percentage','text') DEFAULT 'number',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO dashboard_stats (id, stat_name, stat_value, stat_type, updated_at) VALUES ('1', 'total_users', '24', 'number', '2025-10-10 02:08:53');
INSERT INTO dashboard_stats (id, stat_name, stat_value, stat_type, updated_at) VALUES ('2', 'data_records', '0', 'number', '2025-10-10 02:08:53');
INSERT INTO dashboard_stats (id, stat_name, stat_value, stat_type, updated_at) VALUES ('3', 'growth_rate', '0', 'percentage', '2025-10-10 02:08:53');
INSERT INTO dashboard_stats (id, stat_name, stat_value, stat_type, updated_at) VALUES ('4', 'security_score', '100', 'percentage', '2025-10-10 02:08:53');
INSERT INTO dashboard_stats (id, stat_name, stat_value, stat_type, updated_at) VALUES ('5', 'system_uptime', '99.9', 'percentage', '2025-10-10 02:08:53');
INSERT INTO dashboard_stats (id, stat_name, stat_value, stat_type, updated_at) VALUES ('6', 'response_time', '245', 'number', '2025-10-10 02:08:53');


-- Table: data_submissions
DROP TABLE IF EXISTS data_submissions CASCADE;

CREATE TABLE data_submissions (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    assigned_office VARCHAR(100) NOT NULL,
    submitted_by INTEGER NOT NULL,
    submission_data TEXT,
    record_count INTEGER DEFAULT 0,
    status VARCHAR('pending','approved','rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER,
    reviewed_at TIMESTAMP,
    review_notes TEXT
);

CREATE INDEX submitted_by ON data_submissions (submitted_by);
CREATE INDEX reviewed_by ON data_submissions (reviewed_by);
CREATE INDEX idx_office ON data_submissions (assigned_office);
CREATE INDEX idx_status ON data_submissions (status);


-- Table: distancetraveled
DROP TABLE IF EXISTS distancetraveled CASCADE;

CREATE TABLE distancetraveled (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    travel_date DATE,
    plate_no VARCHAR(50),
    vehicle VARCHAR(100),
    fuel_type VARCHAR(50),
    start_mileage NUMERIC(10,2) DEFAULT 0.00,
    end_mileage NUMERIC(10,2) DEFAULT 0.00,
    total_km NUMERIC(10,2) DEFAULT 0.00,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON distancetraveled (campus);
CREATE INDEX idx_batch ON distancetraveled (batch_id);


-- Table: drafts
DROP TABLE IF EXISTS drafts CASCADE;

CREATE TABLE drafts (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(255) NOT NULL,
    data TEXT,
    office VARCHAR(100) NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX created_by ON drafts (created_by);


-- Table: electricityconsumption
DROP TABLE IF EXISTS electricityconsumption CASCADE;

CREATE TABLE electricityconsumption (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    month VARCHAR(20),
    year VARCHAR(10),
    prev_reading NUMERIC(10,2) DEFAULT 0.00,
    current_reading NUMERIC(10,2) DEFAULT 0.00,
    actual_consumption NUMERIC(10,2) DEFAULT 0.00,
    multiplier NUMERIC(10,2) DEFAULT 1.00,
    total_consumption NUMERIC(10,2) DEFAULT 0.00,
    total_amount NUMERIC(10,2) DEFAULT 0.00,
    price_per_kwh NUMERIC(10,2) DEFAULT 0.00,
    remarks TEXT,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON electricityconsumption (campus);
CREATE INDEX idx_batch ON electricityconsumption (batch_id);


-- Table: employee
DROP TABLE IF EXISTS employee CASCADE;

CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    date_generated DATE,
    category VARCHAR(100),
    faculty_rank VARCHAR(100),
    sex VARCHAR(20),
    status VARCHAR(50),
    date_hired DATE,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON employee (campus);
CREATE INDEX idx_batch ON employee (batch_id);


-- Table: enrollmentdata
DROP TABLE IF EXISTS enrollmentdata CASCADE;

CREATE TABLE enrollmentdata (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20),
    semester VARCHAR(50),
    college VARCHAR(200),
    graduate_undergrad VARCHAR(50),
    program_course VARCHAR(200),
    male INTEGER DEFAULT 0,
    female INTEGER DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON enrollmentdata (campus);
CREATE INDEX idx_batch ON enrollmentdata (batch_id);

INSERT INTO enrollmentdata (id, campus, academic_year, semester, college, graduate_undergrad, program_course, male, female, batch_id, submitted_by, submitted_at, created_at, updated_at) VALUES ('5', '', '', 'First Semester', '', NULL, NULL, '0', '0', '20251104012155_690947235728d_RGO', '0', '2025-11-04 08:21:55', '2025-11-04 08:21:55', '2025-11-04 08:21:55');


-- Table: flightaccommodation
DROP TABLE IF EXISTS flightaccommodation CASCADE;

CREATE TABLE flightaccommodation (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    department VARCHAR(200),
    year VARCHAR(10),
    traveler VARCHAR(255),
    purpose TEXT,
    from_location VARCHAR(200),
    to_location VARCHAR(200),
    country VARCHAR(100),
    type VARCHAR(50),
    rooms INTEGER DEFAULT 0,
    nights INTEGER DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON flightaccommodation (campus);
CREATE INDEX idx_batch ON flightaccommodation (batch_id);


-- Table: foodwaste
DROP TABLE IF EXISTS foodwaste CASCADE;

CREATE TABLE foodwaste (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    date DATE,
    quantity_kg NUMERIC(10,2) DEFAULT 0.00,
    remarks TEXT,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON foodwaste (campus);
CREATE INDEX idx_batch ON foodwaste (batch_id);


-- Table: fuelconsumption
DROP TABLE IF EXISTS fuelconsumption CASCADE;

CREATE TABLE fuelconsumption (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    date DATE,
    driver VARCHAR(255),
    vehicle VARCHAR(100),
    plate_no VARCHAR(50),
    fuel_type VARCHAR(50),
    description TEXT,
    transaction_no VARCHAR(100),
    odometer NUMERIC(10,2) DEFAULT 0.00,
    qty NUMERIC(10,2) DEFAULT 0.00,
    total_amount NUMERIC(10,2) DEFAULT 0.00,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON fuelconsumption (campus);
CREATE INDEX idx_batch ON fuelconsumption (batch_id);


-- Table: graduatesdata
DROP TABLE IF EXISTS graduatesdata CASCADE;

CREATE TABLE graduatesdata (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20),
    semester VARCHAR(50),
    degree_level VARCHAR(100),
    subject_area VARCHAR(200),
    course VARCHAR(200),
    category VARCHAR(200),
    male INTEGER DEFAULT 0,
    female INTEGER DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON graduatesdata (campus);
CREATE INDEX idx_batch ON graduatesdata (batch_id);

INSERT INTO graduatesdata (id, campus, academic_year, semester, degree_level, subject_area, course, category, male, female, batch_id, submitted_by, submitted_at, created_at, updated_at) VALUES ('7', '', '', '', '', '', '', NULL, '0', '0', '20251104013110_6909494eca48b_RGO', '0', '2025-11-04 08:31:10', '2025-11-04 08:31:10', '2025-11-04 08:31:10');


-- Table: leaveprivilege
DROP TABLE IF EXISTS leaveprivilege CASCADE;

CREATE TABLE leaveprivilege (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    leave_type VARCHAR(100),
    employee_name VARCHAR(255),
    duration_days INTEGER DEFAULT 0,
    equivalent_pay NUMERIC(10,2) DEFAULT 0.00,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON leaveprivilege (campus);
CREATE INDEX idx_batch ON leaveprivilege (batch_id);


-- Table: libraryvisitor
DROP TABLE IF EXISTS libraryvisitor CASCADE;

CREATE TABLE libraryvisitor (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    visit_date DATE,
    category VARCHAR(100),
    sex VARCHAR(20),
    total_visitors INTEGER DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON libraryvisitor (campus);
CREATE INDEX idx_batch ON libraryvisitor (batch_id);


-- Table: pwd
DROP TABLE IF EXISTS pwd CASCADE;

CREATE TABLE pwd (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    year VARCHAR(10),
    disability_type VARCHAR(100),
    male INTEGER DEFAULT 0,
    female INTEGER DEFAULT 0,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON pwd (campus);
CREATE INDEX idx_batch ON pwd (batch_id);


-- Table: report_assignments
DROP TABLE IF EXISTS report_assignments CASCADE;

CREATE TABLE report_assignments (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(255) NOT NULL,
    assigned_office VARCHAR(100) NOT NULL,
    assigned_campus VARCHAR(100) NOT NULL,
    assigned_by INTEGER NOT NULL,
    assigned_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR('active','completed','cancelled') DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX assigned_by ON report_assignments (assigned_by);


-- Table: report_submission_data
DROP TABLE IF EXISTS report_submission_data CASCADE;

CREATE TABLE report_submission_data (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL,
    row_data TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX submission_id ON report_submission_data (submission_id);

INSERT INTO report_submission_data (id, submission_id, row_data, created_at) VALUES ('58', '96', '{"Campus":"","Semester":"First Semester","Academic Year":"2025-2026","Category":"Total No. of Applicants","Program":"","Male":"","Female":""}', '2025-11-04 08:19:09');
INSERT INTO report_submission_data (id, submission_id, row_data, created_at) VALUES ('59', '97', '{"Campus":"","Semester":"First Semester","Academic Year":"2025-2026","Category":"Total No. of Applicants","Program":"","Male":"","Female":""}', '2025-11-04 08:19:24');
INSERT INTO report_submission_data (id, submission_id, row_data, created_at) VALUES ('60', '98', '{"Campus":"","Semester":"First Semester","Academic Year":"2025-2026","Category":"Total No. of Applicants","Program":"","Male":"","Female":""}', '2025-11-04 08:19:36');
INSERT INTO report_submission_data (id, submission_id, row_data, created_at) VALUES ('61', '99', '{"Campus":"","Academic Year":"","Semester":"First Semester","College":"","Graduate\/Undergrad":"Graduate","Program\/Course":"","Male":"","Female":""}', '2025-11-04 08:21:55');
INSERT INTO report_submission_data (id, submission_id, row_data, created_at) VALUES ('62', '100', '{"Campus":"","Semester":"First Semester","Academic Year":"2025-2026","Category":"Total No. of Applicants","Program":"","Male":"","Female":""}', '2025-11-04 08:28:15');
INSERT INTO report_submission_data (id, submission_id, row_data, created_at) VALUES ('63', '101', '{"Campus":"","Academic Year":"","Semester":"","Degree Level":"","Subject Area":"","Course":"","Category\/Total No. of Applicants":"Total No. Applicants","Male":"","Female":""}', '2025-11-04 08:31:10');


-- Table: report_submissions
DROP TABLE IF EXISTS report_submissions CASCADE;

CREATE TABLE report_submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER,
    report_type VARCHAR(255) NOT NULL,
    campus VARCHAR(100),
    office VARCHAR(100),
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submission_data TEXT,
    record_count INTEGER DEFAULT 0,
    status VARCHAR('pending','approved','rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER,
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    reviewed_date TIMESTAMP
);

CREATE INDEX assignment_id ON report_submissions (assignment_id);
CREATE INDEX submitted_by ON report_submissions (submitted_by);
CREATE INDEX reviewed_by ON report_submissions (reviewed_by);

INSERT INTO report_submissions (id, assignment_id, report_type, campus, office, batch_id, submitted_by, submission_data, record_count, status, submitted_at, reviewed_by, reviewed_at, review_notes, reviewed_date) VALUES ('96', NULL, 'admissiondata', 'Lipa', 'RGO', '20251104011909_6909467da61e7_RGO', '32', NULL, '0', 'pending', '2025-11-04 08:19:09', NULL, NULL, NULL, NULL);
INSERT INTO report_submissions (id, assignment_id, report_type, campus, office, batch_id, submitted_by, submission_data, record_count, status, submitted_at, reviewed_by, reviewed_at, review_notes, reviewed_date) VALUES ('97', NULL, 'admissiondata', 'Lipa', 'RGO', '20251104011924_6909468c8ef35_RGO', '32', NULL, '0', 'pending', '2025-11-04 08:19:24', NULL, NULL, NULL, NULL);
INSERT INTO report_submissions (id, assignment_id, report_type, campus, office, batch_id, submitted_by, submission_data, record_count, status, submitted_at, reviewed_by, reviewed_at, review_notes, reviewed_date) VALUES ('98', NULL, 'admissiondata', 'Lipa', 'RGO', '20251104011936_69094698a8133_RGO', '32', NULL, '0', 'pending', '2025-11-04 08:19:36', NULL, NULL, NULL, NULL);
INSERT INTO report_submissions (id, assignment_id, report_type, campus, office, batch_id, submitted_by, submission_data, record_count, status, submitted_at, reviewed_by, reviewed_at, review_notes, reviewed_date) VALUES ('99', NULL, 'enrollmentdata', 'Lipa', 'RGO', '20251104012155_690947235728d_RGO', '32', NULL, '0', 'pending', '2025-11-04 08:21:55', NULL, NULL, NULL, NULL);
INSERT INTO report_submissions (id, assignment_id, report_type, campus, office, batch_id, submitted_by, submission_data, record_count, status, submitted_at, reviewed_by, reviewed_at, review_notes, reviewed_date) VALUES ('100', NULL, 'admissiondata', 'Lipa', 'RGO', '20251104012815_6909489f8f4c9_RGO', '32', NULL, '0', 'pending', '2025-11-04 08:28:15', NULL, NULL, NULL, NULL);
INSERT INTO report_submissions (id, assignment_id, report_type, campus, office, batch_id, submitted_by, submission_data, record_count, status, submitted_at, reviewed_by, reviewed_at, review_notes, reviewed_date) VALUES ('101', NULL, 'graduatesdata', 'Lipa', 'RGO', '20251104013110_6909494eca48b_RGO', '32', NULL, '0', 'pending', '2025-11-04 08:31:10', NULL, NULL, NULL, NULL);


-- Table: solidwaste
DROP TABLE IF EXISTS solidwaste CASCADE;

CREATE TABLE solidwaste (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    month VARCHAR(20),
    year VARCHAR(10),
    waste_type VARCHAR(100),
    quantity NUMERIC(10,2) DEFAULT 0.00,
    remarks TEXT,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON solidwaste (campus);
CREATE INDEX idx_batch ON solidwaste (batch_id);


-- Table: system_settings
DROP TABLE IF EXISTS system_settings CASCADE;

CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX setting_key ON system_settings (setting_key);

INSERT INTO system_settings (id, setting_key, setting_value, description, created_at, updated_at) VALUES ('1', 'system_name', 'Spartan Data', 'Name of the system', '2025-10-10 02:08:53', '2025-10-10 02:08:53');
INSERT INTO system_settings (id, setting_key, setting_value, description, created_at, updated_at) VALUES ('2', 'theme_color', 'white_red', 'Current theme colors', '2025-10-10 02:08:53', '2025-10-10 02:08:53');
INSERT INTO system_settings (id, setting_key, setting_value, description, created_at, updated_at) VALUES ('3', 'session_timeout', '3600', 'Session timeout in seconds', '2025-10-10 02:08:53', '2025-10-10 02:08:53');
INSERT INTO system_settings (id, setting_key, setting_value, description, created_at, updated_at) VALUES ('4', 'max_login_attempts', '5', 'Maximum login attempts before lockout', '2025-10-10 02:08:53', '2025-10-10 02:08:53');
INSERT INTO system_settings (id, setting_key, setting_value, description, created_at, updated_at) VALUES ('5', 'maintenance_mode', '0', 'System maintenance mode (0=off, 1=on)', '2025-10-10 02:08:53', '2025-10-10 02:08:53');


-- Table: table_assignments
DROP TABLE IF EXISTS table_assignments CASCADE;

CREATE TABLE table_assignments (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    assigned_office VARCHAR(100) NOT NULL,
    description TEXT,
    deadline DATE,
    has_deadline SMALLINT DEFAULT 0,
    priority VARCHAR('low','medium','high','urgent') DEFAULT 'medium',
    notes TEXT,
    assigned_by INTEGER NOT NULL,
    assigned_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR('active','completed','cancelled') DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX assigned_by ON table_assignments (assigned_by);
CREATE INDEX idx_office ON table_assignments (assigned_office);
CREATE INDEX idx_status ON table_assignments (status);
CREATE INDEX idx_deadline ON table_assignments (deadline);
CREATE INDEX idx_priority ON table_assignments (priority);
CREATE INDEX idx_has_deadline ON table_assignments (has_deadline);

INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('136', 'admissiondata', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:03', 'completed', '2025-11-04 08:02:03', '2025-11-04 08:19:09');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('137', 'enrollmentdata', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:03', 'completed', '2025-11-04 08:02:03', '2025-11-04 08:21:55');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('138', 'graduatesdata', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:03', 'completed', '2025-11-04 08:02:03', '2025-11-04 08:31:10');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('139', 'employee', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:03', 'active', '2025-11-04 08:02:03', '2025-11-04 08:02:03');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('140', 'leaveprivilege', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:03', 'active', '2025-11-04 08:02:03', '2025-11-04 08:02:03');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('141', 'libraryvisitor', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('142', 'pwd', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('143', 'waterconsumption', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('144', 'treatedwastewater', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('145', 'electricityconsumption', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('146', 'solidwaste', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('147', 'campuspopulation', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('148', 'foodwaste', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('149', 'fuelconsumption', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('150', 'distancetraveled', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('151', 'budgetexpenditure', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('152', 'flightaccommodation', 'RGO', '', NULL, '0', 'low', '', '1', '2025-11-04 08:02:04', 'active', '2025-11-04 08:02:04', '2025-11-04 08:02:04');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('153', 'admissiondata', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('154', 'enrollmentdata', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('155', 'graduatesdata', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('156', 'employee', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('157', 'leaveprivilege', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('158', 'libraryvisitor', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('159', 'pwd', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('160', 'waterconsumption', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('161', 'treatedwastewater', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('162', 'electricityconsumption', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('163', 'solidwaste', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('164', 'campuspopulation', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('165', 'foodwaste', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('166', 'fuelconsumption', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('167', 'distancetraveled', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('168', 'budgetexpenditure', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('169', 'flightaccommodation', 'GSO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:05:37', 'active', '2025-11-04 08:05:37', '2025-11-04 08:05:37');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('170', 'admissiondata', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 10:34:11', 'active', '2025-11-04 08:07:30', '2025-11-04 10:34:11');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('171', 'enrollmentdata', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'completed', '2025-11-04 08:07:30', '2025-11-04 08:21:55');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('172', 'graduatesdata', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'completed', '2025-11-04 08:07:30', '2025-11-04 08:31:10');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('173', 'employee', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('174', 'leaveprivilege', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('175', 'libraryvisitor', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('176', 'pwd', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('177', 'waterconsumption', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('178', 'treatedwastewater', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('179', 'electricityconsumption', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('180', 'solidwaste', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('181', 'campuspopulation', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('182', 'foodwaste', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('183', 'fuelconsumption', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('184', 'distancetraveled', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('185', 'budgetexpenditure', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('186', 'flightaccommodation', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 08:07:30', 'active', '2025-11-04 08:07:30', '2025-11-04 08:07:30');
INSERT INTO table_assignments (id, table_name, assigned_office, description, deadline, has_deadline, priority, notes, assigned_by, assigned_date, status, created_at, updated_at) VALUES ('187', 'admissiondata', 'RGO Lipa', '', NULL, '0', 'low', '', '1', '2025-11-04 10:34:11', 'active', '2025-11-04 08:29:17', '2025-11-04 10:34:11');


-- Table: treatedwastewater
DROP TABLE IF EXISTS treatedwastewater CASCADE;

CREATE TABLE treatedwastewater (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    date DATE,
    treated_volume NUMERIC(10,2) DEFAULT 0.00,
    reused_volume NUMERIC(10,2) DEFAULT 0.00,
    effluent_volume NUMERIC(10,2) DEFAULT 0.00,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON treatedwastewater (campus);
CREATE INDEX idx_batch ON treatedwastewater (batch_id);


-- Table: user_sessions
DROP TABLE IF EXISTS user_sessions CASCADE;

CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX session_id ON user_sessions (session_id);
CREATE INDEX idx_user_id ON user_sessions (user_id);
CREATE INDEX idx_expires ON user_sessions (expires_at);


-- Table: users
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR('super_admin','admin','user') NOT NULL DEFAULT 'user',
    campus VARCHAR(100),
    office VARCHAR(100),
    status VARCHAR('active','inactive','suspended') DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    remember_token VARCHAR(255)
);

CREATE UNIQUE INDEX username ON users (username);
CREATE INDEX idx_username ON users (username);
CREATE INDEX idx_role ON users (role);
CREATE INDEX idx_status ON users (status);
CREATE INDEX idx_campus ON users (campus);
CREATE INDEX idx_office ON users (office);

INSERT INTO users (id, username, password, name, role, campus, office, status, created_at, updated_at, last_login, remember_token) VALUES ('1', 'superadmin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Administrator', 'super_admin', 'Main Campus', 'Administration', 'active', '2025-10-10 02:08:53', '2025-11-04 10:33:45', '2025-11-04 10:33:45', NULL);
INSERT INTO users (id, username, password, name, role, campus, office, status, created_at, updated_at, last_login, remember_token) VALUES ('31', 'admin-lipa', '$2y$10$HVxC4djS8Ryv1swIbFOuEOznuWVmjbwQGMs1mhXKC3rTyEzTvoq0W', 'admin-lipa', 'admin', 'Lipa', '', 'active', '2025-10-28 00:18:32', '2025-11-04 07:39:32', '2025-11-04 07:39:32', NULL);
INSERT INTO users (id, username, password, name, role, campus, office, status, created_at, updated_at, last_login, remember_token) VALUES ('32', 'lipa-rgo', '$2y$10$isKibZ2tXpWXfHK.btbn9.iaHF0By3Vzg/x3bdaB5grirlZ.wd4EK', 'lipa-rgo', 'user', 'Lipa', 'RGO', 'active', '2025-10-28 00:32:25', '2025-11-04 10:35:14', '2025-11-04 10:35:14', NULL);
INSERT INTO users (id, username, password, name, role, campus, office, status, created_at, updated_at, last_login, remember_token) VALUES ('34', 'admin-san-juan', '$2y$10$wv3lAx15nEW.rAJj9bHIdet2euqpFwnTrVUK5cWGaLXRFq9zytHMe', 'admin-san-juan', 'admin', 'San Juan', '', 'active', '2025-10-28 11:31:37', '2025-11-03 00:13:50', '2025-11-03 00:13:50', NULL);
INSERT INTO users (id, username, password, name, role, campus, office, status, created_at, updated_at, last_login, remember_token) VALUES ('35', 'gso-san-juan', '$2y$10$zEPqkaBIG2An9y0EAKM6pexItcTFwByRM2UFTx0hNSrHLrS.rL.6K', 'gso-san-juan', 'user', 'San Juan', 'GSO', 'active', '2025-10-28 11:34:21', '2025-11-03 00:18:58', '2025-11-03 00:18:58', NULL);
INSERT INTO users (id, username, password, name, role, campus, office, status, created_at, updated_at, last_login, remember_token) VALUES ('36', 'rgo-san-juan', '$2y$10$IFJxKhAyblSSpX01YWnlb.1A6M7oMO9aAW02SHUobb8cNKK.JTyw6', 'rgo-san-juan', 'user', 'San Juan', 'RGO', 'active', '2025-11-02 23:55:29', '2025-11-03 00:41:44', '2025-11-03 00:41:44', NULL);
INSERT INTO users (id, username, password, name, role, campus, office, status, created_at, updated_at, last_login, remember_token) VALUES ('37', 'lipa-gso', '$2y$10$o2V61P4Zm36QM.bBQOz7jeA0oZsKzMsP6M2DxDDmQ0j0VdrUzL9ci', 'lipa-gso', 'user', 'Lipa', 'GSO', 'active', '2025-11-03 00:17:17', '2025-11-04 08:06:06', '2025-11-04 08:06:06', NULL);
INSERT INTO users (id, username, password, name, role, campus, office, status, created_at, updated_at, last_login, remember_token) VALUES ('38', 'admin-alangilan', '$2y$10$7D3o4ffZnjw.yEGXpqwk9O7CNtLiMVD6LhtgoSraZxdMUMCcExdZC', 'admin-alangilan', 'admin', 'Alangilan', '', 'active', '2025-11-03 04:32:46', '2025-11-03 04:33:15', '2025-11-03 04:33:15', NULL);


-- Table: waterconsumption
DROP TABLE IF EXISTS waterconsumption CASCADE;

CREATE TABLE waterconsumption (
    id SERIAL PRIMARY KEY,
    campus VARCHAR(100) NOT NULL,
    date DATE,
    category VARCHAR(100),
    prev_reading NUMERIC(10,2) DEFAULT 0.00,
    current_reading NUMERIC(10,2) DEFAULT 0.00,
    quantity_m3 NUMERIC(10,2) DEFAULT 0.00,
    total_amount NUMERIC(10,2) DEFAULT 0.00,
    price_per_m3 NUMERIC(10,2) DEFAULT 0.00,
    month VARCHAR(20),
    year VARCHAR(10),
    remarks TEXT,
    batch_id VARCHAR(100),
    submitted_by INTEGER,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campus ON waterconsumption (campus);
CREATE INDEX idx_batch ON waterconsumption (batch_id);

