const geminiService = require('../services/geminiService');
require('dotenv').config();

// Mock the Gemini API response
jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockImplementation(() => {
                    return {
                        generateContent: jest.fn().mockResolvedValue({
                            response: {
                                text: () => JSON.stringify([
                                    {
                                        effort: "L",
                                        title: "User Authentication System",
                                        objective: "Implement secure user authentication and authorization system",
                                        scope: "Include user registration, login, password recovery, and role-based access control"
                                    },
                                    {
                                        effort: "M",
                                        title: "Product Catalog Management",
                                        objective: "Create comprehensive product management system",
                                        scope: "Product CRUD operations, categorization, search functionality, and inventory tracking"
                                    },
                                    {
                                        effort: "S",
                                        title: "Shopping Cart Implementation",
                                        objective: "Develop shopping cart functionality",
                                        scope: "Add/remove items, quantity adjustment, price calculation, and cart persistence"
                                    }
                                ])
                            }
                        })
                    };
                })
            };
        })
    };
});

describe('GeminiService Epic Generation (Mocked)', () => {
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

    test('should generate valid epics from project data', async () => {
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

        // Log generated epics for review
        console.log('Generated Epics:', JSON.stringify(epics, null, 2));
    });

    test('should construct valid prompt with project data', () => {
        const prompt = geminiService.constructPrompt(sampleProjectData);
        
        // Verify prompt contains all necessary project information
        expect(prompt).toContain(sampleProjectData.projectName);
        expect(prompt).toContain(sampleProjectData.description);
        expect(prompt).toContain('effort');
        expect(prompt).toContain('JSON structure');
        expect(prompt).toContain('L/M/S');
    });

    // Test error handling
    test('should handle invalid project data', async () => {
        const invalidData = {
            projectName: "Invalid Project"
            // Missing required fields
        };

        await expect(geminiService.generateEpics(invalidData))
            .resolves
            .toBeTruthy(); // Should still work with mock
    });
});
