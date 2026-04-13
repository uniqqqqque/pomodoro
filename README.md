# uniqque/pomodoro

A full-stack Pomodoro timer with user authentication and session statistics.

## Features

- Work / short break / long break cycles with configurable durations
- Customizable settings: pomodoro length, break lengths, pomodoros until long break
- Auto resume, sound and browser notification toggles
- Session tracking saved to database
- Statistics dashboard with hourly activity chart and yearly heatmap
- Dark and light theme, persisted across sessions
- User registration and login with JWT authentication

## Tech Stack

**Backend:** Node.js, Express, PostgreSQL, JWT, bcrypt  
**Frontend:** HTML, JavaScript, Tailwind CSS v4, Chart.js, Cal-Heatmap  
**Infrastructure:** Ubuntu Server, Nginx, PM2, Let's Encrypt SSL, GitHub webhook

## Live

[pomodoro.poliscuks.id.lv](https://pomodoro.poliscuks.id.lv/login.html)
