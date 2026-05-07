const express = require('express');

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const cors = require('cors');
const morgan = require('morgan');
const { infer } = require('./openclaw_helper');
const { getFocusScore, startTelegramBot } = require('./telegram_bot');

const app = express();
const PORT = process.env.PORT || 3000;

// Path to our mock database
const dbPath = path.join(__dirname, 'data/database.json');

// Helper to read DB
const readDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Helper to write DB
const writeDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Cognitive Score API
app.get('/api/cognitive-score', (req, res) => {
    res.json(getFocusScore());
});

// Narrative Insight API (AI Powered)
app.get('/api/narrative-insight', async (req, res) => {
    const prompt = `
        You are a productivity coach with a warm, direct tone.
        Today's data: Instagram 4h, VS Code 3h, WhatsApp 2h, Chrome 1.5h
        Write 3 sentences: what the user actually did, what distracted them, and one specific tip.
        Do NOT use bullet points. Sound human, not robotic.
    `.trim();

    try {
        const insight = await infer(prompt);
        res.json({ insight });
    } catch (error) {
        res.json({
            insight: 'You had a mixed focus day: enough deep work to make progress, but too much context switching to feel clean. Pick one recovery block, close the feeds, and protect the next 25 minutes.',
            fallback: true
        });
    }
});

// Mental Snapshot API (AI Powered + Persistent)
app.get('/api/mental-snapshot', async (req, res) => {
    const appHistory = ['VS Code', 'Chrome', 'Notion', 'Slack'];
    const prompt = `
        You are a personal focus assistant.
        The user has been using these apps in the last 5 minutes: ${appHistory.join(", ")}
        Write a 2-sentence summary of what they were working on.
        Be specific and human-sounding.
    `.trim();

    try {
        const snapshot = await infer(prompt);
        
        // Persist to DB
        const db = readDB();
        db.snapshots.unshift({
            timestamp: new Date().toISOString(),
            apps: appHistory,
            summary: snapshot
        });
        // Keep only last 10
        db.snapshots = db.snapshots.slice(0, 10);
        writeDB(db);

        res.json({ snapshot });
    } catch (error) {
        res.json({
            snapshot: 'You seem to be moving between code, browser research, notes, and chat. Choose the next concrete output and give it one uninterrupted block.',
            fallback: true
        });
    }
});

// Telegram Bot Health API
app.get('/api/telegram-status', (req, res) => {
    res.json({
        configured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
        mode: process.env.TELEGRAM_BOT_TOKEN ? 'polling' : 'disabled'
    });
});

// WhatsApp Deadlines API
app.get('/api/whatsapp-deadlines', (req, res) => {
    const db = readDB();
    res.json(db.whatsapp_deadlines);
});

// GitHub Events API
app.get('/api/github-events', (req, res) => {
    const db = readDB();
    res.json(db.github_events);
});

// Telegram Feed API (Mocked but realistic)
app.get('/api/telegram-feed', (req, res) => {
    const db = readDB();
    res.json(db.telegram_feed || [
        { sender: 'User', message: 'What is my focus score?', time: '10m ago' },
        { sender: 'Meridian Bot', message: 'Your current focus score is 78 (GOOD). You spent 45m in VS Code.', time: '9m ago' }
    ]);
});

// Placeholder API for Nudges
app.get('/api/nudges', (req, res) => {
    res.json([
        { id: 1, type: 'warning', icon: '⏱️', title: 'Deep Work Cap', text: 'You have been in VS Code for 90m. Stand up and stretch for 2m to maintain cognitive peak.' },
        { id: 2, type: 'success', icon: '🔋', title: 'Recovery High', text: 'Your cognitive recovery is at 85%. Perfect time for high-effort architectural tasks.' }
    ]);
});

// Android Accessibility Event API
app.post('/api/event', (req, res) => {
    const { app: packageName, timestamp } = req.body;
    console.log(`📱 Android Event: ${packageName} at ${timestamp}`);

    const db = readDB();
    // Record the event for later AI analysis
    db.snapshots.unshift({
        timestamp: new Date().toISOString(),
        apps: [packageName],
        summary: `User opened ${packageName} on Android. Pattern tracking active.`
    });
    // Keep last 20
    db.snapshots = db.snapshots.slice(0, 20);
    writeDB(db);

    res.json({ status: 'received', app: packageName });
});

// Fallback to index.html for any other requests (useful for SPA behavior if added later)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`
    --------------------------------------------------
    🚀 MERIDIAN COGNITIVE OS SERVER RUNNING
    📡 Port: ${PORT}
    🌐 Local: http://localhost:${PORT}
    --------------------------------------------------
    `);
});

startTelegramBot({ readDB, writeDB, infer });
