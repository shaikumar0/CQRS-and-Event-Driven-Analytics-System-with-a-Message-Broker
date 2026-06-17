const mysql = require("mysql2/promise");
const amqp = require("amqplib");

const DB_CONFIG = {
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "write_db"
};

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@broker:5672";

const QUEUE = "order_events";

async function connectRabbitMQ() {
  while (true) {
    try {
      console.log("Trying to connect to RabbitMQ...");

      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      await channel.assertQueue(QUEUE);

      console.log("Connected to RabbitMQ");

      return channel;

    } catch (err) {
      console.log("RabbitMQ not ready, retrying in 5 seconds...");
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

async function startPublisher() {

  const db = await mysql.createPool(DB_CONFIG);

  const channel = await connectRabbitMQ();

  console.log("Outbox Publisher started");

  setInterval(async () => {

    try {

      const [events] = await db.execute(
        "SELECT * FROM outbox WHERE processed = FALSE"
      );

      for (let event of events) {

        const message = JSON.stringify({
          id: event.id,
          type: event.event_type,
          payload: event.payload
        });

        channel.sendToQueue(QUEUE, Buffer.from(message));

        await db.execute(
          "UPDATE outbox SET processed = TRUE WHERE id = ?",
          [event.id]
        );

        console.log("Published event:", message);
      }

    } catch (error) {
      console.error("Publisher error:", error);
    }

  }, 5000);

}

startPublisher();