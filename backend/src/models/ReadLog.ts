import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db.js";

interface ReadLogAttributes {
  id: string;
  articleId: string;
  readerId?: string | null;
  readAt: Date;
}

interface ReadLogCreationAttributes extends Optional<
  ReadLogAttributes,
  "id" | "readerId" | "readAt"
> {}

class ReadLog
  extends Model<ReadLogAttributes, ReadLogCreationAttributes>
  implements ReadLogAttributes
{
  public id!: string;
  public articleId!: string;
  public readerId!: string | null;
  public readAt!: Date;
}

ReadLog.init(
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
    readerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { sequelize, timestamps: false, modelName: "readlog" },
);

export default ReadLog;
