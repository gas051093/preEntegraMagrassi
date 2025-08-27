const express = require("express");
const { Server } = require("socket.io");
const { engine } = require("express-handlebars");
const ProductsManager = require("./managers/productManager");
const manager = new ProductsManager();

const app = express();

const cartsRouter = require("./routes/cartsRouter");
const productsRouter = require("./routes/productsRouter");
const viewsRouter = require("./routes/viewsRouter");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine("hbs", engine({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", "./src/views");
const PORT = 8080;

app.use(express.static("./src/public"));
app.use("/api/carts", cartsRouter);
app.use("/api/products", productsRouter);
app.use("/", viewsRouter);

const serverHTTP = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = new Server(serverHTTP);
app.set("io", io);

io.on("connection", async (socket) => {
  try {
    const products = await manager.getAll();
    socket.emit("products:init", products);
  } catch {
    socket.emit("product:error", {
      message: "No se pudo cargar la lista inicial.",
    });
  }
  socket.on("product:create", async (payload) => {
    try {
      const required = [
        "title",
        "description",
        "code",
        "price",
        "status",
        "stock",
        "category",
        "thumbnails",
      ];
      const missing = required.filter(
        (f) => !(f in payload) || payload[f] === "" || payload[f] === undefined
      );
      if (missing.length) {
        socket.emit("product:error", {
          message: `Faltan: ${missing.join(", ")}`,
        });
        return;
      }
      const product = {
        ...payload,
        price: Number(payload.price),
        stock: parseInt(payload.stock, 10),
        status:
          payload.status === true ||
          payload.status === "true" ||
          payload.status === "on" ||
          payload.status === "1",
        thumbnails: Array.isArray(payload.thumbnails)
          ? payload.thumbnails
          : String(payload.thumbnails ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
      };

      const created = await manager.addProducts(product);
      io.emit("product:created", created); 
    } catch (e) {
      socket.emit("product:error", { message: `${e} Error al crear producto.` });
    }
  });
  socket.on("product:delete", async ({ id }) => {
    try {
      const numId = parseInt(id, 10);
      if (Number.isNaN(numId)) {
        socket.emit("product:error", { message: "ID inválido." });
        return;
      }
      const deleted = await manager.deleteProduct(numId);
      if (!deleted) {
        socket.emit("product:error", { message: "Producto no encontrado." });
        return;
      }
      io.emit("product:deleted", { id: numId });
    } catch (e) {
      socket.emit("product:error", {
        message: "Error al eliminar producto.",
      });
    }
  });
});
