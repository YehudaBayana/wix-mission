let some = [1, 2, 3, 4, 5, 6];
const template = document.createElement("template");
template.innerHTML = `<style>
p{
    font-size: 17px;
}

.wrapper{
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
}

.container {
background-color: #333;
padding: 1rem;
margin-top: 1rem;
}

.draggable {
    position: relative;
padding: 1rem;
background-color: white;
border: 1px solid black;
cursor: move;
}

.draggable.dragging {
opacity: .5;
}

#button{
    background-color: #008CBA;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  transition: all 0.3s;
}

#button:hover{
	opacity:0.5;
}

.subject{
    font-family: sans-serif;
    font-weight: bold;
    font-size: 16px;
    color: white;
    position: absolute;
    top: -35px;
}
</style>
<div class="wrapper">
<div class="container">

</div>
<button id="button">update order</button>
</div>
`;
class SortableList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.container = this.shadowRoot.querySelector(".container");
    this.uniqueId = "newRuleId";
  }

  static get observedAttributes() {
    return ["list-data"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "list-data") {
      this.listData = newValue;
    }
  }

  get listData() {
    return this._listData;
  }

  set listData(d) {
    this._listData = JSON.parse(d);

    sessionStorage.setItem("listData", d);
    if (this._connected) this.updateList();
  }

  async updateList() {
    let list = JSON.parse(this.listData);
    if (!list.some((e) => e._id === this.uniqueId)) {
      list.unshift({
        _id: this.uniqueId,
        order: -1,
        title: "new rule here",
      });
    }
    list.sort((a, b) => (a.order > b.order ? 1 : b.order > a.order ? -1 : 0));
    let res = list
      .map((item, i) => {
        let jsonObj = JSON.stringify(item);
        return `<p ${
          item._id === this.uniqueId
            ? `style="background-color:#1a6d9d; color:white;"`
            : null
        } ${item.subject? `style="margin-top:60px"`:""} id="id-${i}" class="draggable" draggable="true" data-id=${
          item._id
        }>  ${
          item.subject
            ? `<span class="subject">${item.subject}</span>`
            : ""
        } ${item.title}</p>`;
      })
      .join("");

    this.container.innerHTML = res;
    for (let i = 0; i < this.container.children.length; i++) {
      if (!this.container.children[i].innerText) {
        this.container.children[i].remove();
      }
    }
  }

  async connectedCallback() {
    let savedData = sessionStorage.getItem("listData");
    if (savedData && savedData !== "undefined" && !this._listData)
      this._listData = savedData;
    this._connected = true;
    if (this._listData) {
      await this.updateList();
    }

    this.draggables = this.shadowRoot.querySelectorAll(".draggable");
    this.container = this.shadowRoot.querySelector(".container");
    this.updateBtn = this.shadowRoot.getElementById("button");

    this.updateBtn.addEventListener("click", () => {
      let allElements = this.container.children;
      let toSend = [];
      for (let i = 0; i < allElements.length; i++) {
        let itemId = allElements[i].getAttribute("data-id");
        toSend.push({ _id: itemId, order: i, title: allElements[i].innerText });
      }

      this.dispatchEvent(
        new CustomEvent("updateOrderClick", {
          detail: { data: JSON.stringify(toSend) },
        })
      );
      //   document.body.style.display = "none";
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
customElements.define("sortable-list", SortableList);
