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

 function checkDecimalDefaultValue(columnData) {
    const defaultValue = columnData.default.toString();
    const [integerPart, decimalPart] = defaultValue.split(".");

    const precision = columnData.precision || 10; // Default precision
    const scale = columnData.scale || 2; // Default scale

    // Ensure total digits do not exceed precision
    const totalDigits = integerPart.length + (decimalPart ? decimalPart.length : 0);
    if (totalDigits > precision) {
        showCustomAlert(`Default value exceeds the allowed precision (${precision} digits).`);
        return false;
    }

    // Ensure decimal part does not exceed scale
    if (decimalPart && decimalPart.length > scale) {
        showCustomAlert(`Default value exceeds the allowed scale (${scale} decimal places).`);
        return false;
    }

    return true;
}


