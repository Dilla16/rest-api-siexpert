export default function handler(req, res) {
  // Check for authorization
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end("Unauthorized");
  }

  // Your cron job logic here
  res.status(200).end("Hello Cron!");
}
