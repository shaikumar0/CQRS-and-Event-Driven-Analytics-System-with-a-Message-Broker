const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 8081;

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "write_db"
};

async function startServer() {

  try {

    const db = await mysql.createPool(DB_CONFIG);

    console.log("Query service connected to database");

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.json({
        status: "Query service running"
      });
    });

    // Product analytics
    app.get("/analytics/products", async (req, res) => {
      try {

        const [rows] = await db.execute(
          "SELECT * FROM product_sales_view"
        );

        res.json(rows);

      } catch (error) {
        console.error("Products analytics error:", error);
        res.status(500).json({ error: "Failed to fetch product analytics" });
      }
    });

    // Category analytics
    app.get("/analytics/categories", async (req, res) => {
      try {

        const [rows] = await db.execute(
          "SELECT * FROM category_metrics_view"
        );

        res.json(rows);

      } catch (error) {
        console.error("Category analytics error:", error);
        res.status(500).json({ error: "Failed to fetch category analytics" });
      }
    });

    // Customer lifetime value analytics
    app.get("/analytics/customers", async (req, res) => {
      try {

        const [rows] = await db.execute(
          "SELECT * FROM customer_ltv_view"
        );

        res.json(rows);

      } catch (error) {
        console.error("Customer analytics error:", error);
        res.status(500).json({ error: "Failed to fetch customer analytics" });
      }
    });

    // Hourly sales analytics
    app.get("/analytics/hourly", async (req, res) => {
      try {

        const [rows] = await db.execute(
          "SELECT * FROM hourly_sales_view"
        );

        res.json(rows);

      } catch (error) {
        console.error("Hourly analytics error:", error);
        res.status(500).json({ error: "Failed to fetch hourly analytics" });
      }
    });

    app.listen(PORT, () => {
      console.log(`Query Service running on port ${PORT}`);
    });

  } catch (err) {

    console.error("Database connection failed:", err);
    process.exit(1);

  }

}

startServer();