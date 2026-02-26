import sequelize from "../src/config/db";

beforeAll(async (): Promise<void> => {
  await sequelize.sync({ force: true });
});

afterAll(async (): Promise<void> => {
  await sequelize.close();
});
