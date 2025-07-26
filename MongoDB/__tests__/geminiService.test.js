const geminiService = require('../services/geminiService');
require('dotenv').config();

describe('GeminiService Epic Generation', () => {
    // Sample project data for testing
    const sampleProjectData = {
        projectName: "E-commerce Platform",
        description: "Build a modern e-commerce platform with advanced features",
        category: "Web Development",
        priority: "High",
        duration: "45",
        requirements: `
            1. User authentication and authorization
            2. Product catalog with search and filtering
            3. Shopping cart and checkout process
            4. Order management system
            5. Payment gateway integration
            6. Admin dashboard for inventory management
            7. User reviews and ratings
            8. Mobile responsive design
        `
    };

    // Test epic generation
    test('should generate valid epics from project data', async () => {
        try {
            const epics = await geminiService.generateEpics(sampleProjectData);
            
            // Basic validations
            expect(Array.isArray(epics)).toBe(true);
            expect(epics.length).toBeGreaterThan(0);
            
            // Validate each epic structure
            epics.forEach(epic => {
                expect(epic).toHaveProperty('title');
                expect(epic).toHaveProperty('objective');
                expect(epic).toHaveProperty('scope');
                expect(epic).toHaveProperty('effort');
                
                // Validate effort values
                expect(['L', 'M', 'S']).toContain(epic.effort);
                
                // Validate content lengths
                expect(epic.title.length).toBeGreaterThan(5);
                expect(epic.objective.length).toBeGreaterThan(10);
                expect(epic.scope.length).toBeGreaterThan(20);
                
                // Validate default fields
                expect(epic.user_id).toBe('pending');
                expect(epic.project_id).toBe('pending');
                expect(epic.status).toBe('generated');
            });

            // Log generated epics for manual review
            console.log('Generated Epics:', JSON.stringify(epics, null, 2));
            
        } catch (error) {
            console.error('Test error:', error);
            throw error;
        }
    }, 30000); // 30s timeout for API call

    // Test with minimal project data
    const minimalProjectData = {
        projectName: "Simple Blog",
        description: "Basic blogging platform",
        category: "Web Development",
        priority: "Medium",
        duration: "15",
        requirements: "Blog post creation, viewing, and comments"
    };

    test('should handle minimal project requirements', async () => {
        const epics = await geminiService.generateEpics(minimalProjectData);
        
        expect(Array.isArray(epics)).toBe(true);
        expect(epics.length).toBeGreaterThan(0);
        
        // Log generated epics for minimal project
        console.log('Minimal Project Epics:', JSON.stringify(epics, null, 2));
    }, 30000);

    // Test error handling
    test('should handle invalid project data', async () => {
        const invalidData = {
            // Missing required fields
            projectName: "Invalid Project"
        };

        await expect(geminiService.generateEpics(invalidData))
            .rejects
            .toBeTruthy();
    });

    // Test prompt construction
    test('should construct valid prompt with project data', () => {
        const prompt = geminiService.constructPrompt(sampleProjectData);
        
        expect(prompt).toContain(sampleProjectData.projectName);
        expect(prompt).toContain(sampleProjectData.description);
        expect(prompt).toContain('effort');
        expect(prompt).toContain('JSON structure');
    });
});
