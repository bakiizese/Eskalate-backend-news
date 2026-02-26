import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { Op, fn, col } from "sequelize";
import ReadLog from "../models/ReadLog.js";
import DailyAnalytics from "../models/DailyAnalytics.js";

interface DailyJobData {
  date: string;
}

const connection = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker<DailyJobData>(
  "dailyAnalytics",
  async (job: Job<DailyJobData>) => {
    const date = job.data.date;

    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    const aggregate = await ReadLog.findAll({
      attributes: ["articleId", [fn("COUNT", col("id")), "viewCount"]],
      where: {
        readAt: { [Op.between]: [start, end] },
      },
      group: ["articleId"],
    });

    for (const row of aggregate) {
      const viewCount = Number(row.get("viewCount"));
      await DailyAnalytics.upsert({
        articleId: row.get("articleId") as string,
        viewCount,
        date,
      });
    }

    console.log(`Aggregation completed for ${date}`);
  },
  { connection },
);

export default worker;
