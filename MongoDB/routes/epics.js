const express = require('express');
const router = express.Router();
const Epic = require('../models/Epic');

// Middleware to check API key
const checkApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }
    next();
};

// Create a new epic
router.post('/', checkApiKey, async (req, res) => {
    try {
        const epic = new Epic(req.body);
        await epic.save();
        res.status(201).json(epic);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all epics
router.get('/', checkApiKey, async (req, res) => {
    try {
        const epics = await Epic.find({});
        res.json(epics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get epic by ID
router.get('/:id', checkApiKey, async (req, res) => {
    try {
        const epic = await Epic.findById(req.params.id);
        if (!epic) {
            return res.status(404).json({ error: 'Epic not found' });
        }
        res.json(epic);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update epic by ID
router.put('/:id', checkApiKey, async (req, res) => {
    try {
        const epic = await Epic.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!epic) {
            return res.status(404).json({ error: 'Epic not found' });
        }
        res.json(epic);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete epic by ID
router.delete('/:id', checkApiKey, async (req, res) => {
    try {
        const epic = await Epic.findByIdAndDelete(req.params.id);
        if (!epic) {
            return res.status(404).json({ error: 'Epic not found' });
        }
        res.json({ message: 'Epic deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
