const express = require("express");
const router = express.Router();
const ProductsManager = require("../managers/productManager")
const manager = new ProductsManager();



router.get('/', async (req, res) => {
    const products = await manager.getAll();
    res.json(products);
});
router.get('/:pid', async (req, res) => { 
    const id = parseInt(req.params.pid);
    const product = await manager.getId(id);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
})
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
  } catch (err) {
    res.status(500).json({ error: "Error al agregar producto" });
  }
});
router.delete('/:pid', async (req, res) => { 
    const id = parseInt(req.params.pid);
    const deletedProduct = await manager.deleteProduct(id);
    if (!deletedProduct) return res.status(404).json({ error: 'no se encontro el producto a eliminar' })
    res.json({ message: "Producto eliminado", product: deletedProduct });
})
router.put('/:pid', async(req, res) => {
    const id = parseInt(req.params.pid);
    const updateProduct = await manager.updateProduct(id, req.body);
    if (!updateProduct) return res.status(404).json({ error: 'No se encontro el producto' });
    res.json({ message: "producto actualizado", product: updateProduct})
})
module.exports = router;
