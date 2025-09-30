# `hometime-access-refresh`

This is a little node script that refreshes the access token for the
[hometime](https://github.com/ndom91/calendar-led-strip) app. It is intended to be run as a cron job.

## ℹ Background Info

This little script is necessary because I haven't gotten the Google OAuth
offline app credentials to not expire after 7 days. So for my
`calendar-led-strip` project, we're using [`gcalcli`](https://github.com/insanum/gcalcli) which requires this
generated `oauth` file which is generated via their `gcalcli --init` command.

So long story short, this script executes that init command, inserts your
clientId and clientSecret and then opens the browser for you to login with your
Google account. After you login, it saves the generated `oauth` file and
optionally copies it to the little server running the `hometime` service and
restarting the appropriate systemd service.

## 📦 Setup

1. Clone the repository and make a copy of the env vars file
```sh
git clone https://github.com/ndom91/hometime-access-refresh && cd hometime-access-refresh
pnpm install
cp .env.example .env.local
```

2. Update the `.env.local` file with your credentials
3. Run `start` npm script or run it as a cron job

## 📝 License

MIT
