// Disable actions until the table name is set
function disableActions() {
    $("#addColumnBtn,  #columnName, #dataType, .additional-input, #addRelationshipBtn, #relatedModel").prop("disabled", true);  // Disable column-related actions
    $(".remove-btn-column").prop("disabled", true);  // Disable column removal actions
}

// Enable actions once the table name is set
function enableActions() {
    $("#addColumnBtn, #columnName, #dataType, .additional-input, #addRelationshipBtn, #relatedModel").prop("disabled", false);  // Enable column-related actions
    $(".remove-btn-column").prop("disabled", false);  // Enable column removal actions
}