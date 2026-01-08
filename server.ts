// server.ts
import dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import path from "path";
import morgan from "morgan";
import cors from "cors";
import fileUpload from "express-fileupload";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import mongoose from "mongoose";
import config from "./src/app/config/config";
import apiRouter from "./src/app/modules/app.router";

const swaggerOptions: any = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Brain-Meets-BYTES",
      version: "1.0.0",
      description: "API's documentation",
    },
    servers: [
      {
        url: `http://localhost:${config.serverPort}`,
      },
    ],
  },
  apis: ["./src/app/modules/**/*.ts", "./src/app/routes/*.ts", "./src/app/modules/**/*.js"],
};
const specs = swaggerJsDoc(swaggerOptions);
const app: Application = express();
app.use(
  cors({
    origin: [
      "https://brain-meets-bytes.vercel.app",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
    credentials: true
  })
);
app.options("*", cors());
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
app.use(fileUpload());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(morgan("dev"));
app.set("view engine", "jade");
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req: Request, res: Response) => {
  res.send("Backend running successfully!");
});
app.use("/api", apiRouter);
async function connectDB() {
  const dbUrl = config.dbUrl;
  if (!dbUrl) {
    console.error("No DB_URL provided in environment. Exiting.");
    process.exit(1);
  }
  try {
    await mongoose.connect(dbUrl, {});
    const conn = mongoose.connection;
    console.log("DB CONNECTED");
    console.log("Database name:", conn.name || "(unknown)");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

const start = async () => {
  await connectDB();
  app.listen(config.serverPort, "0.0.0.0", () => {
    console.log("Server is listening on port", config.serverPort);
  });
};

start().catch((err) => {
  console.error("Fatal error on startup:", err);
  process.exit(1);
});

export default app;
