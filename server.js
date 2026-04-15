const http = require("http");
const { MongoClient, ObjectId } = require("mongodb");

const url = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const PORT = process.env.PORT || 2000;
const client = new MongoClient(url);

let db;

// =========================
// CONNECT DB
// =========================
async function connectDB() {
  try {
    await client.connect();
    db = client.db("todoDB");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection error", err);
  }
}

connectDB();

// =========================
// HELPER
// =========================
function send(res, data, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(data));
}

// =========================
// SERVER
// =========================
const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  // =========================
  // CORS (MUST BE FIRST)
  // =========================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // preflight request
  if (method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  console.log(method, url);

  // =========================
  // GET TODOS
  // =========================
  if (method === "GET" && url === "/todo") {
    const todos = await db.collection("todos").find().toArray();
    return send(res, { todos });
  }

  // =========================
  // CREATE TODO
  // =========================
  if (method === "POST" && url === "/todo") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(body);

        if (!data.text) {
          return send(res, { error: "Text required" }, 400);
        }

        await db.collection("todos").insertOne({
          text: data.text,
          createdAt: new Date(),
        });

        send(res, { message: "Todo created" });
      } catch (err) {
        send(res, { error: "Invalid JSON" }, 500);
      }
    });

    return;
  }

  // =========================
  // UPDATE TODO
  // =========================
  if (method === "PUT" && url.startsWith("/todo")) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const id = url.split("?id=")[1];

        if (!id) {
          return send(res, { error: "ID required" }, 400);
        }

        await db
          .collection("todos")
          .updateOne({ _id: new ObjectId(id) }, { $set: { text: data.text } });

        send(res, { message: "Todo updated" });
      } catch (err) {
        send(res, { error: "Update failed" }, 500);
      }
    });

    return;
  }

  // =========================
  // DELETE TODO
  // =========================
  if (method === "DELETE" && url.startsWith("/todo")) {
    const id = url.split("?id=")[1];

    if (!id) {
      return send(res, { error: "ID required" }, 400);
    }

    await db.collection("todos").deleteOne({
      _id: new ObjectId(id),
    });

    return send(res, { message: "Todo deleted" });
  }

  // =========================
  // DEFAULT
  // =========================
  send(res, { message: "Server running" });
});

// =========================
// START SERVER
// =========================
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
