function isValidInput(columns) {
    if (!Array.isArray(columns) || columns.length === 0) {
        showCustomAlert("Invalid column data!");
        return false;
    }

    // Always take the first column for validation
    const column = columns[0];
    

    // Reserved keywords & unsafe patterns (for column names)
    const reservedKeywords = ["select", "insert", "update", "delete", "drop", "alter", "create", "truncate", "script"];
    const unsafePattern = /[^a-zA-Z0-9_]/g; // Only allow letters, numbers, and underscores (_)
    const sqlInjectionPattern = /(union|select|insert|update|delete|drop|alter|create|truncate|exec|execute|--|;)/gi;
    const scriptTagPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;

    function sanitizeInput(value) {
        if (typeof value === "string") {
            value = value.trim();
            value = value.replace(scriptTagPattern, ""); // Remove <script> tags
            value = value.replace(/['";`]/g, ""); // Remove common SQL/JS injection characters
        }
        return value;
    }

    // **1️⃣ Column Name Validation (Prevents SQL Injection & XSS)**
    column.name = sanitizeInput(column.name);
    
    if (!column.name || column.name.length < 2) {
        showCustomAlert("Column name must be at least 2 characters long!");
        return false;
    }
    if (reservedKeywords.includes(column.name.toLowerCase())) {
        showCustomAlert(`"${column.name}" is a reserved keyword and cannot be used as a column name!`);
        return false;
    }
    if (unsafePattern.test(column.name)) {
        showCustomAlert("Invalid column name! Only letters, numbers, and underscores are allowed!");
        return false;
    }
    if (sqlInjectionPattern.test(column.name)) {
        showCustomAlert("Possible SQL injection detected! Invalid column name!");
        return false;
    }

   


    // **2️⃣ Data Type Validation (Sanitized)**
    column.type = sanitizeInput(column.type);
    if (!column.type || typeof column.type !== "string" || column.type.trim() === "") {
        showCustomAlert("Invalid data type!");
        return false;
    }

    // **3️⃣ Precision, Scale & Length (Must be non-negative integers)**
    ["precision", "scale", "length"].forEach((key) => {
        if (column[key] !== undefined) {
            column[key] = sanitizeInput(column[key]);
            if (!/^\d+$/.test(column[key]) || parseInt(column[key]) < 0) {
                showCustomAlert(`${key} must be a non-negative integer!`);
                return false;
            }
        }
    });

    // **4️⃣ Default Value Validation (Sanitized Based on Data Type)**
    if (column.default !== undefined) {
        column.default = sanitizeInput(column.default);
        if (["integer", "bigInteger", "smallInteger"].includes(column.type)) {
            // if default value is present then check if it is an integer
            if(column.default) {
                if (!/^-?\d+$/.test(column.default)) {
                    showCustomAlert("Invalid Default Value! Must be an integer!");
                    return false;
                }
            }
           
        }
        if (["decimal", "float", "double"].includes(column.type)) {
            if(column.default) {
                if (!/^-?\d+(\.\d+)?$/.test(column.default)) {
                    showCustomAlert("Invalid Default Value! Must be a valid decimal number!");
                    return false;
                } 
            }
            
        }
        if (column.type === "string") {
            const maxLength = parseInt(column.length) || 255;
            if(column.default) {
                if (column.default.length > maxLength) {
                    showCustomAlert(`Invalid Default Value! Maximum length allowed is ${maxLength} characters!`);
                    return false;
                }
                if (column.default.length < 2) {
                    showCustomAlert(`"${column.default} must be at least 2 characters long!"`);
                    return false;
                }
                if (reservedKeywords.includes(column.default.toLowerCase())) {
                    showCustomAlert(`"${column.default}" is a reserved keyword and cannot be used as a column name!`);
                    return false;
                }
                if (unsafePattern.test(column.default)) {
                    showCustomAlert(`"Invalid ${column.default}! Only letters, numbers, and underscores are allowed!"`);
                    return false;
                }
                if (sqlInjectionPattern.test(column.default)) {
                    showCustomAlert(`"Possible SQL injection detected! Invalid ${column.default}!"`);
                    return false;
                }
            }
        }
        if (column.type === "email") {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(column.default)) {
                showCustomAlert("Invalid Default Value! Must be a valid email format!");
                return false;
            }
        }
    }

    // **5️⃣ Boolean Fields Validation**
    if (column.nullable !== undefined) {
        column.nullable = sanitizeInput(column.nullable);
        if (typeof column.nullable !== "boolean") {
            showCustomAlert("Invalid Nullable Value! Must be true or false!");
            return false;
        }
    }

    if (column.unique !== undefined) {
        column.unique = sanitizeInput(column.unique);
        if (typeof column.unique !== "boolean") {
            showCustomAlert("Invalid Unique Value! Must be true or false!");
            return false;
        }
    }

    return true; // ✅ Pass if all validations succeed
}



// Function to sanitize input to prevent XSS
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
}

