const express = require('express');
const app = express();
const cartsRouter = require("./routes/cartsRouter");
const productsRouter = require("./routes/productsRouter");
app.use(express.json());

const PORT = 8080;

app.use('/api/carts', cartsRouter);
app.use("/api/products", productsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});