import "./env.ts";
import http from "node:http";
import app from "./app.ts";

const server = http.createServer(app);

export default server;