// Function to trim spaces from a string
function trimSpace(value) {
    return typeof value === "string" ? value.trim() : value;
}

// Function to safely process enum and options values
function mapValuesForEnumAndOptions(input) {
    return input.split(',').map(value => `${trimSpace(value)}`); // Wrap each value in quotes safely
}

// Function to format column data based on its type
function formatColumnData(columnData) {
    let columnDefinition = `"${columnData.type}`;

    if (columnData.type === 'decimal') {
        columnDefinition += `${columnData.precision ? `,${columnData.precision}` : ''}${columnData.scale ? `,${columnData.scale}` : ''}`;
    } else {
        columnDefinition += `${columnData.length ? `,${columnData.length}` : ''}`;
    }

    return columnDefinition + `"`;
}
function makeDefaultValueForEnumAndOptions(value) {
    // input may be like active,inactive, output will be just active
     return value.split(',')[0];
 
 }

 function checkDecimalDefaultValue(value, precision, scale) {
    if (!value) {
        showCustomAlert("Default value is required!");
        return false;
    }

    if (precision === undefined || scale === undefined) {
        showCustomAlert("Precision and Scale are required for decimal type!");
        return false;
    }

    const defaultValue = value.toString().trim();
    const decimalPattern = /^-?\d+(\.\d+)?$/; // Supports negative values and decimals

    if (!decimalPattern.test(defaultValue)) {
        showCustomAlert("Invalid decimal value!");
        return false;
    }

    const [integerPart, decimalPart = ""] = defaultValue.split(".");
    const totalDigits = integerPart.length + decimalPart.length;

    if (totalDigits > precision) {
        showCustomAlert(`Default value exceeds the allowed precision (${precision} digits)!`);
        return false;
    }

    if (decimalPart.length > scale) {
        showCustomAlert(`Decimal part exceeds the allowed scale (${scale} decimal places)!`);
        return false;
    }

    return true;
}

function checkDefaultValue(type, defaultValue, length, precision, scale) {
    if (defaultValue === undefined || defaultValue === null || defaultValue === '') {
        return true; // Allow empty default values
    }

    switch (type) {
        case 'decimal':
            return checkDecimalDefaultValue(defaultValue, precision, scale);

        case 'string':
            if (length && typeof defaultValue === 'string' && defaultValue.length > length) {
                showCustomAlert(`Default value exceeds the allowed length (${length} characters)!`);
                return false;
            }
            return true;

        case 'integer':
            if (!/^\d+$/.test(defaultValue)) {
                showCustomAlert("Default value must be a valid integer!");
                return false;
            }
            if (defaultValue.toString().length > 5) {
                showCustomAlert("Integer default value cannot exceed 5 digits!");
                return false;
            }
            return true;

        case 'email':
            if (typeof defaultValue !== 'string') {
                showCustomAlert("Default email value must be a string!");
                return false;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(defaultValue.trim())) {
                $(".default-value").addClass("is-invalid");
                showCustomAlert("Default value must be a valid email address!");
                return false;
            }
            return true;

        default:
            return true; // Allow other types without validation
    }
}

function isDefaultValueConsistentOrNotInColumn(columns) {
    if (columns.length === 0) return false;

    const { type = "", default: defaultValue, length = "", precision, scale } = columns[0];

    const excludedTypes = ['bigIncrements', 'uuid', 'foreignId', 'date', 'text', 'enum', 'options', 'image'];
    if (!type || excludedTypes.includes(type)) return true;

    if (type === 'decimal' && (precision === undefined || scale === undefined)) {
        showCustomAlert("Precision and Scale are required for decimal columns!");
        return false;
    }

    return checkDefaultValue(type.trim(), defaultValue, length, precision, scale);
}

