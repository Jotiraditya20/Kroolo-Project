const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Epic = require('../models/Epic');
require('dotenv').config();

const API_KEY = process.env.API_KEY;

describe('Epics API', () => {
    beforeAll(async () => {
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('Connected to MongoDB Atlas - kroolo_db database');
            
            // Wait for the connection to be fully established
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Log database name from the connection URL
            const dbName = mongoose.connection.name;
            console.log(`Connected to database: ${dbName}`);
            
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }, 30000); // Increased timeout for Atlas connection

    afterAll(async () => {
        try {
            // Instead of deleting, we'll just mark test data
            await Epic.updateMany(
                { title: { $regex: /^Test:/ } },
                { $set: { status: 'test_completed' } }
            );
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
        } catch (error) {
            console.error('Cleanup error:', error);
            throw error;
        }
    }, 30000); // Increased timeout for cleanup

    beforeEach(async () => {
        // Clean up only test data
        await Epic.deleteMany({ title: { $regex: /^Test:/ } });
    });

    const sampleEpic = {
        user_id: "user123",
        project_id: "project456",
        effort: "L",
        title: "Test: AI-driven sprint planning",  // Added 'Test:' prefix to identify test data
        objective: "Automatically plan sprints using LLMs",
        scope: "Includes epic/user story/task generation based on specs",
        status: "generated"
    };

    describe('POST /api/epics', () => {
        it('should create a new epic', async () => {
            const response = await request(app)
                .post('/api/epics')
                .set('x-api-key', API_KEY)
                .send(sampleEpic);

            expect(response.status).toBe(201);
            expect(response.body.title).toBe(sampleEpic.title);
            expect(response.body.user_id).toBe(sampleEpic.user_id);
        });

        it('should fail without API key', async () => {
            const response = await request(app)
                .post('/api/epics')
                .send(sampleEpic);

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/epics', () => {
        it('should get all epics', async () => {
            await Epic.create(sampleEpic);

            const response = await request(app)
                .get('/api/epics')
                .set('x-api-key', API_KEY);

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0].title).toBe(sampleEpic.title);
        });
    });

    describe('GET /api/epics/:id', () => {
        it('should get epic by ID', async () => {
            const epic = await Epic.create(sampleEpic);

            const response = await request(app)
                .get(`/api/epics/${epic._id}`)
                .set('x-api-key', API_KEY);

            expect(response.status).toBe(200);
            expect(response.body.title).toBe(sampleEpic.title);
        });
    });

    describe('PUT /api/epics/:id', () => {
        it('should update epic by ID', async () => {
            const epic = await Epic.create(sampleEpic);
            const updatedData = { ...sampleEpic, title: "Updated Title" };

            const response = await request(app)
                .put(`/api/epics/${epic._id}`)
                .set('x-api-key', API_KEY)
                .send(updatedData);

            expect(response.status).toBe(200);
            expect(response.body.title).toBe("Updated Title");
        });
    });

    describe('DELETE /api/epics/:id', () => {
        it('should delete epic by ID', async () => {
            const epic = await Epic.create(sampleEpic);

            const response = await request(app)
                .delete(`/api/epics/${epic._id}`)
                .set('x-api-key', API_KEY);

            expect(response.status).toBe(200);
            
            const deletedEpic = await Epic.findById(epic._id);
            expect(deletedEpic).toBeNull();
        });
    });
});
