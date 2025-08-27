const express = require("express");
const router = express.Router();
const cartManager = require("../managers/cartManager");
const manager = new cartManager();

router.get('/', async (req, res) => {
    const carts = await manager.getAll();
    res.json(carts);
});

router.post('/', async (req, res) => { 
    try {
        const newCart = await manager.createCart()
        res.status(201).json(newCart);
    } catch (err) { 
        res.status(500).json({ error: `error al crear el carrito ${err}`})
    }
})
router.get('/:cid', async (req, res) => { 
    try {
        const cid = parseInt(req.params.cid);
        const cart = await manager.getId(cid);
        if (!cart) return res.status(404).json({ error: 'carrito no encontrado en la base' })
        res.json(cart.products);
    } catch (err) {
       return res.status(500).json({ error: "Error al obtener el carrito" });
    }
})
router.post('/:cid/product/:pid', async (req, res) => { 
    try {
        const cid = parseInt(req.params.cid);
        const pid = parseInt(req.params.pid);
        const addToCart = await manager.addProductCart(cid, pid);
        if (!addToCart) return res.status(404).json({ error: "carrito o produco no encontado" })
        return res.json({message: "se agrego el producto al carrito", cart: addToCart})
    } catch (err) {
         return res.status(500).json({ error: "Error al agregar producto al carrito" });
    }
})
module.exports = router;
