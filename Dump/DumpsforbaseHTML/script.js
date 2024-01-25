let isDraggable = false; // Initialize as not draggable

document.addEventListener("DOMContentLoaded", function () {
  const container = document.body;
  let lastMovedDiv = null;

  function createDraggableDiv(key, data) {
    const div = document.createElement("div");
    div.textContent = `${key}: ${data}`;
    div.classList.add("draggable");

    // Retrieve last position from local storage
    const lastPosition = JSON.parse(localStorage.getItem(`lastPosition_${key}`)) || { left: "50px", top: "50px" };
    div.style.left = lastPosition.left;
    div.style.top = lastPosition.top;

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

    updateDraggableState(div);

    container.appendChild(div);
  }

  function toggleDraggableState() {
    isDraggable = !isDraggable;
    const divs = document.querySelectorAll(".draggable");
    divs.forEach((div) => {
      updateDraggableState(div);
    });
  }

  function updateDraggableState(div) {
    if (isDraggable) {
      div.classList.remove("not-draggable");
    } else {
      div.classList.add("not-draggable");
    }
  }

  function enableDraggableElements() {
    isDraggable = true;
    const divs = document.querySelectorAll(".draggable");
    divs.forEach((div) => {
      updateDraggableState(div);
    });
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

  traverseAndCreateDivs({
    coord: {
      lon: 139.01,
      lat: 35.02,
      lant: 35.02,

    },
  });

  const toggleButton = document.createElement("button");
  toggleButton.textContent = "Toggle Draggable State";
  toggleButton.addEventListener("click", function () {
    toggleDraggableState();
  });

  const enableButton = document.createElement("button");
  enableButton.textContent = "Enable Draggable Elements";
  enableButton.addEventListener("click", function () {
    enableDraggableElements();
  });

  document.body.appendChild(toggleButton);
  document.body.appendChild(enableButton);

  toggleDraggableState(); // Call this after creating the draggable elements
});
