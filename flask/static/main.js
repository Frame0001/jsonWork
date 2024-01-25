document.addEventListener("DOMContentLoaded", function () {
  const container = document.body;
  let lastMovedDiv = null;
  let isDraggable = true;

  const json = {
    coord: {
      lat: 35.02,
    },
  };

  function toggleDraggableState() {
    isDraggable = !isDraggable;

    // Iterate over existing divs and update draggable state
    const divs = document.querySelectorAll(".draggable");
    divs.forEach((div) => {
      updateDraggableState(div);
    });
  }

  // Function to update the draggable state of a specific div
  function updateDraggableState(div) {
    if (isDraggable) {
      interact(div).draggable({
        listeners: {
          start(event) {
            event.target.classList.add("dragging");
            lastMovedDiv = event.target;
          },
          move(event) {
            const target = event.target;
            const x = (parseFloat(target.style.left) || 0) + event.dx;
            const y = (parseFloat(target.style.top) || 0) + event.dy;

            target.style.left = `${x}px`;
            target.style.top = `${y}px`;
          },
          end(event) {
            event.target.classList.remove("dragging");
            if (lastMovedDiv === event.target) {
              const key = event.target.textContent.split(":")[0].trim();
              const x = parseFloat(event.target.style.left) || 0;
              const y = parseFloat(event.target.style.top) || 0;
              localStorage.setItem(
                `lastPosition_${key}`,
                JSON.stringify({ left: `${x}px`, top: `${y}px` })
              );
            }
          },
        },
      });
      div.classList.remove("not-draggable");

      // Add a click event listener to each draggable element
      div.addEventListener("click", function () {
        console.log(`Element "${div.textContent}" clicked!`);
        // Add your custom click handling logic here
      });
    } else {
      interact(div).unset(); // Disable draggable
      div.classList.add("not-draggable");
    }
  }

  // Function to create a new draggable div
  function createDraggableDiv(key, data) {
    const div = document.createElement("div");
    div.textContent = `${key}: ${data}`;
    div.classList.add("draggable");

    // Retrieve last position from local storage
    const lastPosition = JSON.parse(
      localStorage.getItem(`lastPosition_${key}`)
    ) || { left: "50px", top: "50px" };
    div.style.left = lastPosition.left;
    div.style.top = lastPosition.top;

    // Set the draggable state for the new div
    updateDraggableState(div);

    container.appendChild(div);
  }

  function traverseAndCreateDivs(obj, prefix = "") {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === "object" && value !== null) {
          traverseAndCreateDivs(value, fullKey);
        } else {
          createDraggableDiv(fullKey, JSON.stringify(value));
        }
      }
    }
  }

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
  traverseAndCreateDivs(json);

  // Toggle draggable state button
  const toggleButton = document.createElement("button");
  toggleButton.textContent = "Toggle Draggable State";
  toggleButton.addEventListener("click", function () {
    toggleDraggableState();
  });
  document.body.appendChild(toggleButton);

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

  function exportPositionsToPython() {
    const positions = exportPositionsToFile();

    // Send positions to the Flask server
    fetch('/receive_positions', {  // Use a relative URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(positions),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Server response:', data);
    })
    .catch(error => {
        console.error('Error sending data to server:', error);
    });
}

// Add a button to trigger the export to Python
const exportToPythonButton = document.createElement('button');
exportToPythonButton.textContent = 'Export Positions to Python';
exportToPythonButton.addEventListener('click', exportPositionsToPython);
document.body.appendChild(exportToPythonButton);

});
