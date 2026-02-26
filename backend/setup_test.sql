DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'news_test') THEN
    CREATE USER news_test WITH ENCRYPTED PASSWORD 'pwd_test';
  END IF;
END $$;

CREATE DATABASE newsdb_test;
GRANT ALL PRIVILEGES ON DATABASE newsdb_test TO news_test;