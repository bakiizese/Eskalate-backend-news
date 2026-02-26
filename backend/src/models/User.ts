import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db.js";

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "author" | "reader";
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: "author" | "reader";
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[A-Za-z ]+$/,
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("author", "reader"),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "user",
    timestamps: false,
  },
);

export default User;
