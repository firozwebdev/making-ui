$(document).ready(function () {
  let relationships = [];
  let selectedRelationshipIndex = null;
  let tableName = "";

  // Function to validate table name and columns
  function validateTableAndColumns() {
    tableName = $("#tableName").val().trim(); // Get updated table name
    let columnCount = $("#columnsList li").length; // Count existing columns

    if (!tableName) {
      showCustomAlert("Please set the Table/Model name first in the sidebar.");
      disableActions();
      return false;
    }

    if (columnCount < 2) {
      showCustomAlert("At least two columns are required.");
      disableActions();
      return false;
    }

    enableActions();
    return true;
  }

  // Disable actions until conditions are met
  function disableActions() {
    $("#addRelationshipBtn, #relatedModel, #relationshipType,.remove-btn-column").prop("disabled", true);
  }

  // Enable actions once conditions are met
  function enableActions() {
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
    if (selectedRelationshipIndex === null) return;
    relationships[selectedRelationshipIndex].relatedModel = $("#relatedModel").val();
    relationships[selectedRelationshipIndex].type = $("#relationshipType").val();
    updateRelationshipSidebar();
  }

  // Add Relationship
  $("#addRelationshipBtn").click(function () {
    if (!validateTableAndColumns()) return; // Only validate when adding relationships
    saveRelationshipData();
    relationships.unshift({ relatedModel: "", type: "" });
    selectedRelationshipIndex = 0;
    updateRelationshipSidebar();
    loadRelationshipData();

    if (relationships.length > 1) {
      showToast("Relationship saved successfully!");
    } else {
      showToast("Input relationship details!");
    }
  });

  // Set Table/Model Name
  $("#setTableNameBtn").click(function () {
    $("h5 span.tableModelName").text(tableName);
    
    // if table name is set, and columns are greater than 1, enable the add relationship button
    if ($("#columnsList li").length > 1) {
      enableActions();
    }else{
      disableActions();
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
      enableActions();
    }else{
      disableActions();
    }

  });

  // Column Remove Event (Using Delegation)
  $(document).on("click", ".remove-btn-column", function () {
    // check column length if it is grater than 1, then enable the add relationship button
    if ($("#columnsList li").length > 1) {
      enableActions();
    }else{
      disableActions();
    }
  });

  // Initial Setup
  $("#relationshipDetail").hide();
  toggleSetTableNameBtn();
  disableActions();
  updateRelationshipSidebar();

  // Table Name Input Change
  $("#tableName").on("input", toggleSetTableNameBtn);
});
