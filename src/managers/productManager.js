const fs = require("fs");
const path = "./src/data/products.json";

class ProductsManager{
  async getAll() {
    try {
      const data = await fs.promises.readFile(path, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      console.log(`error encontrado ${err}`);
      return []; //retorno un array vacio en caso de un error de lectura del archivo o que no se encuentre
    }
  }
  async getId(id) {
    const products = await this.getAll();
    const prod = products.find((p) => p.id == id);
    return prod;
  }
  async addProducts(productData) {
    const products = await this.getAll();
    const newId = products.length ? products[products.length - 1].id + 1 : 1;
    const newProduct = {
      id: newId,
      title: productData.title,
      description: productData.description,
      code: productData.code,
      price: productData.price,
      status: productData.status,
      stock: productData.stock,
      category: productData.category,
      thumbnails: Array.isArray(productData.thumbnails)
        ? productData.thumbnails
        : [],
    };
    products.push(newProduct);
    try {
      await fs.promises.writeFile(path, JSON.stringify(products, null, "\t"));
    } catch (err) {
      console.log(err);
      return;
    }
    return newProduct;
  }
  async updateProduct(id, dataUpdate) {
    const products = await this.getAll();
    const index = products.findIndex((prod) => prod.id == id);
    if (index === -1) return null;
    products[index] = {
      ...products[index],
      ...dataUpdate,
      id: products[index].id,
    };
    try {
      await fs.promises.writeFile(path, JSON.stringify(products, null, "\t"));
    } catch (err) {
      console.log(err);
      return null;
    }
    return products[index];
  }
  async deleteProduct(id) {
    const products = await this.getAll();
    const index = products.findIndex((prod) => prod.id == id);
    if (index === -1) return null;
    const deleted = products.splice(index, 1)[0];
    try {
      await fs.promises.writeFile(path, JSON.stringify(products, null, "\t"));
    } catch (err) {
      console.log(err);
      return null;
    }
    return deleted;
  }
}

module.exports = ProductsManager;
