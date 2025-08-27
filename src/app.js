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

io.on("connection", async (socket) => {
  try {
    const products = await manager.getAll();
    socket.emit("products:init", products);
  } catch {
    socket.emit("products:error", {
      message: "No se pudo cargar la lista inicial.",
    });
  }

  socket.on("product:create", async (product) => {
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
        (f) => !(f in product) || product[f] === "" || product[f] === undefined
      );
      if (missing.length) {
        socket.emit("product:error", {
          message: `Faltan: ${missing.join(", ")}`,
        });
        return;
      }
      const product = {
        ...product,
        price: Number(product.price),
        stock: parseInt(product.stock, 10),
        status:
          product.status === true ||
          product.status === "true" ||
          product.status === "on" ||
          product.status === "1",
        thumbnails: Array.isArray(product.thumbnails)
          ? product.thumbnails
          : String(product.thumbnails ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
      };

      const created = await manager.addProducts(product);
      io.emit("product:created", created); // broadcast a todas las pestañas
    } catch (e) {
      socket.emit("product:error", { message: "Error al crear producto." });
    }
  });
});
