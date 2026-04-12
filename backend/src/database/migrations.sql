CREATE TABLE users (
id SERIAL PRIMARY KEY,
username TEXT,
email TEXT,
password_hash TEXT,
created_at TIMESTAMP
);

CREATE TABLE tasks (
id SERIAL PRIMARY KEY,
user_id INTEGER NOT NULL,
title TEXT,
color TEXT,
created_at TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE sessions (
id SERIAL PRIMARY KEY,
user_id INTEGER NOT NULL,
task_id INTEGER NOT NULL,
duration INTEGER,
type TEXT,
completed BOOL,
started_at TIMESTAMP,
ended_at TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (task_id) REFERENCES tasks(id)
)