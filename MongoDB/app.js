const express = require('express');
const connectDB = require('./config/db');
const epicsRoutes = require('./routes/epics');
const projectsRoutes = require('./routes/projects');
require('dotenv').config();

const app = express();

// Connect to MongoDB with error handling
(async () => {
    try {
        await connectDB();
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
})();

// Middleware
app.use(express.json());

// Routes
app.use('/api/epics', epicsRoutes);
app.use('/api/projects', projectsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
