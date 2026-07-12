import "./env.ts";
import http from "node:http";
import app from "./app.ts";
import initializeWebSocket from "./ws.ts";

const server = http.createServer(app);
initializeWebSocket(server);

export default server;
