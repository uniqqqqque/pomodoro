# uniqque/pomodoro

A full-stack Pomodoro timer with user authentication, session statistics, and a global leaderboard.

## Features

- Work / short break / long break cycles with configurable durations
- Customizable settings: pomodoro length, break lengths, pomodoros until long break
- Auto-resume, sound, and browser notification toggles
- Session tracking persisted to database on timer completion
- Statistics dashboard: total, today, weekly focus time, current streak, daily average, hourly activity chart, and yearly heatmap
- Global leaderboard with daily, monthly, and all-time periods
- Rank system based on focus minutes over the last 30 days (Procrastinator → Legend)
- Timer state preserved when navigating between pages
- PWA support — installable as a desktop or mobile app
- JWT authentication with HTTP-only cookies
- Rate limiting on authentication endpoints

## Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Node.js, Express, PostgreSQL, JWT, bcrypt, express-validator, express-rate-limit |
| Frontend | HTML, JavaScript, Tailwind CSS v4, Chart.js, Font Awesome |
| Infrastructure | Ubuntu Server, Nginx, PM2, Let's Encrypt SSL, GitHub webhook |

## Database Schema

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

## Getting Started

```bash
# clone the repository
git clone https://github.com/uniqque/pomodoro.git
cd pomodoro

# install backend dependencies
cd backend && npm install

# copy and fill in environment variables
cp .env.example .env

# install frontend dependencies and build CSS
cd ../frontend && npm install && npm run build
```

Configure `backend/.env`:

```
PORT=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
JWT_SECRET=
```

## Live Demo

[pomodoro.poliscuks.id.lv](https://pomodoro.poliscuks.id.lv/login.html)

## License

This project is licensed under the GNU General Public License v3.0 — see [LICENSE](LICENSE) for details.
