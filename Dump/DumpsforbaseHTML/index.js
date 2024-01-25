jsonData = {
  coord: {
    lon: 139.01,
    lat: 35.02,
    lant: 35.02,

  },
};
document.addEventListener("DOMContentLoaded", function () {
  // var jsonData = {{ json_data | tojson | safe }};

  // ... your other JSON dat

  const container = document.body;
  let lastMovedDiv = null;
  let isDraggable = false;

  const toggleButton = document.createElement("button");
  toggleButton.textContent = "Toggle Draggable State";

  toggleButton.addEventListener("click", function (event) {
    event.stopPropagation(); // Stop the click event from propagating to other elements
    toggleDraggableState();
  });

  document.body.appendChild(toggleButton);
  const json = jsonData;
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
              // Save the last position to local storage
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

    //creating a savable file for backup for now is unloaded
    // const blob = new Blob([JSON.stringify(positions)], {
    //   type: "application/json",
    // });
    // const a = document.createElement("a");
    // a.href = URL.createObjectURL(blob);
    // a.download = "positions.json";
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);
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

  //on load last saved file "savedPosition.json"
  function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status == 0) {
          var allText = rawFile.responseText;
          const positions = JSON.parse(allText);
          try {
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
        }
      }
    };
    rawFile.send(null);
  }

  function test() {
    console.log(exportPositionsToFile());
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
});
