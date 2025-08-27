const socket = io();
const tbody = document.getElementById("tbody");
const formCreate = document.getElementById("formCreateProduct");
const formDelete = document.getElementById("formDeleteProduct");
const createMsg = document.getElementById("createMsg");

const addRow = (p) => {
  if (tbody.querySelector(`tr[data-id="${p.id}"]`)) return;

  const tr = document.createElement("tr");
  tr.dataset.id = p.id;
  tr.innerHTML = `
    <td>${p.id}</td>
    <td>${p.title}</td>
    <td>${p.code}</td>
    <td>$ ${p.price}</td>
    <td>${p.stock}</td>
    <td>${p.category}</td>
    <td>${p.status ? 'Activo' : 'Inactivo'}</td>
  `;
  tbody.appendChild(tr);
};

socket.on("products:init", (products) => {
  tbody.innerHTML = "";
  products.forEach(addRow);
});

    formCreate.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = new FormData(formCreate);
        const product = Object.fromEntries(data.entries());

        product.title = product.title;
        product.price = Number(product.price);
        product.stock = parseInt(product.stock, 10);
        product.status = product.status === "activo"
        product.thumbnails = (product.thumbnails || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        socket.emit("product:create", product);
        formCreate.reset();
        if (createMsg) createMsg.textContent = "Enviando…";
    }) 

socket.on("product:error", ({ message }) => {
  if (createMsg) createMsg.textContent = message || "Error";
  setTimeout(() => (createMsg.textContent = ""), 9000);
});

socket.on("product:created", (product) => {
  addRow(product); 
  if (createMsg) {
    createMsg.textContent = "Producto creado ✔";
    setTimeout(() => (createMsg.textContent = ""), 2000);
  }
});

formDelete.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(formDelete);
  const id = parseInt(data.get("id"), 10);
  if (Number.isNaN(id)) {
    if (createMsg) createMsg.textContent = "ID inválido";
    return;
  }
  socket.emit("product:delete", { id });
  formDelete.reset();
  if (createMsg) createMsg.textContent = "Enviando…";
});

socket.on("product:deleted", ({ id }) => {
  const row = tbody.querySelector(`tr[data-id="${id}"]`);
  if (row) row.remove();
  if (createMsg) {
    createMsg.textContent = "Producto eliminado ✔";
    setTimeout(() => (createMsg.textContent = ""), 2000);
  }
});