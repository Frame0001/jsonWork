// Triggered when the HTML content is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Reference to the HTML body element
  const container = document.body;
  // Variable to track the last moved div
  let lastMovedDiv = null;
  // Flag to control whether elements are draggable
  let isDraggable = true;
  // Flag to control the visibility of keys
  let showKeys = true;

  // Sample JSON data
  const json = {
    categoryA_item1: 42,
    categoryA_item2: "Hello",
    categoryA_item3: true,
    categoryA_item4: [1, 2, 3],
    categoryA_item5_subItem1: "Nested",
    categoryA_item5_subItem2: 3.14,
    categoryA_item5_subItem3: ["Apple", "Banana", "Cherry"],
    categoryB_item6: "World",
    categoryB_item7: false,
    categoryB_item8: [4, 5, 6],
    categoryB_item9_subItem4: "More Nested",
    categoryB_item9_subItem5: 2.718,
    categoryB_item9_subItem6: ["Dog", "Elephant", "Fox"],
    categoryC_item10: "Goodbye",
    categoryC_item11: true,
    categoryC_item12: [7, 8, 9],
    categoryC_item13_subItem7: "Even More Nested",
    categoryC_item13_subItem8: 1.618,
    categoryC_item13_subItem9: ["Grapes", "Iguana", "Honeydew"],
  };

  // Toggle the draggable state of elements
  function toggleDraggableState() {
    isDraggable = !isDraggable;

    // Iterate over existing divs and update draggable state
    const divs = document.querySelectorAll(".draggable");
    divs.forEach((div) => {
      updateDraggableState(div);
    });
  }

  // Toggle the visibility of keys
  function toggleShowKeys() {
    showKeys = !showKeys;

    // Iterate over existing divs and update visibility
    const divs = document.querySelectorAll(".draggable");
    divs.forEach((div) => {
      updateVisibility(div);
    });
  }

  // Function to update the draggable state of a specific div
  function updateDraggableState(div) {
    if (isDraggable) {
      // Enable draggable for divs with the "draggable" class
      interact(div).draggable({
        enabled: div.classList.contains("draggable"),
        listeners: {
          start(event) {
            // Add a visual indicator when dragging starts
            event.target.classList.add("dragging");
            lastMovedDiv = event.target;
          },
          move(event) {
            if (event.target.classList.contains("draggable")) {
              // Update the position of the dragged element
              const target = event.target;
              const x = (parseFloat(target.style.left) || 0) + event.dx;
              const y = (parseFloat(target.style.top) || 0) + event.dy;

              target.style.left = `${x}px`;
              target.style.top = `${y}px`;
            }
          },
          end(event) {
            // Remove the visual indicator when dragging ends
            event.target.classList.remove("dragging");
            if (lastMovedDiv === event.target) {
              // If the div was actually moved, store its new position
              const key = event.target.textContent.split(":")[0].trim();
              const x = parseFloat(event.target.style.left) || 0;
              const y = parseFloat(event.target.style.top) || 0;
              // Store position in local storage
              localStorage.setItem(
                `lastPosition_${key}`,
                JSON.stringify({ left: `${x}px`, top: `${y}px` })
              );
            }
          },
        },
      });
      div.classList.remove("not-draggable");
    } else {
      // Disable draggable
      interact(div).unset();
      div.classList.add("not-draggable");
    }
  }

  // Function to update the visibility of keys in a div
  function updateVisibility(div) {
    const contentDiv = div.querySelector(".content");

    if (contentDiv) {
      const strongElements = contentDiv.querySelectorAll("strong");

      strongElements.forEach((strong) => {
        // Toggle the display property to show/hide keys
        strong.style.display = showKeys ? "inline" : "none";
      });
    }
  }

  // Function to create a new draggable div
  function createDraggableDiv(key, data, parentDiv) {
    const div = document.createElement("div");
    div.classList.add("draggable");

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");

    if (typeof data === "object" && data !== null) {
      // If the data is an object, create nested divs
      contentDiv.innerHTML = `<strong>${key}:</strong>`;
      createNestedDivs(data, contentDiv);
    } else {
      // If the data is not an object, display it directly
      contentDiv.innerHTML = `<strong>${key}:</strong> ${data}`;
    }

    div.appendChild(contentDiv);

    // Retrieve last position from local storage
    const lastPosition = JSON.parse(
      localStorage.getItem(`lastPosition_${key}`)
    ) || { left: "50px", top: "50px" };
    div.style.left = lastPosition.left;
    div.style.top = lastPosition.top;

    // Set the draggable state for the new div
    updateDraggableState(div);
    // Set the initial visibility
    updateVisibility(div);

    if (parentDiv) {
      // If a parent div is provided, append to it
      parentDiv.appendChild(div);
    } else {
      // If no parent div, append to the body
      container.appendChild(div);
    }
  }

  // Function to create nested divs for an object
  function createNestedDivs(obj, parentDiv) {
    const div = document.createElement("div");
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        // Display nested key-value pairs
        div.innerHTML += `<div><strong>${key}:</strong> ${value}</div>`;
      }
    }
    parentDiv.appendChild(div);
  }

  // Function to traverse the JSON and create divs
  function traverseAndCreateDivs(obj, parentDiv) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        createDraggableDiv(key, value, parentDiv);
      }
    }
  }

  // Function to export positions to a file
  function exportPositionsToFile() {
    const positions = {};
    const divs = document.querySelectorAll(".draggable");
    divs.forEach((div) => {
      const key = div.textContent.split(":")[0].trim();
      const position = { left: div.style.left, top: div.style.top };
      positions[key] = position;
    });

    return positions;
  }

  // Function to import positions from a file
  function importPositionsFromFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.addEventListener("change", function () {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = function (event) {
        try {
          const positions = JSON.parse(event.target.result);

          Object.keys(positions).forEach((key) => {
            const div = findDivByTextContent(key);
            if (div) {
              div.style.left = positions[key].left;
              div.style.top = positions[key].top;
            }
          });

          console.log("Positions loaded successfully");
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };

      reader.readAsText(file);
    });

    input.click();
  }

  // Function to find a div by text content
  function findDivByTextContent(textContent) {
    const divs = document.querySelectorAll(".draggable");
    for (const div of divs) {
      if (div.textContent.includes(textContent)) {
        return div;
      }
    }
    return null;
  }

  // Initial creation of divs
  traverseAndCreateDivs(json, null);

  // Toggle draggable state button
  const toggleButton = document.createElement("button");
  toggleButton.textContent = "Toggle Draggable State";
  toggleButton.addEventListener("click", function () {
    toggleDraggableState();
  });
  document.body.appendChild(toggleButton);

  // Toggle show keys button
  const toggleShowKeysButton = document.createElement("button");
  toggleShowKeysButton.textContent = "Toggle Show Keys";
  toggleShowKeysButton.addEventListener("click", function () {
    toggleShowKeys();
  });
  document.body.appendChild(toggleShowKeysButton);

  // Export positions to file button
  const exportButton = document.createElement("button");
  exportButton.textContent = "Export Positions";
  exportButton.addEventListener("click", function () {
    const positions = exportPositionsToFile();
    console.log("Exported Positions:", positions);
  });
  document.body.appendChild(exportButton);

  // Import positions from file button
  const importButton = document.createElement("button");
  importButton.textContent = "Import Positions";
  importButton.addEventListener("click", importPositionsFromFile);
  document.body.appendChild(importButton);

  // Function to export positions to a Python server
  function exportPositionsToPython() {
    const positions = exportPositionsToFile();

    // Send positions to the Flask server
    fetch("/receive_positions", {
      // Use a relative URL
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(positions),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Server response:", data);
      })
      .catch((error) => {
        console.error("Error sending data to server:", error);
      });
  }

  // Add a button to trigger the export to Python
  const exportToPythonButton = document.createElement("button");
  exportToPythonButton.textContent = "Export Positions to Python";
  exportToPythonButton.addEventListener("click", exportPositionsToPython);
  document.body.appendChild(exportToPythonButton);
});
