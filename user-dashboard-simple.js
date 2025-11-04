/**
 * Simplified User Dashboard JavaScript
 * Focus on clean, working report submission functionality
 */

class SimpleUserDashboard {
    constructor() {
        this.currentTask = null;
        this.init();
    }

    init() {
        this.setupNavigation();
        // Load reports when data section is shown (default section)
        this.showSection('data');
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.getAttribute('data-section');
                this.showSection(target);
            });
        });
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Add active class to clicked nav item
        const activeItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Load section-specific content
        if (sectionId === 'data') {
            this.loadAssignedReports();
        }
    }

    getOfficeFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('office') || 'emu'; // Default to 'emu' if not specified
    }

    async loadAssignedReports() {
        try {
            const office = this.getOfficeFromUrl();
            if (!office) {
                document.getElementById('simpleReportsList').innerHTML = 
                    '<p style="text-align: center; color: #666; padding: 40px;">No office specified.</p>';
                return;
            }

            // Add cache busting parameter to force fresh data
            const timestamp = new Date().getTime();
            const response = await fetch(`api/user_tasks.php?action=get_assigned&office=${encodeURIComponent(office)}&_t=${timestamp}`, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            const result = await response.json();

            console.log('API Response:', JSON.stringify(result, null, 2)); // Debug log
            console.log('Number of tasks returned:', result.data ? result.data.length : 0);

            if (result.success && result.data) {
                this.displaySimpleReports(result.data);
            } else {
                document.getElementById('simpleReportsList').innerHTML = 
                    '<p style="text-align: center; color: #666; padding: 40px;">No assigned reports at this time.</p>';
            }
        } catch (error) {
            console.error('Error loading reports:', error);
            document.getElementById('simpleReportsList').innerHTML = 
                '<p style="text-align: center; color: #e74c3c; padding: 40px;">Error loading reports. Please try again.</p>';
        }
    }

    displaySimpleReports(reports) {
        const listEl = document.getElementById('simpleReportsList');
        if (!listEl) return;

        listEl.innerHTML = '';

        reports.forEach(report => {
            const reportCard = document.createElement('div');
            reportCard.className = 'report-table-card';
            
            const tableDisplayName = this.formatTableName(report.table_name);
            const assignedDate = new Date(report.assigned_date).toLocaleDateString();
            
            reportCard.innerHTML = `
                <div class="report-table-card" data-task-id="${report.id}" onclick="window.simpleDashboard.openReportModal('${report.table_name}', '${report.assigned_office}', '${report.description}', ${report.id})">
                    <div class="report-card-header">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div class="report-icon">
                                <i class="fas fa-table"></i>
                            </div>
                            <div class="report-title">
                                <h3>${report.table_name}</h3>
                                <p class="report-subtitle">${report.assigned_office}</p>
                            </div>
                        </div>
                        <div class="status-badge pending">Pending</div>
                    </div>
                </div>
                <div class="report-card-body">
                    <div class="report-details">
                        <div class="detail-item">
                            <i class="fas fa-building"></i>
                            <span>Office: ${report.assigned_office}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span>Assigned: ${assignedDate}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-database"></i>
                            <span>Table: ${report.table_name}</span>
                        </div>
                    </div>
                </div>
                <div class="report-card-footer">
                        <button class="btn-start-entry" onclick="window.simpleDashboard.openReportModal('${report.table_name}', '${report.assigned_office}', '${report.description}', ${report.id})">
                            <i class="fas fa-edit"></i>
                            Start Data Entry
                        </button>
                </div>
            `;
            listEl.appendChild(reportCard);
        });
    }

    formatTableName(tableName) {
        const tableNames = {
            'employee': 'Employee Data',
            'admissiondata': 'Admission Data',
            'enrollmentdata': 'Enrollment Data', 
            'graduatesdata': 'Graduates Data',
            'leaveprivilege': 'Leave Privilege',
            'libraryvisitor': 'Library Visitor',
            'pwd': 'PWD',
            'campuspopulation': 'Campus Population',
            'waterconsumption': 'Water Consumption',
            'treatedwastewater': 'Treated Waste Water',
            'electricityconsumption': 'Electricity Consumption',
            'solidwaste': 'Solid Waste',
            'foodwaste': 'Food Waste',
            'fuelconsumption': 'Fuel Consumption',
            'distancetraveled': 'Distance Traveled',
            'budgetexpenditure': 'Budget Expenditure',
            'flightaccommodation': 'Flight Accommodation'
        };
        return tableNames[tableName] || tableName.charAt(0).toUpperCase() + tableName.slice(1);
    }

    openReportModal(tableName, office, description, taskId) {
        this.currentTask = { 
            tableName, 
            table_name: tableName,
            office, 
            description, 
            id: taskId 
        };
        
        // Create simple modal
        const modal = document.createElement('div');
        modal.id = 'simpleReportModal';
        modal.className = 'simple-modal';
        modal.innerHTML = `
            <div class="simple-modal-content">
                <div class="modal-header">
                    <h2>Data Entry: ${tableName}</h2>
                    <button class="close-btn" onclick="window.simpleDashboard.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Office:</strong> ${office}</p>
                    <p><strong>Description:</strong> ${description}</p>
                    
                    <div class="data-entry-section">
                        <h3>Enter Data</h3>
                        <div id="simpleDataTable">
                            <table class="simple-table">
                                <thead id="simpleTableHead"></thead>
                                <tbody id="simpleTableBody"></tbody>
                            </table>
                        </div>
                        <button class="add-row-btn" onclick="window.simpleDashboard.addDataEntryRow()">Add Row</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="cancel-btn" onclick="window.simpleDashboard.closeModal()">Cancel</button>
                    <button class="submit-btn" onclick="window.simpleDashboard.submitReport()">Submit Report</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.initializeTable(tableName);
    }

    initializeTable(tableName) {
        const tableStructures = {
            employee: ["Campus", "Date Generated", "Category", "Faculty Rank", "Sex", "Status", "Date Hired"],
            admissiondata: ["Campus", "Semester", "Academic Year", "Category", "Program", "Male", "Female"],
            enrollmentdata: ["Campus", "Academic Year", "Semester", "College", "Graduate/Undergrad", "Program/Course", "Male", "Female"],
            graduatesdata: ["Campus", "Academic Year", "Semester", "Degree Level", "Subject Area", "Course", "Category/Total No. of Applicants", "Male", "Female"],
            leaveprivilege: ["Campus", "Leave Type", "Employee Name", "Duration Days", "Equivalent Pay"],
            libraryvisitor: ["Campus", "Visit Date", "Category", "Sex", "Total Visitors"],
            pwd: ["Campus", "Year", "No. of PWD Students", "No. of PWD Employees", "Type of Disability", "Sex"],
            campuspopulation: ["Campus", "Academic Year", "Semester", "Category", "Male", "Female"],
            waterconsumption: ["Campus", "Month", "Year", "Water Type", "Consumption"],
            treatedwastewater: ["Campus", "Date", "Treated Volume", "Reused Volume", "Effluent Volume"],
            electricityconsumption: ["Campus", "Category", "Month", "Year", "Prev Reading", "Current Reading", "Actual Consumption", "Multiplier", "Total Consumption", "Total Amount", "Price/kWh", "Remarks"],
            solidwaste: ["Campus", "Month", "Year", "Waste Type", "Quantity", "Remarks"],
            foodwaste: ["Campus", "Date", "Quantity (kg)", "Remarks"],
            fuelconsumption: ["Campus", "Date", "Driver", "Vehicle", "Plate No", "Fuel Type", "Description", "Transaction No", "Odometer", "Qty", "Total Amount"],
            distancetraveled: ["Campus", "Travel Date", "Plate No", "Vehicle", "Fuel Type", "Start Mileage", "End Mileage", "Total KM"],
            budgetexpenditure: ["Campus", "Year", "Particulars", "Category", "Budget Allocation", "Actual Expenditure", "Utilization Rate"],
            flightaccommodation: ["Campus", "Department", "Year", "Traveler", "Purpose", "From", "To", "Country", "Type", "Rooms", "Nights"]
        };

        const columns = tableStructures[tableName] || ["Column 1", "Column 2", "Column 3"];
        
        // Create table header
        const thead = document.getElementById('simpleTableHead');
        const headerRow = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        // Add delete column header
        const deleteHeader = document.createElement('th');
        deleteHeader.textContent = 'Actions';
        headerRow.appendChild(deleteHeader);
        
        thead.appendChild(headerRow);
        
        // Add initial row with a small delay to ensure DOM is ready
        setTimeout(() => {
            this.addDataEntryRow();
        }, 100);
    }

    createInputElement(columnName, displayName) {
        // Define dropdown options for different column types
        const dropdownOptions = {
            campus: ['Alangilan', 'Pablo Borbon', 'Lipa', 'Nasugbu', 'Balayan', 'Malvar', 'Lemery', 'Lobo', 'Mabini', 'Rosario', 'San Juan'],
            semester: ['First Semester', 'Midterm Semester', 'Second Semester'],
            category: ['Regular', 'Transferee', 'Shiftee', 'Second Courser', 'Foreign Student'],
            faculty: ['Professor', 'Associate Professor', 'Assistant Professor', 'Instructor', 'Lecturer', 'Administrative Staff', 'Support Staff'],
            rank: ['Professor', 'Associate Professor', 'Assistant Professor', 'Instructor', 'Lecturer', 'Administrative Staff', 'Support Staff'],
            sex: ['Male', 'Female'],
            status: ['Regular', 'Contractual', 'Part-time', 'Probationary', 'Casual'],
            degree: ['Undergraduate Program', 'Graduate Program', 'Postgraduate Program'],
            level: ['Undergraduate Program', 'Graduate Program', 'Postgraduate Program'],
            graduate: ['Graduate', 'Undergraduate'],
            undergrad: ['Graduate', 'Undergraduate'],
            leave: ['Maternity Leave', 'Paternity Leave', 'Solo Parent Leave', '10 Days VAWC Leave', 'Special Leave Benefits for Women'],
            type: ['Maternity Leave', 'Paternity Leave', 'Solo Parent Leave', '10 Days VAWC Leave', 'Special Leave Benefits for Women'],
            water: ['Mains', 'Deepwell', 'Drinking Water'],
            month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            year: this.generateYearOptions(),
            academic: this.generateYearOptions(),
            vehicle: ['Foton Bus', 'Honda Civic', 'Hyundai Starex', 'Isuzu Sportivo', 'Isuzu Travis', 'Mitshubishi Adventure', 'Mitshubishi L300', 'Nissan Urvan'],
            fuel: ['Diesel', 'Gasoline'],
            fueltype: ['Diesel', 'Gasoline'],
            disability: ['Visual Impairment', 'Hearing Impairment', 'Physical Disability', 'Intellectual Disability', 'Learning Disability', 'Psychosocial Disability', 'Multiple Disabilities', 'Speech Impairment', 'Chronic Illness', 'Other'],
            waste: ['Biodegradable', 'Hazardous', 'Recyclable', 'Residual'],
            wastetype: ['Biodegradable', 'Hazardous', 'Recyclable', 'Residual'],
            program: ['BSIT', 'BSCS', 'BSEd', 'BSBA', 'BSN', 'BSEE', 'BSCE', 'BSME'],
            course: ['BSIT', 'BSCS', 'BSEd', 'BSBA', 'BSN', 'BSEE', 'BSCE', 'BSME'],
            college: ['CIT', 'CAS', 'COE', 'CABA', 'CON', 'CENG'],
            subject: ['Engineering', 'IT', 'Education', 'Business', 'Nursing', 'Arts and Sciences'],
            plate: ['SJD 280', 'BOU 837', 'SKT 626', 'S6C486', 'SFN 552', 'SEU 721', 'S5W613'],
            plateno: ['SJD 280', 'BOU 837', 'SKT 626', 'S6C486', 'SFN 552', 'SEU 721', 'S5W613'],
            electricity: ['Main', 'Solar', 'Other'],
            department: ['Academic Affairs', 'Student Affairs', 'Finance', 'Human Resources', 'Research', 'Extension', 'Administration', 'Library', 'IT Services'],
            country: ['Philippines', 'United States', 'Japan', 'Singapore', 'Malaysia', 'Thailand', 'South Korea', 'Australia', 'Canada', 'United Kingdom', 'Germany', 'France', 'China', 'India'],
            flighttype: ['Domestic', 'International'],
            budgetcategory: ['Personnel Services', 'Maintenance and Other Operating Expenses', 'Capital Outlay', 'Financial Expenses'],
            visitcategory: ['Internal', 'External']
        };

        // Normalize column name for matching
        const normalizedColumn = columnName.toLowerCase().replace(/[^a-z]/g, '');
        const lowerColumnName = columnName.toLowerCase();
        
        // Check if this column should be a dropdown
        let matchedKey = null;
        
        // Special handling for specific column names
        if (lowerColumnName === 'campus') {
            matchedKey = 'campus';
        } else if (lowerColumnName === 'year' || lowerColumnName === 'academic year') {
            matchedKey = 'year';
        } else if (lowerColumnName === 'sex') {
            matchedKey = 'sex';
        } else if (lowerColumnName === 'semester') {
            matchedKey = 'semester';
        } else if (lowerColumnName === 'category' && normalizedColumn.includes('admission')) {
            matchedKey = 'category';
        } else if (lowerColumnName === 'category' && normalizedColumn.includes('employee')) {
            matchedKey = 'faculty';
        } else if (lowerColumnName === 'category' && normalizedColumn.includes('library')) {
            matchedKey = 'visitcategory';
        } else if (lowerColumnName === 'category' && normalizedColumn.includes('budget')) {
            matchedKey = 'budgetcategory';
        } else if (lowerColumnName === 'category' && normalizedColumn.includes('electricity')) {
            matchedKey = 'electricity';
        } else if (lowerColumnName === 'category' && normalizedColumn.includes('water')) {
            matchedKey = 'water';
        } else if (lowerColumnName.includes('disability') || lowerColumnName === 'type of disability') {
            matchedKey = 'disability';
        } else if (lowerColumnName === 'degree level') {
            matchedKey = 'degree';
        } else if (lowerColumnName.includes('graduate') && lowerColumnName.includes('undergrad')) {
            matchedKey = 'graduate';
        } else if (lowerColumnName === 'faculty rank') {
            matchedKey = 'rank';
        } else if (lowerColumnName === 'leave type') {
            matchedKey = 'leave';
        } else if (lowerColumnName === 'fuel type') {
            matchedKey = 'fueltype';
        } else if (lowerColumnName === 'waste type') {
            matchedKey = 'wastetype';
        } else if (lowerColumnName === 'plate no') {
            matchedKey = 'plateno';
        } else if (lowerColumnName === 'type' && normalizedColumn.includes('flight')) {
            matchedKey = 'flighttype';
        } else {
            // General matching for other columns
            for (const key in dropdownOptions) {
                if (normalizedColumn.includes(key) || key.includes(normalizedColumn) || 
                    lowerColumnName.includes(key) || key.includes(lowerColumnName)) {
                    matchedKey = key;
                    break;
                }
            }
        }
        
        if (matchedKey) {
            const select = document.createElement('select');
            select.className = 'table-select';
            select.setAttribute('data-column', columnName);
            
            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = `Select ${displayName}`;
            select.appendChild(emptyOption);
            
            // Add dropdown options
            dropdownOptions[matchedKey].forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                select.appendChild(optionElement);
            });
            
            return select;
        }
        
        // Check if this should be a date input
        if (columnName.toLowerCase().includes('date') || columnName.toLowerCase().includes('generated')) {
            const input = document.createElement('input');
            input.type = 'date';
            input.className = 'table-input';
            input.setAttribute('data-column', columnName);
            
            // Set default to today's date
            const today = new Date().toISOString().split('T')[0];
            input.value = today;
            
            return input;
        }
        
        // Check if this should be a year input
        if (columnName.toLowerCase().includes('year') && !columnName.toLowerCase().includes('academic')) {
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '2020';
            input.max = '2030';
            input.placeholder = 'YYYY';
            input.className = 'table-input';
            input.setAttribute('data-column', columnName);
            return input;
        }
        
        // Check if this should be a number input
        if (columnName.toLowerCase().includes('male') || columnName.toLowerCase().includes('female') || 
            columnName.includes('count') || columnName.includes('number') ||
            columnName.includes('duration') || columnName.includes('consumption') ||
            lowerColumnName.includes('pwd students') || lowerColumnName.includes('pwd employees') ||
            lowerColumnName.includes('no. of pwd') ||
            lowerColumnName.includes('students') || lowerColumnName.includes('employees')) {
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.step = '1';
            input.className = 'table-input';
            input.setAttribute('data-column', columnName);
            input.placeholder = 'Enter number';
            // Prevent negative numbers and non-numeric input for Male/Female
            if (columnName.toLowerCase().includes('male') || columnName.toLowerCase().includes('female')) {
                input.addEventListener('keypress', function(e) {
                    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E' || e.key === '.') {
                        e.preventDefault();
                    }
                });
                input.addEventListener('input', function(e) {
                    // Remove any non-numeric characters
                    this.value = this.value.replace(/[^0-9]/g, '');
                });
            }
            return input;
        }
        
        // Default to text input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'table-input';
        input.placeholder = `Enter ${displayName}`;
        return input;
    }

    generateYearOptions() {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear - 5; year <= currentYear + 5; year++) {
            years.push(year.toString());
        }
        return years;
    }

    async submitReport() {
        console.log('submitReport called, currentTask:', this.currentTask);
        
        if (!this.currentTask) {
            alert('No report selected');
            return;
        }

        const submissionTask = this.currentTask;
        console.log('Task to submit:', JSON.stringify(submissionTask, null, 2));
        
        const rows = document.querySelectorAll('#simpleTableBody tr');
        
        if (rows.length === 0) {
            alert('Please add at least one row of data before submitting');
            return;
        }

        // Get expected columns for this table
        const tableStructures = {
            employee: ["Campus", "Date Generated", "Category", "Faculty Rank", "Sex", "Status", "Date Hired"],
            admissiondata: ["Campus", "Semester", "Academic Year", "Category", "Program", "Male", "Female"],
            enrollmentdata: ["Campus", "Academic Year", "Semester", "College", "Graduate/Undergrad", "Program/Course", "Male", "Female"],
            graduatesdata: ["Campus", "Academic Year", "Semester", "Degree Level", "Subject Area", "Course", "Category/Total No. of Applicants", "Male", "Female"],
            leaveprivilege: ["Campus", "Leave Type", "Employee Name", "Duration Days", "Equivalent Pay"],
            libraryvisitor: ["Campus", "Visit Date", "Category", "Sex", "Total Visitors"],
            pwd: ["Campus", "Year", "No. of PWD Students", "No. of PWD Employees", "Type of Disability", "Sex"],
            campuspopulation: ["Campus", "Academic Year", "Semester", "Category", "Male", "Female"],
            waterconsumption: ["Campus", "Month", "Year", "Water Type", "Consumption"],
            treatedwastewater: ["Campus", "Date", "Treated Volume", "Reused Volume", "Effluent Volume"],
            electricityconsumption: ["Campus", "Category", "Month", "Year", "Prev Reading", "Current Reading", "Actual Consumption", "Multiplier", "Total Consumption", "Total Amount", "Price/kWh", "Remarks"],
            solidwaste: ["Campus", "Month", "Year", "Waste Type", "Quantity", "Remarks"],
            foodwaste: ["Campus", "Date", "Quantity (kg)", "Remarks"],
            fuelconsumption: ["Campus", "Date", "Driver", "Vehicle", "Plate No", "Fuel Type", "Description", "Transaction No", "Odometer", "Qty", "Total Amount"],
            distancetraveled: ["Campus", "Travel Date", "Plate No", "Vehicle", "Fuel Type", "Start Mileage", "End Mileage", "Total KM"],
            budgetexpenditure: ["Campus", "Year", "Particulars", "Category", "Budget Allocation", "Actual Expenditure", "Utilization Rate"],
            flightaccommodation: ["Campus", "Department", "Year", "Traveler", "Purpose", "From", "To", "Country", "Type", "Rooms", "Nights"]
        };
        
        const expectedColumns = tableStructures[this.currentTask.table_name] || [];
        
        // Validate each row - check for empty rows and empty columns
        const emptyRows = [];
        const rowsWithEmptyColumns = [];
        const data = [];

        rows.forEach((row, rowIndex) => {
            const rowData = {};
            const inputs = row.querySelectorAll('input, select');
            let hasAnyData = false;
            const emptyColumns = [];

            // Check each expected column
            expectedColumns.forEach((columnName, colIndex) => {
                // Find input for this column
                let input = null;
                inputs.forEach(inp => {
                    const inpColumn = inp.getAttribute('data-column') || inp.name || '';
                    if (inpColumn === columnName || inpColumn.includes(columnName)) {
                        input = inp;
                    }
                });
                
                // If no input found by name, try by index
                if (!input && colIndex < inputs.length) {
                    input = inputs[colIndex];
                }

                if (input) {
                    let value = '';
                    if (input.tagName === 'SELECT') {
                        value = input.value ? input.value.trim() : '';
                        // Check if it's a placeholder/empty option
                        if (value === '' || value === 'Select' || input.selectedIndex === 0) {
                            emptyColumns.push(columnName);
                        }
                    } else {
                        value = input.value ? input.value.trim() : '';
                        if (value === '') {
                            emptyColumns.push(columnName);
                        }
                    }
                    
                    if (value && value !== '' && value !== 'Select') {
                        hasAnyData = true;
                        rowData[columnName] = value;
                    }
                } else {
                    // Input not found for this column
                    emptyColumns.push(columnName);
                }
            });

            // Check if row is completely empty
            if (!hasAnyData) {
                emptyRows.push(rowIndex + 1);
                // Highlight empty row
                row.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                row.style.outline = '2px solid #dc3545';
            } else if (emptyColumns.length > 0) {
                // Row has some data but missing columns
                rowsWithEmptyColumns.push({
                    row: rowIndex + 1,
                    columns: emptyColumns
                });
                // Highlight row with missing columns
                row.style.backgroundColor = 'rgba(255, 193, 7, 0.1)';
                row.style.outline = '2px solid #ffc107';
            } else {
                // Row is complete - add to data
                data.push(rowData);
                // Reset row styling
                row.style.backgroundColor = '';
                row.style.outline = '';
            }
        });

        // Validation errors
        if (emptyRows.length > 0) {
            alert(`Cannot submit: Row(s) ${emptyRows.join(', ')} are empty. Please fill all fields or remove empty rows.`);
            return;
        }

        if (rowsWithEmptyColumns.length > 0) {
            const errorMessages = rowsWithEmptyColumns.map(item => 
                `Row ${item.row}: Missing columns (${item.columns.join(', ')})`
            );
            alert(`Cannot submit: ${errorMessages.join('. ')}. Please fill all columns in each row.`);
            return;
        }

        if (data.length === 0) {
            alert('Please add at least one complete row of data before submitting');
            return;
        }

        // Store current task reference before showing confirmation
        const confirmationTask = { ...this.currentTask };
        console.log('Task to submit:', JSON.stringify(confirmationTask, null, 2));

        // Show custom confirmation card instead of alert
        const confirmed = await this.showConfirmationCard(data.length, confirmationTask.table_name);
        if (!confirmed) return;

        try {
            const response = await fetch('api/submit_report.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    tableName: confirmationTask.table_name,
                    description: confirmationTask.description,
                    data: data
                })
            });

            const result = await response.json();

            console.log('Submission result:', JSON.stringify(result, null, 2));
            
            if (result.success) {
                alert('Report submitted successfully!');
                this.closeModal();
                
                // Show fade animation first
                if (confirmationTask.id) {
                    this.removeSubmittedReport(confirmationTask.id);
                }
                
                // Force immediate refresh without animation delay
                console.log('Refreshing reports after submission...');
                this.loadAssignedReports();
            } else {
                alert('Submission failed: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Submission failed. Please try again.');
        }
    }

    addDataEntryRow() {
        const tbody = document.getElementById('simpleTableBody');
        const headerRow = document.querySelector('#simpleTableHead tr');
        
        if (!headerRow) {
            console.error('Header row not found');
            return;
        }
        
        const headers = Array.from(headerRow.cells).map(cell => cell.textContent.trim());
        
        const row = tbody.insertRow();
        headers.forEach(header => {
            if (header !== 'Actions') {
                const cell = row.insertCell();
                const input = this.createInputElement(header);
                input.setAttribute('data-column', header);
                cell.appendChild(input);
            }
        });
        
        // Add delete button cell
        const deleteCell = row.insertCell();
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-row-btn';
        deleteBtn.title = 'Delete Row';
        deleteBtn.onclick = () => this.deleteRow(row);
        deleteCell.appendChild(deleteBtn);
    }
    
    deleteRow(row) {
        const tbody = document.getElementById('simpleTableBody');
        if (tbody.rows.length > 1) {
            row.remove();
        } else {
            alert('At least one row is required for data entry.');
        }
    }

    removeSubmittedReport(taskId) {
        // Find and remove the report card from the DOM with fade animation
        const reportCard = document.querySelector(`[data-task-id="${taskId}"]`);
        if (reportCard) {
            reportCard.style.transition = 'all 0.5s ease';
            reportCard.style.opacity = '0';
            reportCard.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                reportCard.remove();
                
                // Check if there are any reports left
                const remainingReports = document.querySelectorAll('.report-table-card');
                if (remainingReports.length === 0) {
                    const container = document.getElementById('simpleReportsList');
                    if (container) {
                        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No assigned reports at this time.</p>';
                    }
                }
            }, 500);
        }
    }

    showConfirmationCard(rowCount, tableName) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'confirmation-modal';
            modal.innerHTML = `
                <div class="confirmation-card">
                    <div class="confirmation-header">
                        <div class="confirmation-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3 class="confirmation-title">Confirm Submission</h3>
                    </div>
                    <div class="confirmation-body">
                        <p class="confirmation-message">
                            Are you ready to submit your report data?
                        </p>
                        <div class="confirmation-details">
                            <div class="confirmation-detail-item">
                                <span class="confirmation-detail-label">Report Type:</span>
                                <span class="confirmation-detail-value">${tableName}</span>
                            </div>
                            <div class="confirmation-detail-item">
                                <span class="confirmation-detail-label">Data Rows:</span>
                                <span class="confirmation-detail-value">${rowCount} row(s)</span>
                            </div>
                            <div class="confirmation-detail-item">
                                <span class="confirmation-detail-label">Office:</span>
                                <span class="confirmation-detail-value">${this.currentTask.office}</span>
                            </div>
                        </div>
                        <div class="confirmation-buttons">
                            <button class="confirmation-btn confirmation-btn-cancel" onclick="this.closest('.confirmation-modal').remove(); window.confirmationResolve(false);">
                                Cancel
                            </button>
                            <button class="confirmation-btn confirmation-btn-confirm" onclick="this.closest('.confirmation-modal').remove(); window.confirmationResolve(true);">
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            window.confirmationResolve = resolve;
        });
    }

    closeModal() {
        const modal = document.getElementById('simpleReportModal');
        if (modal) {
            modal.remove();
        }
        this.currentTask = null;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.simpleDashboard = new SimpleUserDashboard();
});
