require("./outboxPublisher");
const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// const PORT = 8080;

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "write_db"
});

// Health endpoint
app.get("/health", (req, res) => {
  res.send("Command service running");
});


// CREATE PRODUCT API
app.post("/api/products", async (req, res) => {
  try {

    const { name, category, price, stock } = req.body;

    const [result] = await pool.execute(
      "INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)",
      [name, category, price, stock]
    );

    res.json({
      message: "Product created",
      productId: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating product");
  }
});


// CREATE ORDER API
app.post("/api/orders", async (req, res) => {
  try {

    const { customer_id, items } = req.body;

    let total = 0;

    for (let item of items) {
      total += item.price * item.quantity;
    }

    // create order
    const [orderResult] = await pool.execute(
      "INSERT INTO orders (customer_id, total_amount) VALUES (?, ?)",
      [customer_id, total]
    );

    const orderId = orderResult.insertId;

    // insert order items
    for (let item of items) {
      await pool.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // create outbox event
    const eventPayload = {
      orderId,
      customer_id,
      items,
      total
    };

    await pool.execute(
      "INSERT INTO outbox (event_type, payload) VALUES (?, ?)",
      ["OrderCreated", JSON.stringify(eventPayload)]
    );

    res.json({
      message: "Order created",
      orderId
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating order");
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Command Service running on port ${PORT}`);
});