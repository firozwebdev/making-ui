$(document).ready(function () {
    // window.tableName = "";
    // window.columns = [];
    let selectedColumnIndex = null;
    
    
  
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
        const newColumnName = $("#columnName").val().trim().toLowerCase();  // Convert to lowercase for comparison

        // Check if the column name already exists (case-insensitive) excluding the current column
        if (columns.some((col, index) => col.name.toLowerCase() === newColumnName && index !== selectedColumnIndex)) {
            showCustomAlert("Column name already exists. Please choose a unique name.");
            $("#columnName").addClass("is-invalid"); // Highlight the field in red
            return false; // Stop saving if the name is not unique
        } else {
            $("#columnName").removeClass("is-invalid");
        }

        column.name = newColumnName;
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
      $("#addColumnBtn").click(function (e) {
          if (!checkTableName()) {
              showCustomAlert("Please set the Table/Model name first.");
              return; 
          }
          relationships = window.relationships;
          //console.log(relationships);
          // get first relationship  and check if it's relatedMOdel or type is empty
          if(relationships.length > 0){
            let firstRelationship = relationships[0];
            let relatedModel = firstRelationship?.relatedModel || "";
            let type = firstRelationship?.type || "";
            if (relatedModel.trim() === "" || type.trim() === "") {
                showCustomAlert("Please complete relationship details first.");
                return;
            }else{
                console.log(e);
                showToast("Relationship saved successfully!");
            }
          }
          // Validate before adding a new column
          if (selectedColumnIndex !== null && !saveColumnData()) {
              return; // Stop if validation fails
          }
      
          columns.unshift({ name: "", type: "", options: "" }); // Add column at the beginning
          selectedColumnIndex = 0; // Select the new column
          updateSidebar();
          loadColumnDetails();
          if(columns.length <= 1){
            showToast("Input column details!");
          }else{
            showToast("Column saved successfully!");
          }
        //   showToast(columns.length < 1 ? "Input column details!" : "");
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
  
});