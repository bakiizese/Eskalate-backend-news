import { Sequelize } from "sequelize";

const DB_NAME: string = process.env.DB_NAME || "newsdb";
const DB_USER: string = process.env.DB_USER || "news";
const DB_PASSWORD: string = process.env.DB_PASSWORD || "pwd";
const DB_HOST: string = process.env.DB_HOST || "localhost";

const sequelize: Sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "postgres",
  logging: false,
});

const initialize = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected...");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Unable to connect to PostgreSQL:", error.message);
    } else {
      console.error("Unknown error while connecting to PostgreSQL");
    }
  }
};

initialize();

export default sequelize;
