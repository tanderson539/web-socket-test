import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = createServer(app);

app.use(express.static("public"));

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Sup?");
});

app.listen(8080, () => {
  console.log("Server running on port 8080.");
});
