const amqp = require("amqplib");
const mysql = require("mysql2/promise");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq";
const QUEUE = "order_events";

const DB_CONFIG = {
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "write_db"
};

async function startConsumer() {

  const db = await mysql.createPool(DB_CONFIG);

  console.log("Consumer connected to MySQL");

  let connection;
  let channel;

  // Retry connection until RabbitMQ is ready
  while (!connection) {
    try {
      console.log("Connecting to RabbitMQ...");
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE);

      console.log("Consumer service started");

    } catch (err) {
      console.log("RabbitMQ not ready, retrying in 5 seconds...");
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  channel.consume(QUEUE, async (msg) => {

    if (!msg) return;

    const event = JSON.parse(msg.content.toString());

    console.log("Received event:", event);

    if (event.type === "OrderCreated") {

      const order = event.payload;

      for (const item of order.items) {

        const revenue = item.price * item.quantity;

        // ------------------------------
        // Get Product Information
        // ------------------------------

        const [productRows] = await db.execute(
          "SELECT category FROM products WHERE id = ?",
          [item.product_id]
        );

        const category = productRows.length ? productRows[0].category : "Unknown";

        // ------------------------------
        // Product Analytics
        // ------------------------------

        await db.execute(`
          INSERT INTO product_sales_view
          (product_id, total_quantity_sold, total_revenue, order_count)
          VALUES (?, ?, ?, 1)
          ON DUPLICATE KEY UPDATE
          total_quantity_sold = total_quantity_sold + VALUES(total_quantity_sold),
          total_revenue = total_revenue + VALUES(total_revenue),
          order_count = order_count + 1
        `, [
          item.product_id,
          item.quantity,
          revenue
        ]);

        // ------------------------------
        // Category Analytics
        // ------------------------------

        await db.execute(`
          INSERT INTO category_metrics_view
          (category_name, total_revenue, total_orders)
          VALUES (?, ?, 1)
          ON DUPLICATE KEY UPDATE
          total_revenue = total_revenue + VALUES(total_revenue),
          total_orders = total_orders + 1
        `, [
          category,
          revenue
        ]);

      }

      // ------------------------------
      // Customer Lifetime Value
      // ------------------------------

      await db.execute(`
        INSERT INTO customer_ltv_view
        (customer_id, total_spent, order_count, last_order_date)
        VALUES (?, ?, 1, NOW())
        ON DUPLICATE KEY UPDATE
        total_spent = total_spent + VALUES(total_spent),
        order_count = order_count + 1,
        last_order_date = NOW()
      `, [
        order.customer_id,
        order.total
      ]);

      // ------------------------------
      // Hourly Sales Analytics
      // ------------------------------

      await db.execute(`
        INSERT INTO hourly_sales_view
        (hour_timestamp, total_orders, total_revenue)
        VALUES (DATE_FORMAT(NOW(), '%Y-%m-%d %H:00:00'), 1, ?)
        ON DUPLICATE KEY UPDATE
        total_orders = total_orders + 1,
        total_revenue = total_revenue + VALUES(total_revenue)
      `, [
        order.total
      ]);

    }

    channel.ack(msg);

  });

}

startConsumer();