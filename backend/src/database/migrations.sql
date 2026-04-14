CREATE TABLE users (
id SERIAL PRIMARY KEY,
username TEXT UNIQUE NOT NULL,
password_hash TEXT NOT NULL,
created_at TIMESTAMP
);

CREATE TABLE sessions (
id SERIAL PRIMARY KEY,
user_id INTEGER NOT NULL,
duration INTEGER,
type TEXT,
completed BOOL,
started_at TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_filter ON sessions(user_id, type, completed, started_at);