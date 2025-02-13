function isValidInput(name) {
    // Trim spaces from input
    name = name.trim();

    // Define strict validation rules
    const reservedKeywords = ["select", "insert", "update", "delete", "drop", "alter", "create", "truncate", "script"];
    const unsafePattern = /[^\w]/g; // Only allow letters, numbers, and underscores (_)

    // Check if the name is empty or too short
    if (!name || name.length < 2) {
        showCustomAlert("Column name must be at least 2 characters long!");
        return false;
    }

    // Check for reserved SQL keywords
    if (reservedKeywords.includes(name.toLowerCase())) {
        showCustomAlert(`"${name}" is a reserved keyword and cannot be used as a column name!`);
        return false;
    }

    // Check for unsafe characters
    if (unsafePattern.test(name)) {
        showCustomAlert("Invalid column name! Only letters, numbers, and underscores are allowed!");
        return false;
    }

    return true;
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

