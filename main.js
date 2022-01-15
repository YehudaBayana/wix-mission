let some = [1, 2, 3, 4, 5, 6];
const template = document.createElement("template");
template.innerHTML = `<style>
.container {
background-color: #333;
padding: 1rem;
margin-top: 1rem;
}

.draggable {
padding: 1rem;
background-color: white;
border: 1px solid black;
cursor: move;
}

.draggable.dragging {
opacity: .5;
}
</style>
<div class="container">

</div>`;
class HelloWorld extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
  async updateSome() {
    let container = this.shadowRoot.querySelector(".container");
    let some = await fetch("https://jsonplaceholder.typicode.com/users").then(
      (res) => res.json()
    );
    let res = some
      .map((item, i) => {
        return `<p id="id-${i}" class="draggable" draggable="true">${i}</p>`;
      })
      .join("");

    container.innerHTML = res;
  }

  async connectedCallback() {
    await this.updateSome();
    this.draggables = this.shadowRoot.querySelectorAll(".draggable");
    this.containers = this.shadowRoot.querySelectorAll(".container");

    this.draggables.forEach((draggable) => {
      draggable.addEventListener("dragstart", () => {
        draggable.classList.add("dragging");
      });

      draggable.addEventListener("dragend", () => {
        draggable.classList.remove("dragging");
      });
    });

    this.containers.forEach((container) => {
      container.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        const draggable = this.shadowRoot.querySelector(".dragging");
        if (afterElement == null) {
          container.appendChild(draggable);
        } else {
          container.insertBefore(draggable, afterElement);
        }
      });
    });

    function getDragAfterElement(container, y) {
      const draggableElements = [
        ...container.querySelectorAll(".draggable:not(.dragging)"),
      ];

      return draggableElements.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = y - box.top - box.height / 2;
          if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
          } else {
            return closest;
          }
        },
        { offset: Number.NEGATIVE_INFINITY }
      ).element;
    }
  }
}
customElements.define("hello-world", HelloWorld);

// const this.draggables = document.querySelectorAll(".draggable");
// const this.containers = document.querySelectorAll(".container");

// this.draggables.forEach((draggable) => {
//   draggable.addEventListener("dragstart", () => {
//     draggable.classList.add("dragging");
//   });

//   draggable.addEventListener("dragend", () => {
//     draggable.classList.remove("dragging");
//   });
// });

// this.containers.forEach((container) => {
//   container.addEventListener("dragover", (e) => {
//     e.preventDefault();
//     const afterElement = getDragAfterElement(container, e.clientY);
//     const draggable = document.querySelector(".dragging");
//     if (afterElement == null) {
//       container.appendChild(draggable);
//     } else {
//       container.insertBefore(draggable, afterElement);
//     }
//   });
// });

// function getDragAfterElement(container, y) {
//   const draggableElements = [
//     ...container.querySelectorAll(".draggable:not(.dragging)"),
//   ];

//   return draggableElements.reduce(
//     (closest, child) => {
//       const box = child.getBoundingClientRect();
//       const offset = y - box.top - box.height / 2;
//       if (offset < 0 && offset > closest.offset) {
//         return { offset: offset, element: child };
//       } else {
//         return closest;
//       }
//     },
//     { offset: Number.NEGATIVE_INFINITY }
//   ).element;
// }
