import express from 'express';
import cors from 'cors';
import { readData, writeData } from './utils/fileDB.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Routes
app.get('/giveaways', async (req, res) => {
  const giveaways = await readData('giveaways.json');
  res.json(giveaways);
});

app.post('/giveaways', async (req, res) => {
  const giveaways = await readData('giveaways.json');
  const index = giveaways.findIndex(g => g.id === req.body.id);
  if (index >= 0) {
    giveaways[index] = req.body;
  } else {
    giveaways.push(req.body);
  }
  await writeData('giveaways.json', giveaways);
  res.sendStatus(200);
});

app.delete('/giveaways/:id', async (req, res) => {
  const { id } = req.params;
  const giveaways = await readData('giveaways.json');
  const users = await readData('users.json');
  const referrals = await readData('referrals.json');

  await writeData('giveaways.json', giveaways.filter(g => g.id !== id));
  await writeData('users.json', users.filter(u => u.giveawayId !== id));
  await writeData('referrals.json', referrals.filter(r => r.giveawayId !== id));

  res.sendStatus(200);
});

// Users
app.get('/users', async (req, res) => {
  const users = await readData('users.json');
  res.json(users);
});

app.post('/users', async (req, res) => {
  const users = await readData('users.json');
  const index = users.findIndex(u => u.id === req.body.id);
  if (index >= 0) {
    users[index] = req.body;
  } else {
    users.push(req.body);
  }
  await writeData('users.json', users);
  res.sendStatus(200);
});

// Referrals
app.get('/referrals', async (req, res) => {
  const referrals = await readData('referrals.json');
  res.json(referrals);
});

app.post('/referrals', async (req, res) => {
  const referrals = await readData('referrals.json');
  referrals.push(req.body);
  await writeData('referrals.json', referrals);
  res.sendStatus(200);
});

// Activity Logs
app.get('/activity', async (req, res) => {
  const logs = await readData('activityLogs.json');
  res.json(logs);
});

app.post('/activity', async (req, res) => {
  const logs = await readData('activityLogs.json');
  logs.unshift({ ...req.body, timestamp: new Date().toISOString() });
  if (logs.length > 1000) logs.splice(1000);
  await writeData('activityLogs.json', logs);
  res.sendStatus(200);
});

// Security Events
app.get('/security', async (req, res) => {
  const events = await readData('securityEvents.json');
  res.json(events);
});

app.post('/security', async (req, res) => {
  const events = await readData('securityEvents.json');
  events.unshift({ ...req.body, timestamp: new Date().toISOString() });
  if (events.length > 500) events.splice(500);
  await writeData('securityEvents.json', events);
  res.sendStatus(200);
});

// Rate Limit
app.get('/rate-limit', async (req, res) => {
  const data = await readData('rateLimitData.json');
  res.json(data);
});

app.post('/rate-limit', async (req, res) => {
  await writeData('rateLimitData.json', req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🟢 Server running at http://localhost:${PORT}`);
});
