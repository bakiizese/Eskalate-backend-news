import User from "./User.js";
import Article from "./Article.js";
import ReadLog from "./ReadLog.js";
import DailyAnalytics from "./DailyAnalytics.js";

const Association = () => {
  //user-article
  User.hasMany(Article, {
    foreignKey: "authorId",
    as: "articles",
  });

  Article.belongsTo(User, {
    foreignKey: "authorId",
    as: "author",
    onDelete: "SET NULL",
  });

  //article-readlog
  Article.hasMany(ReadLog, {
    foreignKey: "articleId",
    as: "readlogs",
  });

  ReadLog.belongsTo(Article, {
    foreignKey: "articleId",
    as: "article",
    onDelete: "CASCADE",
  });

  //user-readlog
  User.hasMany(ReadLog, {
    foreignKey: "readerId",
    as: "readlogs",
  });

  ReadLog.belongsTo(User, {
    foreignKey: "readerId",
    as: "reader",
    onDelete: "SET NULL",
  });

  //article-dailyAnalytics
  Article.hasMany(DailyAnalytics, {
    foreignKey: "articleId",
    as: "dailyAnalytics",
  });

  DailyAnalytics.belongsTo(Article, {
    foreignKey: "articleId",
    as: "article",
    onDelete: "CASCADE",
  });
};

export default Association;
