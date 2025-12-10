// server.ts
import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import path from "path";
import morgan from "morgan";
import cors from "cors";
import fileUpload from "express-fileupload";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import config from "./app/config/config";
const options: any = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Brain-Meets-BYTES",
      version: "1.0.0",
      description: "API'S documentation",
    },
    servers: [
      {
        url: "http://localhost:5000",
      }
    ],
  },
  apis: ["./app/routes/*.js"], 
};

const specs = swaggerJsDoc(options);
const app: Application = express();
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
app.use(fileUpload());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
app.use(morgan("dev"));
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With,Content-Type,token"
  );
  res.header("Access-Control-Max-Age", "600");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.set("view engine", "jade");
app.use(express.static(path.join(__dirname, "public")));

app.listen(config.serverPort, () => {
  console.log("Server is listening on port", config.serverPort);
});

// DB connection
// db.sequelize
//   .authenticate()
//   .then(() => {
//     console.log("DB CONNECTED");
//   })
//   .catch((err: unknown) => {
//     console.log(`Error ${err}`);
//   });

export default app;
