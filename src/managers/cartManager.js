const fs = require("fs");
const path = "./src/data/carts.json";

class cartManager {
    async getAll() {
        try {
            const data = await fs.promises.readFile(path, 'utf-8');
            return JSON.parse(data);
        } catch (err) { 
            console.log(err);
            return [];
        }
  }
    async getId(id) {
        const carts = await this.getAll();
        const cart = carts.find(cart => cart.id == id)
        return cart
  }
    async createCart() {
        const carts = await this.getAll();
        const newId = carts.length ? carts[carts.length - 1].id + 1 : 1;
        const newCart = { id: newId, products: [] };
        carts.push(newCart);
        try {
            await fs.promises.writeFile(path, JSON.stringify(carts, null, "\t"));
            return newCart;
        } catch (err) { 
            console.log(err);
            return null
        }
  }
    async addProductCart(cartId, productId) {
        const carts = await this.getAll();
        const cartIndex = carts.findIndex(cart => cart.id == cartId);
        if (cartIndex === - 1) return null;
        const productCartExist = carts[cartIndex].products.find(prod => prod.product == productId)
        if (productCartExist) {
            productCartExist.quantity += 1;
        } else { 
            carts[cartIndex].products.push({ product: productId, quantity: 1 });
        }
        try {
            await fs.promises.writeFile(path, JSON.stringify(carts, null, "\t"));
            return carts[cartIndex];
        } catch (err) { 
            console.log(err);
            return null;
        }
  }
}

module.exports = cartManager