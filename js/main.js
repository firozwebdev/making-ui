$(document).ready(function () {
    $('#generateBtn').click(function () {
        // check table name if it is empty, then show the error message
        tableName = window.tableName;
        columns = window.columns;
        relationships = window.relationships;
        
        if (!tableName) {
            showCustomAlert("Please set the Table/Model name first in the sidebar.");
            return;
        }
        // check column count if it is less than 2, then show the error message
        if (columns.length < 2) {
            showCustomAlert("At least two columns are required.");
            return;
        }
        console.log("Columns: ", columns);

        // Reverse the columns order before processing
        const output = `{
            "${sanitizeInput(tableName)}": {
                "columns": { 
                    ${Object.entries(columns).reverse().map(([columnIndex, columnData]) => {
                        // Skip if column name is invalid or empty
                        if (!columnData || 
                            !columnData.name || 
                            !columnData.name.trim() || !columnData.type || !columnData.type.trim() ) return '';  
                        
                        let columnDefinition = `"${columnData.name}": `;

                        // Handle enum and options correctly
                        if (columnData.type.startsWith('enum') || columnData.type.startsWith('options')) {
                            const formattedOptions = columnData.options 
                                ? `,[${mapValuesForEnumAndOptions(columnData.options).join(',')}]` 
                                : ',[Option1,Option2]';
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

                        if(columnData.type.startsWith('enum') || columnData.type.startsWith('options')) {
                            columnDefinition += `${columnData.default ? `|default:${columnData.default}` : '|default:Option1'}`; 
                        }else{
                            columnDefinition += `${columnData.default ? `|default:${columnData.default}` : ''}`; 
                        }
                        //columnDefinition += `${columnData.default ? `|default:${columnData.default}` : ''}`;
                        columnDefinition += `${columnData.unique ? '|unique' : ''}`;

                        columnDefinition += `"`;

                        return columnDefinition;
                    }).join(',\n            ')}
                }
                ${relationships.some(rel => rel.relatedModel?.trim() && rel.type?.trim()) ? `,
                    "relationships": [
                        ${relationships.map(rel => {
                            if (!rel.relatedModel?.trim() || !rel.type?.trim()) return ''; // Skip invalid relationships
                            return `{"type": "${rel.type}", "with": "${rel.relatedModel}"}`;
                        }).filter(Boolean).join(',\n        ')}
                    ]` : ''}
                
            }
        }`;

        console.log("Output: ", output);
    });
});
