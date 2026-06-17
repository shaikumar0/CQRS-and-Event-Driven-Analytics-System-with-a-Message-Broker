# CQRS and Event-Driven Analytics System with RabbitMQ

## 📌 Project Overview

This project implements a **CQRS (Command Query Responsibility Segregation) and Event-Driven Analytics System** using **Node.js, MySQL, RabbitMQ, and Docker**.

The system separates **write operations (Command Service)** from **read operations (Query Service)** and uses **RabbitMQ as a message broker** to process events asynchronously.

Analytics data is updated by a **Consumer Service** that processes events from RabbitMQ and updates dedicated analytics tables.

This architecture improves **scalability, reliability, and real-time analytics processing**.

---

# 🏗 System Architecture

```
Client
   ↓
Command Service (Write APIs)
   ↓
MySQL Database
   ↓
Outbox Table
   ↓
Outbox Publisher
   ↓
RabbitMQ Message Broker
   ↓
Consumer Service
   ↓
Analytics Tables
   ↓
Query Service (Read APIs)
```

---

# ⚙ Technologies Used

* Node.js
* Express.js
* MySQL
* RabbitMQ
* Docker & Docker Compose

---

# 🔑 Environment Variables

This project uses environment variables for service configuration.

Create a `.env` file if needed using the example below.

Example `.env.example`:

DB_HOST=db  
DB_USER=root  
DB_PASSWORD=root  
DB_NAME=write_db  

RABBITMQ_URL=amqp://rabbitmq

---

# 📂 Project Structure
```
project-root
│
├── command-service
│   ├── src
│   │   ├── index.js
│   │   └── outboxPublisher.js
│   ├── Dockerfile
│   └── package.json
│
├── consumer-service
│   ├── src
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
│
├── query-service
│   ├── src
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
│
├── db-init
│   └── init.sql
│
├── .env.example
├── docker-compose.yml
├── README.md
└── submission.json
```
### Folder Description

command-service → Handles write operations like creating products and orders.

consumer-service → Listens to RabbitMQ events and updates analytics tables.

query-service → Provides analytics APIs for reporting.

db-init → Contains SQL scripts for initializing database schema.
---

# 🧠 Key Concepts Implemented

### CQRS (Command Query Responsibility Segregation)

The system separates:

* **Command Service** → handles write operations (create products and orders)
* **Query Service** → handles read operations (analytics queries)

This improves system scalability and performance.

---

### Event-Driven Architecture

When an order is created, an **OrderCreated event** is generated and published to RabbitMQ.

The **Consumer Service** listens to this event and updates analytics tables.

---

### Outbox Pattern

To ensure reliable event delivery, the system uses the **Outbox Pattern**.

1. When an order is created, an event is written to the **outbox table**.
2. The **Outbox Publisher** reads events from this table.
3. Events are then published to **RabbitMQ**.

This prevents event loss in case of service failures.

---

# 🚀 Running the System

## 1️⃣ Clone the Repository

```
git clone https://github.com/23MH1A05L3/Implement-a-CQRS-and-Event-Driven-Analytics-System-with-a-Message-Broker.git
cd Implement-a-CQRS-and-Event-Driven-Analytics-System-with-a-Message-Broker
```

---

## 2️⃣ Start All Services

```
docker-compose up --build
```

This will start the following containers:

* MySQL Database
* RabbitMQ Message Broker
* Command Service
* Query Service
* Consumer Service

---

# 🌐 Service Ports

| Service            | URL                    |
| ------------------ | ---------------------- |
| Command Service    | http://localhost:8080  |
| Query Service      | http://localhost:8081  |
| RabbitMQ Dashboard | http://localhost:15672 |
| MySQL              | localhost:3307         |

RabbitMQ login:

```
username: guest
password: guest
```

---

# 🧪 API Testing

## Create Product

```
POST /api/products
```

Example request:

```
{
  "name": "Laptop",
  "category": "Electronics",
  "price": 50000,
  "stock": 10
}
```
Example URL:
```
POST http://localhost:8080/api/products
```
---

## Create Order

```
POST /api/orders
```

Example request:

```
{
"customer_id": 1,
"items": [
{
"product_id": 1,
"quantity": 2,
"price": 50000
}
]
}
```
Example URL:
```
POST http://localhost:8080/api/orders
```
When an order is created:

```
OrderCreated Event
↓
RabbitMQ Queue
↓
Consumer Service
↓
Analytics Tables Updated
```

---

# 📊 Analytics APIs

## Product Sales Analytics

```
GET http://localhost:8081/analytics/products
```

Example response:

```
[
 {
  "product_id": 1,
  "total_quantity_sold": 2,
  "total_revenue": 100000,
  "order_count": 1
 }
]
```

---

## Category Analytics

```
GET http://localhost:8081/analytics/categories
```

---

## Customer Lifetime Value

```
GET http://localhost:8081/analytics/customers
```

---

## Hourly Sales

```
GET http://localhost:8081/analytics/hourly
```

---

# 🐇 RabbitMQ Queue

RabbitMQ dashboard:

```
http://localhost:15672
```

Queue used in this project:

```
order_events
```

This queue receives events generated by the **Outbox Publisher**.

---

# 🔄 Event Processing Flow

1. Client creates an order using Command Service.
2. Order is stored in MySQL.
3. Event is written to the **outbox table**.
4. Outbox publisher sends event to **RabbitMQ**.
5. Consumer Service processes the event.
6. Analytics tables are updated.
7. Query Service returns analytics data.

---

# ✅ Verification Steps

1. Start the system using Docker.
2. Create a product using `/api/products`.
3. Create an order using `/api/orders`.
4. Open RabbitMQ dashboard (`http://localhost:15672`) and verify the queue `order_events`.
5. Verify analytics tables in MySQL.
6. Call analytics APIs.

---

