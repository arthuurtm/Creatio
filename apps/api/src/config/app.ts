import cookieParser from "cookie-parser";
import express from "express";
import { errorHandler } from "#api/middlewares/errorHandler.ts";
import { requestLogger } from "#api/middlewares/requestLogger.ts";
import { DatabaseRoute, FilesRoute, RootRoute } from "../routes/index.ts";

const app = express();
app.use(express.json());
app.use(cookieParser());
// Logs
app.use(requestLogger);
// Rotas
app.use("/api/database", DatabaseRoute);
app.use("/api", RootRoute);
app.use("/api/file", FilesRoute);
// Erros
app.use(errorHandler);

export default app;
