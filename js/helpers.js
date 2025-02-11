// actions.js
$(document).ready(function () {
    function disableActions() {
        $("#addColumnBtn, #columnName, #dataType, .additional-input").prop("disabled", true);  // Disable column-related actions
        $(".remove-btn-column").prop("disabled", true);  // Disable column removal actions
    }

    function enableActions() {
        $("#addColumnBtn, #columnName, #dataType, .additional-input").prop("disabled", false);  // Enable column-related actions
        $(".remove-btn-column").prop("disabled", false);  // Enable column removal actions
    }

    window.disableActions = disableActions;
    window.enableActions = enableActions;
});
