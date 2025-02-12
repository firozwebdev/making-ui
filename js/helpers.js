function isValidInput(name) {
    // Trim spaces from input
    name = name.trim();

    // Define strict validation rules
    const reservedKeywords = ["select", "insert", "update", "delete", "drop", "alter", "create", "truncate", "script"];
    const unsafePattern = /[^\w]/g; // Only allow letters, numbers, and underscores (_)

    // Check if the name is empty or too short
    if (!name || name.length < 2) {
        showCustomAlert("Column name must be at least 2 characters long.");
        return false;
    }

    // Check for reserved SQL keywords
    if (reservedKeywords.includes(name.toLowerCase())) {
        showCustomAlert(`"${name}" is a reserved keyword and cannot be used as a column name.`);
        return false;
    }

    // Check for unsafe characters
    if (unsafePattern.test(name)) {
        showCustomAlert("Invalid column name! Only letters, numbers, and underscores are allowed.");
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
        showCustomAlert("Default value is required.");
        return false;
    }

    const defaultValue = value.toString().trim();

    // Check if the default value is a valid decimal
    const decimalPattern = /^-?\d+(\.\d+)?$/; // Pattern to match valid numbers (optional negative sign)
    if (!decimalPattern.test(defaultValue)) {
        showCustomAlert("Invalid decimal value.");
        return false;
    }

    const [integerPart, decimalPart] = defaultValue.split(".");

    // Handle cases where there's no decimal part
    const totalDigits = integerPart.length + (decimalPart ? decimalPart.length : 0);

    // If the total digits exceed precision, return an error
    if (totalDigits > precision) {
        showCustomAlert(`Default value exceeds the allowed precision (${precision} digits).`);
        return false;
    }

    // If there's a decimal part, ensure its length doesn't exceed scale
    if (decimalPart && decimalPart.length > scale) {
        showCustomAlert(`Decimal part exceeds the allowed scale (${scale} decimal places).`);
        return false;
    }

    // If there's no decimal part, and the integer part exceeds precision, return an error
    if (!decimalPart && integerPart.length > precision) {
        showCustomAlert(`Integer part exceeds the allowed precision (${precision} digits).`);
        return false;
    }

    return true;
}

function checkDefaultValue(type, defaultValue, length, precision, scale) {
    if (!defaultValue) {
        showCustomAlert("Default value is required.");
        return false;
    }

    // Validate based on the column type
    if (type === 'decimal') {
        if (!checkDecimalDefaultValue(defaultValue, precision, scale)) {
            return false;
        }
        return true;
    }

    // Validate for string type
    if (type === 'string') {
        if (defaultValue.length > length) {
            showCustomAlert(`Default value exceeds the allowed length (${length} characters).`);
            return false;
        }
        return true;
    }

   

    // If the type is unsupported, show a custom alert
    showCustomAlert("Unsupported column type.");
    return false;
}
