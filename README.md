# uniqque/pomodoro

A full-stack Pomodoro timer with user authentication, statistics and a global leaderboard.

## Features

- Work / short break / long break cycles with configurable durations
- Customizable settings: pomodoro length, break lengths, pomodoros until long break
- Auto resume, sound and browser notification toggles
- Session tracking saved to database on timer completion
- Statistics dashboard: total, today, weekly time, streak, avg per day, hourly activity chart and yearly heatmap
- Global leaderboard with day / month / all time periods
- Rank system based on focus minutes over the last 30 days (Procrastinator → Legend)
- Timer state preserved when navigating between pages
- PWA support — installable as a desktop or mobile app
- User registration and login with JWT authentication (HTTP-only cookies)
- Rate limiting and security headers

## Tech Stack

**Backend:** Node.js, Express, PostgreSQL, JWT, bcrypt, express-validator, express-rate-limit  
**Frontend:** HTML, JavaScript, Tailwind CSS v4, Chart.js, Font Awesome  
**Infrastructure:** Ubuntu Server, Nginx, PM2, Let's Encrypt SSL, GitHub webhook

## Database

```sql
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
```

## Live

[pomodoro.poliscuks.id.lv](https://pomodoro.poliscuks.id.lv/login.html)
