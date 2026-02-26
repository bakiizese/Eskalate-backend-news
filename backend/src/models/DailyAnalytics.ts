import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db.js";

interface DailyAnalyticsAttributes {
  id: string;
  articleId: string;
  viewCount: number;
  date: string;
}

interface DailyAnalyticsCreationAttributes extends Optional<
  DailyAnalyticsAttributes,
  "id" | "viewCount"
> {}

class DailyAnalytics
  extends Model<DailyAnalyticsAttributes, DailyAnalyticsCreationAttributes>
  implements DailyAnalyticsAttributes
{
  public id!: string;
  public articleId!: string;
  public viewCount!: number;
  public date!: string;
}

DailyAnalytics.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    articleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "articles",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "dailyAnalytics",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["articleId", "date"] },
      { fields: ["date"] },
    ],
  },
);

export default DailyAnalytics;
