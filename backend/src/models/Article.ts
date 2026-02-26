import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db.js";

interface ArticleAttributes {
  id: string;
  title: string;
  content: string;
  category: string;
  status: "Draft" | "Published";
  authorId: string;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ArticleCreationAttributes extends Optional<
  ArticleAttributes,
  "id" | "status" | "deletedAt"
> {}

class Article
  extends Model<ArticleAttributes, ArticleCreationAttributes>
  implements ArticleAttributes
{
  public id!: string;
  public title!: string;
  public content!: string;
  public category!: string;
  public status!: "Draft" | "Published";
  public authorId!: string;
  public deletedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Article.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 150],
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [50, 2000],
      },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Draft", "Published"),
      allowNull: false,
      defaultValue: "Draft",
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: "article",
    timestamps: true,
  },
);

export default Article;
