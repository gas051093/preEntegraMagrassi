const express = require("express");
const router = express.Router();
const ProductsManager = require("../managers/productManager");
const manager = new ProductsManager();

router.get("/", async (req, res) => {
  try {
    const products = await manager.getAll();
    res.json(products);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener los productos" });
  }
});
router.get("/:pid", async (req, res) => {
  try {
    const id = parseInt(req.params.pid);
    const product = await manager.getId(id);
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener el producto" });
  }
});
router.post("/", async (req, res) => {
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
  const missingRequired = required.filter((field) => !(field in req.body));
  if (missingRequired.length > 0) {
    return res.status(400).json({
      error: `Faltan campos obligatorios: ${missingRequired.join(", ")}`,
    });
  }
  try {
    const newProduct = await manager.addProducts(req.body);
    res.status(201).json(newProduct);
    const io = req.app.get("io");
    io.emit("product:created", newProduct);
  } catch (err) {
    return res.status(500).json({ error: "Error al agregar producto" });
  }
});
router.delete("/:pid", async (req, res) => {
  try {
    const id = parseInt(req.params.pid);
    const deletedProduct = await manager.deleteProduct(id);
    if (!deletedProduct)
      return res
        .status(404)
        .json({ error: "no se encontro el producto a eliminar" });
    res.json({ message: "Producto eliminado", product: deletedProduct });
    const io = req.app.get("io");
    io.emit("product:deleted", { id });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error al intentar eliminar el producto" });
  }
});
router.put("/:pid", async (req, res) => {
  try {
    const id = parseInt(req.params.pid);
    const updateProduct = await manager.updateProduct(id, req.body);
    if (!updateProduct)
      return res.status(404).json({ error: "No se encontro el producto" });
    res.json({ message: "producto actualizado", product: updateProduct });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Error al intentar actualizar el prodcuto" });
  }
});
module.exports = router;
