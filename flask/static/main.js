document.addEventListener("DOMContentLoaded", function () {
  const container = document.body;
  let lastMovedDiv = null;
  let isDraggable = true;
  let showKeys = true;

  const json = {
      "icu": {
          asd: 11,
          dsa: 55,
          dsaa: 55,
      },
      "icu/saa": {
          asd: 11,
          dsa: 55,
          dsaa: 55,
      },
  };

  function toggleDraggableState() {
      isDraggable = !isDraggable;
      const divs = document.querySelectorAll(".draggable");
      divs.forEach((div) => {
          updateDraggableState(div);
      });
  }

  function toggleShowKeys() {
      showKeys = !showKeys;
      const divs = document.querySelectorAll(".draggable");
      divs.forEach((div) => {
          updateVisibility(div);
      });
  }

  function updateDraggableState(div) {
      if (isDraggable) {
          enableDraggable(div);
          div.classList.remove("not-draggable");
      } else {
          disableDraggable(div);
          div.classList.add("not-draggable");
      }
  }

  function enableDraggable(div) {
      interact(div).draggable({
          enabled: div.classList.contains("draggable"),
          listeners: {
              start(event) {
                  event.target.classList.add("dragging");
                  lastMovedDiv = event.target;
              },
              move(event) {
                  if (event.target.classList.contains("draggable")) {
                      updateDraggedElementPosition(event.target, event.dx, event.dy);
                  }
              },
              end(event) {
                  event.target.classList.remove("dragging");
                  if (lastMovedDiv === event.target) {
                      storePositionInLocalStorage(event.target);
                  }
              },
          },
      });
  }

  function disableDraggable(div) {
      interact(div).unset();
  }

  function updateDraggedElementPosition(target, dx, dy) {
      const x = (parseFloat(target.style.left) || 0) + dx;
      const y = (parseFloat(target.style.top) || 0) + dy;

      target.style.left = `${x}px`;
      target.style.top = `${y}px`;
  }

  function storePositionInLocalStorage(target) {
      const key = target.textContent.split(":")[0].trim();
      const x = parseFloat(target.style.left) || 0;
      const y = parseFloat(target.style.top) || 0;

      localStorage.setItem(
          `lastPosition_${key}`,
          JSON.stringify({ left: `${x}px`, top: `${y}px` })
      );
  }

  function updateVisibility(div) {
      const contentDiv = div.querySelector(".content");
      if (contentDiv) {
          const strongElements = contentDiv.querySelectorAll("strong");
          strongElements.forEach((strong) => {
              strong.style.display = showKeys ? "inline" : "none";
          });
      }
  }

  function createDraggableDiv(key, data, parentDiv) {
      const div = document.createElement("div");
      div.classList.add("draggable");

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("content");

      if (typeof data === "object" && data !== null) {
          contentDiv.innerHTML = `<strong>${key}:</strong>`;
          createNestedDivs(data, contentDiv);
      } else {
          contentDiv.innerHTML = `<strong>${key}:</strong> ${data}`;
      }

      div.appendChild(contentDiv);
      const lastPosition = JSON.parse(localStorage.getItem(`lastPosition_${key}`)) || { left: "50px", top: "50px" };
      div.style.left = lastPosition.left;
      div.style.top = lastPosition.top;

      updateDraggableState(div);
      updateVisibility(div);

      if (parentDiv) {
          parentDiv.appendChild(div);
      } else {
          container.appendChild(div);
      }
  }

  function createNestedDivs(obj, parentDiv) {
      const div = document.createElement("div");
      for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
              const value = obj[key];
              div.innerHTML += `<div><strong>${key}:</strong> ${value}</div>`;
          }
      }
      parentDiv.appendChild(div);
  }

  function traverseAndCreateDivs(obj, parentDiv) {
      for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
              const value = obj[key];
              createDraggableDiv(key, value, parentDiv);
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

  function findDivByTextContent(textContent) {
      const divs = document.querySelectorAll(".draggable");
      for (const div of divs) {
          if (div.textContent.includes(textContent)) {
              return div;
          }
      }
      return null;
  }

  function exportPositionsToPython() {
      const positions = exportPositionsToFile();

      fetch("/receive_positions", {
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

  traverseAndCreateDivs(json, null);

  const toggleButton = createButton("Toggle Draggable State", toggleDraggableState);
  const toggleShowKeysButton = createButton("Toggle Show Keys", toggleShowKeys);
  const exportButton = createButton("Export Positions", () => {
      const positions = exportPositionsToFile();
      console.log("Exported Positions:", positions);
  });
  const importButton = createButton("Import Positions", importPositionsFromFile);
  const exportToPythonButton = createButton("Export Positions to Python", exportPositionsToPython);

  appendButtonsToBody([toggleButton, toggleShowKeysButton, exportButton, importButton, exportToPythonButton]);

  function createButton(text, clickHandler) {
      const button = document.createElement("button");
      button.textContent = text;
      button.addEventListener("click", clickHandler);
      return button;
  }

  function appendButtonsToBody(buttons) {
      buttons.forEach((button) => {
          document.body.appendChild(button);
      });
  }
});
