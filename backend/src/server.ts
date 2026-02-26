import app from "./app.js";
import sequelize from "./config/db.js";
import "./analytics/worker.js";
import "./analytics/scheduleJob.js";

const port: number = Number(process.env.PORT) || 5000;
const host: string = process.env.HOST || "localhost";

const startServer = async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Tables created successfully");

    app.listen(port, host, () => {
      console.log(`Server running at http://${host}:${port}`);
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Server startup error:", error.message);
    } else {
      console.error("Unknown startup error");
    }
  }
};

startServer();
