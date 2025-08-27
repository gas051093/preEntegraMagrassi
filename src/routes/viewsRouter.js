const express = require("express");
const ProductsManager = require("../managers/productManager");
const router = express.Router();
const manager = new ProductsManager();

router.get("/realtimeproducts",(req, res) => {
  res.render("realTimeProducts");
});

router.get("/home", async (req, res) => {
    try {
        const products = await manager.getAll();
        res.render('home', {products})
    } catch (err) {
        res.status(500).send('Error al cargar productos')
       }
});

module.exports = router;
