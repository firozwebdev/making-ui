$(document).ready(function () {
    let tableName = "";
    let columns = [];
    let selectedColumnIndex = null;
    let relationships = [];
    let selectedRelationshipIndex = null;
    
  
    $("#columnName").on("input", function () {
      if ($(this).val().trim() === "") {
          $(this).addClass("is-invalid");
      } else {
          $(this).removeClass("is-invalid");
      }
    });
  
      $("#dataType").change(function () {
          if ($(this).val() === "") {
              $(this).addClass("is-invalid");
          } else {
              $(this).removeClass("is-invalid");
          }
      });
  
  
    // Disable actions until the table name is set
    function disableActions() {
        $("#addColumnBtn, #columnName, #dataType, .additional-input").prop("disabled", true);  // Disable column-related actions
        $(".remove-btn-column").prop("disabled", true);  // Disable column removal actions
    }
  
    // Enable actions once the table name is set
    function enableActions() {
        $("#addColumnBtn, #columnName, #dataType, .additional-input").prop("disabled", false);  // Enable column-related actions
        $(".remove-btn-column").prop("disabled", false);  // Enable column removal actions
    }
  
  
  
  function checkTableName() {
      tableName = $("#tableName").val().trim(); // Get the table name
      if (!tableName) {
          showCustomAlert("Please set the Table/Model name first in the sidebar.");
          disableActions();
          return false;
      }
      return true;
    } 
  
  
  
    // Function to update the sidebar
    function updateSidebar() {
        if (!checkTableName()) return;  // Only proceed if the table name is set
        $("#columnsList").empty();
        columns.forEach((col, index) => {
            $("#columnsList").append(`
                <li class="list-group-item-column ${selectedColumnIndex === index ? "active" : ""}" data-index="${index}">
                    ${col.name || "Untitled Column"}
                    <button class="remove-btn-column btn btn-danger btn-sm float-end" data-index="${index}">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </li>
            `);
        });
  
        // Reattach event listeners after updating the list
        $(".list-group-item-column").off("click").on("click", function () {
            saveColumnData();
            $(".list-group-item-column").removeClass("active");
            $(".list-group-item-relationship").removeClass("active");
            $(this).addClass("active");
            selectedColumnIndex = $(this).data("index");
            loadColumnDetails();
        });
    }
  
    // Function to load column details in the right panel
    function loadColumnDetails() {
        if (selectedColumnIndex === null) return;
        const column = columns[selectedColumnIndex];
  
        // Ensure the details panel is visible when a column is selected
        $("#columnDetail").show();
        $("#relationshipDetail").hide();
        $("#columnName").val(column.name || "");
        $("#dataType").val(column.type || "");
  
        // Ensure nullable is set to false if undefined
        column.nullable = column.nullable !== undefined ? column.nullable : false;
  
        showAdditionalFields(column.type, column);
    }
  
    // Function to show additional fields based on the data type selected
    function showAdditionalFields(dataType, column = {}) {
        let additionalHTML = "";
  
        switch (dataType) {
            case "string":
                additionalHTML = `
                    <div class="mb-3">
                        <label for="length" class="form-label">Length</label>
                        <input type="number" class="form-control additional-input" data-key="length" value="${column.length || ""}">
                    </div>
                `;
                break;
            case "decimal":
                additionalHTML = `
                    <div class="mb-3">
                        <label for="precision" class="form-label">Precision</label>
                        <input type="number" class="form-control additional-input" data-key="precision" value="${column.precision || ""}">
                    </div>
                    <div class="mb-3">
                        <label for="scale" class="form-label">Scale</label>
                        <input type="number" class="form-control additional-input" data-key="scale" value="${column.scale || ""}">
                    </div>
                `;
                break;
            case "enum":
            case "options":
                additionalHTML = `
                    <div class="mb-3">
                        <label for="optionsList" class="form-label">Options (comma separated)</label>
                        <input type="text" class="form-control additional-input" data-key="options" value="${column.options || "Option1,Option2"}">
                    </div>
                    <div class="mb-3">
                        <label for="defaultValue" class="form-label">Default Value</label>
                        <select class="form-control additional-input" data-key="default">
                            ${generateOptionsDropdown(column.options || "Option1,Option2", column.default)}
                        </select>
                    </div>
                `;
                break;
            default:
                break;
        }
  
        // Add Nullable Checkbox
        if (dataType !== 'bigIncrements' && dataType !== 'uuid' && dataType !== 'foreignId' && dataType !== 'enum' && dataType !== 'options') {
            additionalHTML += `
                <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input additional-input" id="nullable" data-key="nullable" ${column.nullable ? "checked" : ""}>
                    <label class="form-check-label" for="nullable">Nullable</label>
                </div>
            `;
        }
  
        $("#additionalFields").html(additionalHTML);
    }
  
    // Generate dropdown options from comma separated values
    function generateOptionsDropdown(optionsStr, defaultValue) {
        const optionsArray = optionsStr.split(',').map(option => option.trim());
        return optionsArray.map(option => {
            return `<option value="${option}" ${option === defaultValue ? "selected" : ""}>${option}</option>`;
        }).join('');
    }
  
    // Update the "Default Value" dropdown based on options input
    function updateDefaultValueDropdown(optionsStr) {
        const optionsArray = optionsStr.split(',').map(option => option.trim());
        const defaultValueDropdown = $("select[data-key='default']");
        defaultValueDropdown.empty(); // Clear the existing options
  
        // Populate the dropdown with the updated options
        optionsArray.forEach(option => {
            defaultValueDropdown.append(`<option value="${option}">${option}</option>`);
        });
    }
  
    
      // Save the data of the selected column with validation
      function saveColumnData() {
          if (selectedColumnIndex === null) return;
          
          const column = columns[selectedColumnIndex];
          column.name = $("#columnName").val().trim();
          column.type = $("#dataType").val();
  
          // Validate required fields
          if (!column.name) {
              showCustomAlert("Column name is required.");
              $("#columnName").addClass("is-invalid"); // Highlight the field in red
              return false;
          } else {
              $("#columnName").removeClass("is-invalid");
          }
  
          if (!column.type) {
              showCustomAlert("Data type is required.");
              $("#dataType").addClass("is-invalid");
              return false;
          } else {
              $("#dataType").removeClass("is-invalid");
          }
  
          $(".additional-input").each(function () {
              const key = $(this).data("key");
              if (key === "nullable") {
                  column[key] = $(this).prop("checked");
              } else {
                  column[key] = $(this).val();
              }
          });
  
          return true; // Indicate successful save
      }
  
  
      // Add a new column when the "Add Column" button is clicked
      $("#addColumnBtn").click(function () {
          if (!checkTableName()) {
              showCustomAlert("Please set the Table/Model name first.");
              return; 
          } 
      
          // Validate before adding a new column
          if (selectedColumnIndex !== null && !saveColumnData()) {
              return; // Stop if validation fails
          }
      
          columns.unshift({ name: "", type: "", options: "" }); // Add column at the beginning
          selectedColumnIndex = 0; // Select the new column
          updateSidebar();
          loadColumnDetails();
      
          showToast(columns.length > 1 ? "Column saved successfully!" : "Input column details!");
      });
      
  
  
    // Set the table/model name
    $("#setTableNameBtn").click(function () {
        tableName = $("#tableName").val();
        if (!tableName) {
            showCustomAlert("Please set the Table/Model name first in the sidebar.");
            return;
        }
        $("h5 span.tableModelName").text(tableName);
        enableActions();  // Enable actions once the table name is set
        showToast("Table Name Set Successfully!.");
    });
  
    // Handle the column name input changes
    $("#columnName").on("input", function () {
        if (selectedColumnIndex !== null) {
            columns[selectedColumnIndex].name = $(this).val();
            updateSidebar();
        }
    });
  
    // Handle data type selection
    $("#dataType").change(function () {
        if (selectedColumnIndex !== null) {
            saveColumnData();
            columns[selectedColumnIndex].type = $(this).val();
            showAdditionalFields($(this).val(), columns[selectedColumnIndex]);
        }
    });
  
    // Dynamically save input values for additional fields
    $(document).on("input", ".additional-input", function () {
        if (selectedColumnIndex !== null) {
            const key = $(this).data("key");
            let value = $(this).is(":checkbox") ? $(this).prop("checked") : $(this).val();
  
            columns[selectedColumnIndex][key] = value; // Store input changes dynamically
  
            // If options field is modified, update the Default Value dropdown
            if (key === "options") {
                updateDefaultValueDropdown(value);
            }
        }
    });
  
    // Remove the selected column
    $(document).on("click", "#columnsList .remove-btn-column", function () {
        const columnIndex = $(this).closest(".list-group-item-column").data("index");
  
        if (columnIndex !== undefined) {
            columns.splice(columnIndex, 1);
            selectedColumnIndex = columns.length > 0 ? 0 : null;
  
            updateSidebar(); // Update the sidebar to fix indexes
  
            if (columns.length > 0) {
                loadColumnDetails();
            } else {
                $("#columnDetail").hide();
            }
  
            showToast("Column removed successfully!");  // Show toast message when column is removed
        }
    });
  
    // Initially hide the column detail panel
    $("#columnDetail").hide();
    disableActions();  // Disable actions until the table name is set
    updateSidebar(); // Initial sidebar update
  
   
    // Relationship part
     
     $("#relatedModel").on("input", function () {
        if ($(this).val().trim() === "") {
            $(this).addClass("is-invalid");
        } else {
            $(this).removeClass("is-invalid");
        }
      });
    
        $("#relationshipType").change(function () {
            if ($(this).val() === "") {
                $(this).addClass("is-invalid");
            } else {
                $(this).removeClass("is-invalid");
            }
        });
      // Function to validate table name and columns
      function validateTableAndColumns() {
        tableName = $("#tableName").val().trim(); // Get updated table name
        let columnCount = $("#columnsList li").length; // Count existing columns
    
        if (!tableName) {
          showCustomAlert("Please set the Table/Model name first in the sidebar.");
          disableActionsForRelationships();
          return false;
        }
    
        if (columnCount < 2) {
          showCustomAlert("At least two columns are required.");
          disableActionsForRelationships();
          return false;
        }
    
        enableActionsForRelationships();
        return true;
      }
    
      // Disable actions until conditions are met
      function disableActionsForRelationships() {
        $("#addRelationshipBtn, #relatedModel, #relationshipType,.remove-btn-column").prop("disabled", true);
      }
    
      // Enable actions once conditions are met
      function enableActionsForRelationships() {
        $("#addRelationshipBtn, #relatedModel, #relationshipType,.remove-btn-column").prop("disabled", false);
      }
    
      // Update Relationship Sidebar
      function updateRelationshipSidebar() {
        if (!tableName) {
          showCustomAlert("Please set the Table/Model name first in the sidebar.");
          return;
        }
    
        $("#relationshipsList").empty();
    
        relationships.forEach((rel, index) => {
          const isActive = selectedRelationshipIndex === index ? "active" : "";
    
          $("#relationshipsList").append(`
            <li class="list-group-item-relationship ${isActive}" data-index="${index}">
              ${rel.relatedModel || "Untitled Relationship"}
              <button class="remove-btn-relationship btn btn-danger btn-sm float-end" data-index="${index}">
                  <i class="bi bi-x-circle"></i> 
              </button>
            </li>
          `);
        });
    
        setTimeout(() => {
          $(`li.list-group-item-relationship[data-index="${selectedRelationshipIndex}"]`).addClass("active");
        }, 10);
      }
    
      // Load Relationship Data in Detail Panel
      function loadRelationshipData() {
        if (selectedRelationshipIndex === null) return;
        const relationship = relationships[selectedRelationshipIndex];
    
        $("#columnDetail").hide();
        $("#relationshipDetail").show();
        $("#relatedModel").val(relationship.relatedModel || "");
        $("#relationshipType").val(relationship.type || "");
      }
    
      // Save Relationship Data
      function saveRelationshipData() {
        if (selectedRelationshipIndex === null) return false;
    
        const relationship = relationships[selectedRelationshipIndex];
        const relatedModel = $("#relatedModel").val().trim();
        const relationshipType = $("#relationshipType").val();
        let isValid = true;
    
        // Validate Related Model
        if (!relatedModel) {
            showCustomAlert("Related model is required.");
            $("#relatedModel").addClass("is-invalid");
            isValid = false;
        } else {
            $("#relatedModel").removeClass("is-invalid");
        }
    
        // Validate Relationship Type
        if (!relationshipType) {
            showCustomAlert("Relationship type is required.");
            $("#relationshipType").addClass("is-invalid");
            isValid = false;
        } else {
            $("#relationshipType").removeClass("is-invalid");
        }
    
        // If validation fails, return false
        if (!isValid) return false;
    
        // Save relationship data if validation passes
        relationship.relatedModel = relatedModel;
        relationship.type = relationshipType;
        updateRelationshipSidebar();
    
        return true; // Indicate successful save
    }
    
    
      // Add Relationship
      $("#addRelationshipBtn").click(function () {
        if (!validateTableAndColumns()) {
            showCustomAlert("Please set the Table/Model name first.");
            return;
        }
    
        // Validate before adding a new relationship
        if (selectedRelationshipIndex !== null && !saveRelationshipData()) {
            return; // Stop if validation fails
        }
    
        // Add a new empty relationship at the beginning
        relationships.unshift({ relatedModel: "", type: "" });
        selectedRelationshipIndex = 0; // Select the new relationship
        updateRelationshipSidebar();
        loadRelationshipData();
    
        showToast(relationships.length > 1 ? "Relationship saved successfully!" : "Input relationship details!");
    });
    
      // Set Table/Model Name
      $("#setTableNameBtn").click(function () {
        $("h5 span.tableModelName").text(tableName);
        
        // if table name is set, and columns are greater than 1, enable the add relationship button
        if ($("#columnsList li").length > 1) {
          enableActionsForRelationships();
        }else{
          disableActionsForRelationships();
        }
      });
    
      // Relationship Click Event (Using Event Delegation)
      $(document).on("click", "li.list-group-item-relationship", function () {
        saveRelationshipData();
        $("li.list-group-item-column").removeClass("active");
        $("li.list-group-item-relationship").removeClass("active");
        $(this).addClass("active");
    
        selectedRelationshipIndex = $(this).data("index");
        setTimeout(() => {
          loadRelationshipData();
        }, 10);
      });
    
      // Relationship Name Input Change
      $("#relatedModel").on("input", function () {
        if (selectedRelationshipIndex !== null) {
          relationships[selectedRelationshipIndex].relatedModel = $(this).val();
          updateRelationshipSidebar();
        }
      });
    
      // Relationship Type Change
      $("#relationshipType").change(function () {
        if (selectedRelationshipIndex !== null) {
          saveRelationshipData();
          relationships[selectedRelationshipIndex].type = $(this).val();
        }
      });
    
      // Remove Relationship
      $(document).on("click", ".remove-btn-relationship", function (event) {
        event.stopPropagation();
        const relationshipIndex = $(this).closest(".list-group-item-relationship").data("index");
    
        if (relationshipIndex !== undefined) {
          relationships.splice(relationshipIndex, 1);
          selectedRelationshipIndex = relationships.length > 0 ? 0 : null;
          updateRelationshipSidebar();
          relationships.length > 0 ? loadRelationshipData() : $("#relationshipDetail").hide();
    
          showToast("Relationship removed successfully!");
        }
      });
    
      // Toggle "Set Table Name" Button
      function toggleSetTableNameBtn() {
        $("#setTableNameBtn").prop("disabled", $("#tableName").val().trim() === "");
      }
    
      // Column Add Event (No validation here)
      $("#addColumnBtn").click(function () {
        // check column length if it is grater than 1, then enable the add relationship button
        if ($("#columnsList li").length > 1) {
          enableActionsForRelationships();
        }else{
          disableActionsForRelationships();
        }
    
      });
    
      // Column Remove Event (Using Delegation)
      $(document).on("click", ".remove-btn-column", function () {
        // check column length if it is grater than 1, then enable the add relationship button
        if ($("#columnsList li").length > 1) {
          enableActionsForRelationships();
        }else{
          disableActionsForRelationships();
        }
      });
    
      // Initial Setup
      $("#relationshipDetail").hide();
      toggleSetTableNameBtn();
      disableActionsForRelationships();
      updateRelationshipSidebar();
    
      // Table Name Input Change
      $("#tableName").on("input", toggleSetTableNameBtn);
     


       // Generate Part and Final Part
  
    $('#generateBtn').click(function() {
        console.log("Columns: ", columns);

        // Reverse the columns order before processing
        const output = `{
            "${sanitizeInput(tableName)}": {
                "columns": { 
                    ${Object.entries(columns).reverse().map(([columnIndex, columnData]) => {
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
                ${relationships.length ? `,
                    "relationships": [
                        ${relationships.map(rel => `{"type": "${rel.type}", "with": "${rel.relatedModel}"}`).join(',\n            ')}
                    ]` : ''}
            }
        }`;

    console.log("Output: ", output);
    //console.log("Relationships: ", relationships);
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
  