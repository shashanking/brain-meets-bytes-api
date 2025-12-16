import dotenv from "dotenv";
dotenv.config();

export interface AppConfig {
  serverPort: number;
  dbUrl?: string;
  nodeEnv?: string;

  jwt: {
    secret: string;
    expiresIn: string;
  };
}

const config: AppConfig = {
  serverPort: Number(process.env.PORT) || 7000,
  dbUrl: process.env.DB_URL,
  nodeEnv: process.env.NODE_ENV || "development",

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  }
};

export default config;
