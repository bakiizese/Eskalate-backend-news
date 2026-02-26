Eskalate Backend News

A full-featured backend API for a news platform with author and reader roles, real-time analytics, and JWT authentication, built with Node.js, Express, Sequelize, PostgreSQL, and Redis.

The backend supports:

    User registration and login for authors and readers.

    CRUD operations for news articles by authors.

    Article fetching and reading logs for readers.

    Daily analytics aggregation using BullMQ and Redis.

    Input validation using Joi.

    Password hashing with bcrypt.

    Unit and integration testing with Jest and Supertest.

Features

Author

    Create, update, delete, and fetch articles.

    View dashboard with total views per article.

    Role-based authentication using JWT.

Reader

    Browse and search published articles.

    View articles and record reads for analytics.

    Guest or logged-in readers supported.

Analytics

    Daily article views aggregation using BullMQ and Redis.

    Stores analytics in DailyAnalytics table.

Prerequisites

    Node.js ≥ 20

    npm ≥ 9

    PostgreSQL database

    Redis server

Installation

Clone the repository

git clone https://github.com/bakiizese/eskalate-backend-news.git

cd eskalate-backend-news/backend

Install dependencies

npm install

Create .env file in the root:

PORT=5000
HOST=127.0.0.1
DATABASE_URL=postgres://news:pwd@localhost:5432/newsdb
JWT_SECRET_KEY=your_secret_key
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

Replace values with your database credentials and preferred secret key.

Setup the database

If you have a SQL dump

sudo -i -u postgres
psql
\i 'realpath of setup.sql'

npm run dev

Running the Project

The server will run at http://localhost:5000 by default.

Testing

Tests are written in TypeScript with Jest and Supertest.

Install dev dependencies

npm install --save-dev jest ts-jest @types/jest supertest @types/supertest typescript

uncomment envarionment variables in .env to use test db in test

sudo -i -u postgres
psql
\i 'realpath of setup_test.sql'

Run tests

npm test

Test files are in the tests/ directory.

Setup file: tests/setup.ts handles database synchronization before tests.

Project Structure

backend/
├── src/
│ ├── config/
│ │ └── db.ts # Sequelize config
│ ├── models/ # Sequelize models
│ ├── routes/ # Express routes
│ ├── middleware/ # Auth middleware
│ ├── validation/ # Joi schemas
│ ├── analytics/ # BullMQ workers and cron jobs
│ └── app.ts # Express app entry
│ └── server.ts # Express server
├── tests/ # Jest test files
├── package.json
├── tsconfig.json
└── .env

Technologies

Node.js – Backend runtime

Express.js – HTTP server framework

Sequelize – ORM for PostgreSQL

PostgreSQL – Database

Redis – Queue and analytics storage

BullMQ – Task queue for daily analytics

Joi – Input validation

bcrypt – Password hashing

jsonwebtoken – JWT authentication

Jest + Supertest – Unit & integration testing

TypeScript – Type safety

Notes

Articles marked as deleted are soft-deleted (deletedAt timestamp).

JWT tokens are required for author-protected endpoints.

Daily analytics are pushed to Redis every minute (cron simulation) and processed by BullMQ worker.

Ensure Redis and PostgreSQL are running before starting the server.

License

MIT License
