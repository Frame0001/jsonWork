const container = document.body;
let lastMovedDiv = null;

const json = {
  coord: {
    lon: 139.01,
    lat: 35.02,
    lant: 35.02,
    lannt: 35.02,
  },
  // ... your other JSON data
};

function createDraggableDiv(key, data) {
  const div = document.createElement("div");
  div.textContent = `${key}: ${data}`;
  div.classList.add("draggable");

  // Retrieve last position from local storage
  const lastPosition = JSON.parse(localStorage.getItem(`lastPosition_${key}`)) || { left: "50px", top: "50px" };
  div.style.left = lastPosition.left;
  div.style.top = lastPosition.top;

  interact(div)
    .draggable({
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
            const x = parseFloat(event.target.style.left) || 0;
            const y = parseFloat(event.target.style.top) || 0;
            localStorage.setItem(`lastPosition_${key}`, JSON.stringify({ left: `${x}px`, top: `${y}px` }));
          }
        },
      },
    });

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
  const divs = document.querySelectorAll('.draggable');
  
  divs.forEach((div) => {
    const key = div.textContent.split(":")[0].trim();
    const position = { left: div.style.left, top: div.style.top };
    positions[key] = position;
  });

  const blob = new Blob([JSON.stringify(positions)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "positions.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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
          const div = document.querySelector(`.draggable:contains('${key}')`);
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

// Initial creation of divs
traverseAndCreateDivs(json);
