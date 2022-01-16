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
<button id="button">update<button/>
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
    let some = await fetch(
      "https://yehudaba.wixsite.com/my-site-2/_functions/items"
    ).then((res) => res.json());

    let res = some
      .map((item, i) => {
        return `<p id="id-${i}" class="draggable" draggable="true" data-id="${item._id}">${item.slug}</p>`;
      })
      .join("");

    container.innerHTML = res;
  }

  async connectedCallback() {
    await this.updateSome();
    this.draggables = this.shadowRoot.querySelectorAll(".draggable");
    this.container = this.shadowRoot.querySelector(".container");
    this.button = this.shadowRoot.getElementById("button");

    this.button.addEventListener("click", () => {
      let allElements = this.container.children;
      //   console.log(allElements[0].getAttribute("data-id"));
      let toSend = [];
      for (let i = 0; i < allElements.length; i++) {
        toSend[i] = {};
        toSend[i]["_id"] = allElements[i].getAttribute("data-id");
        toSend[i]["slug"] = allElements[i].innerText;
        toSend[i]["order"] = i;
      }
      console.log(toSend);

      fetch("http://localhost:8080", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({arr:toSend}),
      })
        .then((res) => res.json())
        .then((data) => console.log(data))
        .catch((err) => console.log(err));
    });

    this.draggables.forEach((draggable) => {
      draggable.addEventListener("dragstart", () => {
        draggable.classList.add("dragging");
      });

      draggable.addEventListener("dragend", () => {
        draggable.classList.remove("dragging");
      });
    });

    this.container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(this.container, e.clientY);
      const draggable = this.shadowRoot.querySelector(".dragging");
      if (afterElement == null) {
        this.container.appendChild(draggable);
      } else {
        this.container.insertBefore(draggable, afterElement);
      }
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

// function myfetch(toSend){
//     fetch("https://yehudaba.wixsite.com/my-site-2/_functions-dev/needToUptade", {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ arr: toSend }),
//       })
//         .then((res) => res.json())
//         .then((data) => console.log(data))
//         .catch((err) => console.log(err));
// }

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
