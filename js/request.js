$('#generateBtn').click(function() {
    console.log("Generate button clicked");

    const columns = []; // Use an array to store column data
    const columnElements = document.querySelectorAll(".columnForm");  // Select all column items (including dynamically added)

    if (columnElements.length === 0) {
        console.log("No columns to process");
        return; // Exit if no columns are found
    }

    console.log(columnElements);  // For debugging purposes

    // Loop through each column element
    columnElements.forEach((item, index) => {
        const columnNameInput = item.querySelector('input[name="columns[][columnName]"]');
        const columnTypeSelect = item.querySelector('select[name="columns[][dataType]"]');

        // Initialize default values for each column
        let columnData = {
            name: '',
            type: '',         // Default to an empty string
            length: null,     // Default to null
            precision: null,  // Default to null
            nullable: false,  // Default to false
            unique: false,    // Default to false
            default: null,    // Default to null
            options: null,    // Default to null
            removed: false,   // Assuming no removal logic yet
        };

        // Check if the elements exist before accessing their values
        const columnName = columnNameInput ? trimSpace(columnNameInput.value) : '';
        const columnType = columnTypeSelect ? trimSpace(columnTypeSelect.value) : '';

        const nullableInput = item.querySelector('input[name="columns[][nullable]"]');
        const nullable = nullableInput && nullableInput.checked ? "|nullable" : "";

        // Set the column data based on the inputs
        if (columnName && columnType) {
            columnData.name = sanitizeInput(columnName);
            columnData.type = sanitizeInput(columnType);
            columnData.nullable = nullable;
        }

        // Push the column data into the columns array
        columns.push(columnData);
    });

    console.log("Columns Data: ", columns); // Display the clean, organized columns data
});

function sanitizeInput(input) {
    return DOMPurify.sanitize(input); // Sanitize user input
}

function trimSpace(value) {
    return typeof value === "string" ? value.trim() : value; // Trim spaces
}
