$(document).ready(function () {
    $('#generateBtn').click(function () {
        console.log("Columns: ", columns);

        // Reverse the columns order before processing
        const output = `{
            "${sanitizeInput(tableName)}": {
                "columns": { 
                    ${Object.entries(columns).reverse().map(([columnIndex, columnData]) => {
                        // Skip if column name is invalid or empty
                        if (!columnData || !columnData.name) return '';  
                        
                        let columnDefinition = `"${columnData.name}": `;

                        // Handle enum and options correctly
                        if (columnData.type.startsWith('enum') || columnData.type.startsWith('options')) {
                            const formattedOptions = columnData.options 
                                ? `,[${mapValuesForEnumAndOptions(columnData.options).join(',')}]` 
                                : '';
                            columnDefinition += `"${columnData.type}${formattedOptions}`; 
                        } else {
                            if(columnData.type === 'decimal') {
                                columnDefinition += `"${columnData.type}${columnData.precision ? `,${columnData.precision}` : ''}${columnData.scale ? `,${columnData.scale}` : ''}`;
                            }else{
                                columnDefinition += `"${columnData.type}${columnData.length ? `,${columnData.length}` : ''}`; 
                            }
                                
                        }

                        // Add precision and scale if they exist
                    

                        // Add nullable, default, and unique if they exist
                        columnDefinition += `${columnData.nullable ? '|nullable' : ''}`;
                        columnDefinition += `${columnData.default ? `|default:${columnData.default}` : ''}`;
                        columnDefinition += `${columnData.unique ? '|unique' : ''}`;

                        columnDefinition += `"`;

                        return columnDefinition;
                    }).join(',\n            ')}
                }
                ${relationships.length > 0 ? `,
                    "relationships": [
                        ${relationships.map(rel => {
                            // Include the relationship only if rel.relatedModel is found
                            if (rel.relatedModel) {
                                return `{"type": "${rel.type}", "with": "${rel.relatedModel}"}`;
                            }
                            return '';  // Return an empty string if relatedModel is not found
                        }).filter(Boolean).join(',\n                        ')}
                    ]` : ''}
            }
        }`;

        console.log("Output: ", output);
    });
});

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
