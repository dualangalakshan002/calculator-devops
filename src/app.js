// Express app
const express = require('express');
const path = require('path');
const {calculate} = require('./calculator.js');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

//Health check endpoint - Docker ,Jenkins, and load balancer call this

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' , version: process.env.APP_VERSION || 'dev'});
});

app.post('/api/calculate', (req, res) => {
    const { operation, a, b } = req.body || {};
    try {
        const result = calculate(a,b,operation);
        res.status(200).json({ result });
    } catch (err) {
        res.status(400).json({error: err.message})
    }
});

module.exports = app