const employeeFormConfig = [
    {
        name: "last_name",
        label: "Last Name",
        type: "text",
    },
    {
        name: "first_name",
        label: "First Name",
        type: "text",
    },
    {
        name: "middle_name",
        label: "Middle Name",
        type: "text",
    },
    {
        name: "email",
        label: "Email",
        type: "email",
    },
    {
        name: "address",
        label: "Address",
        type: "text",
    },
    {
        name: "birthdate",
        label: "Birthdate",
        type: "date",
        inputFormat: "MMMM dd, yyyy",
    },
    {
        name: "contact_number",
        label: "Contact Number",
        type: "text",
        inputProps: {
            pattern: "[0-9]{10,15}",
            placeholder: "Enter contact number",
        },
    },
    {
        name: "position",
        label: "Positions",
        type: "select",
        options: [
            { value: "Virtual Professional", label: "Virtual Professional" },
            { value: "Virtual Professional - Supervisor", label: "Virtual Professional - Supervisor" },
            { value: "Admin Asst", label: "Admin Asst" },
            { value: "Admin Asst / Maintenance", label: "Admin Asst / Maintenance" },
            { value: "Accounting Assoc", label: "Accounting Assoc" },
            { value: "Senior Accountant", label: "Senior Accountant" },
            { value: "Recruitment Head/Coordinator", label: "Recruitment Head/Coordinator" },
            { value: "Reports Analyst", label: "Reports Analyst" },
            { value: "HR Manager", label: "HR Manager" },
            { value: "Director of Operations", label: "Director of Operations" },
            { value: "Managing Director", label: "Managing Director" },
            { value: "CEO", label: "CEO" },
            { value: "COO", label: "COO" },
            { value: "IT and Web Dev", label: "IT and Web Dev" },
            { value: "Junior Web Developer", label: "Junior Web Developer" },
            { value: "Office Manager", label: "Office Manager" },
            { value: "Video Editor", label: "Video Editor" },
            { value: "Video and Podcast Editor", label: "Video and Podcast Editor" },
            { value: "Maintenance", label: "Maintenance" },
        ],
    },
    {
        name: "employment_date",
        label: "Employment Date",
        type: "date",
        inputFormat: "MMMM dd, yyyy",
    },
    // {
    //     key: 'user_photo',
    //     type: 'file',
    //     label: 'Employee Photo',
    //     accept: 'image/*',
    //     helperText: 'Upload a photo (JPEG, PNG, GIF) max 2MB',
    //     fullWidth: true
    // },
     {
        name: "employment_type",
        label: "Employment Type",
        type: "select",
        options: [
            { value: "REGULAR", label: "Regular" },
            { value: "PROBATIONARY", label: "Probationary" },
            { value: "CONTRACTUAL", label: "Contractual" },
            { value: "TRAINING", label: "Training" }
        ],
        defaultValue: "REGULAR"
    },
    {
        name: "type",
        label: "Job Type",
        type: "select",
        options: [
            { value: "Full Time", label: "Full Time" },
            { value: "Part Time", label: "Part Time" },
        ],
    },
   {
    name: "work_arrangement",
    label: "Work Arrangement",
    type: "select",
    options: [
        { value: "OFFICE", label: "Office" },
        { value: "REMOTE", label: "Remote" },
        { value: "HYBRID", label: "Hybrid" }
    ],
    defaultValue: "OFFICE"
},
    {
        name: "department",
        label: "Department",
        type: "select",
        options: [
            { value: "OPERATIONS", label: "OPERATIONS" },
            { value: "HR", label: "HR" },
            { value: "IT & DEVELOPMENT", label: "IT & DEVELOPMENT" },
            { value: "E20 CREATIVES", label: "E20 CREATIVES" },
            { value: "ACCOUNTING & FINANCE", label: "ACCOUNTING & FINANCE" },
        ],
    },
    {
        name: "team",
        label: "Team",
        type: "select",
        options: [
            { value: "ADMIN", label: "ADMIN" },
            { value: "AJ SOLAR", label: "AJ SOLAR" },
            { value: "CAPRI", label: "CAPRI" },
            { value: "COPRA", label: "COPRA" },
            { value: "HAMBLETON", label: "HAMBLETON" },
            { value: "KRAMER", label: "KRAMER" },
            { value: "MAINE STANDARD BIOFUEL", label: "MAINE STANDARD BIOFUEL" },
            { value: "NONE", label: "NONE" },
            { value: "TRAINING", label: "TRAINING" },
            { value: "TSM", label: "TSM" },
        ],
    },
    {
        name: "contract_hours",
        label: "Total Work Hours",
        type: "number",
        min: 0,
        max: 9,
        step: 0.5,
        defaultValue: 9,
        readOnly: (values) => values.type === 'Full Time',
        helperText: (values) => values.type === 'Full Time' ? 
            "Full-time employees have fixed 9 hours" : 
            "Set the total work hours per day"
    },
    {
        name: "status",
        label: "Employment Status",
        type: "select",
        options: [
            { value: "Active", label: "Active" },
            { value: "AWOL", label: "AWOL (Absent without On-Leave)" },
            { value: "Floating", label: "Floating" },
            { value: "New Hired", label: "New Hired" },
            { value: "Resigned", label: "Resigned" },
            { value: "Probation", label: "Probation" },
            { value: "Training", label: "Training" },
            { value: "Terminated", label: "Terminated Contract" },
        ],
    },
     {
        name: "shift_type",
        label: "Shift Type",
        type: "select",
        options: [
            { value: "regular", label: "Regular (Single Shift)" },
            { value: "split", label: "Split Shift" },
            { value: "graveyard", label: "Graveyard Shift" }
        ],
        defaultValue: "regular"
    },
    {
        name: "time_in",
        label: "Primary Shift Start",
        type: "time-picker",
        required: true
    },
    {
        name: "time_out",
        label: "Primary Shift End",
        type: "time-picker",
        required: true
    },
    {
        name: "time_in_2",
        label: "Second Shift Start",
        type: "time-picker",
        showIf: (values) => values.shift_type === 'split',
        required: (values) => values.shift_type === 'split'
    },
     {
        name: "time_out_2",
        label: "Second Shift End",
        type: "time-picker",
        showIf: (values) => values.shift_type === 'split',
        required: (values) => values.shift_type === 'split',
        readOnly: true
    },
    {
        name: "break_duration",
        label: "Break Duration (minutes)",
        type: "number",
        min: 0,
        max: 240,
        defaultValue: 60
    }
];

function applyConditionalLogic(config) {
    return config.map(field => {
        const fieldCopy = {...field};
        
        // Apply visibility conditions
        if (field.showIf) {
            fieldCopy.hidden = (values) => !field.showIf(values);
        }
        
        // Apply readonly conditions
        if (typeof field.readOnly === 'function') {
            fieldCopy.readOnly = field.readOnly;
        }
        
        // Apply required conditions
        if (typeof field.required === 'function') {
            fieldCopy.required = field.required;
        }
        
        return fieldCopy;
    });
}


export default applyConditionalLogic(employeeFormConfig);
