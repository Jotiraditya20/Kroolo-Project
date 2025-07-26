const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const Epic = require('../models/Epic');
const multer = require('multer');
const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Middleware to check API key
const checkApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }
    next();
};

// Create project and generate epics
router.post('/', checkApiKey, upload.single('requirementDoc'), async (req, res) => {
    try {
        const projectData = {
            projectName: req.body.projectName,
            description: req.body.description,
            category: req.body.category,
            priority: req.body.priority,
            duration: req.body.duration,
            requirements: req.body.requirements,
            requirementDoc: req.file ? req.file.buffer.toString() : null
        };

        // Generate epics using Gemini
        const generatedEpics = await geminiService.generateEpics(projectData);

        // Save epics to database
        const savedEpics = await Epic.insertMany(generatedEpics);

        res.status(201).json({
            message: 'Project created and epics generated successfully',
            epics: savedEpics
        });
    } catch (error) {
        console.error('Error in project creation:', error);
        res.status(500).json({ 
            error: 'Failed to create project and generate epics',
            details: error.message
        });
    }
});

// Regenerate epics for existing project
router.post('/:projectId/regenerate-epics', checkApiKey, async (req, res) => {
    try {
        const projectData = {
            ...req.body,
            projectId: req.params.projectId
        };

        // Generate new epics
        const generatedEpics = await geminiService.generateEpics(projectData);

        // Delete existing epics for this project
        await Epic.deleteMany({ project_id: req.params.projectId });

        // Save new epics
        const savedEpics = await Epic.insertMany(generatedEpics);

        res.json({
            message: 'Epics regenerated successfully',
            epics: savedEpics
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to regenerate epics',
            details: error.message
        });
    }
});

module.exports = router;
