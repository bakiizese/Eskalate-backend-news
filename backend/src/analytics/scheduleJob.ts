import cron from "node-cron";
import { Queue } from "bullmq";
import { Redis } from "ioredis";

const connection = new Redis();

const dailyQueue = new Queue<{ date: string }>("dailyAnalytics", {
  connection,
});

cron.schedule("* * * * *", async () => {
  const nowGMT = new Date().toISOString().split("T")[0];

  try {
    await dailyQueue.add(
      "dailyReads",
      { date: nowGMT },
      {
        attempts: 5,
        backoff: 5000,
      },
    );
    console.log("daily reads aggregation pushed to Redis queue");
  } catch (err) {
    console.error("Failed to push daily reads job:", err);
  }
});
