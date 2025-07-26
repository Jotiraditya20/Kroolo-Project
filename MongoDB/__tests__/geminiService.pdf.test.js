const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const geminiService = require('../services/geminiService');
require('dotenv').config();

describe('GeminiService Epic Generation with PDF', () => {
    // Function to read PDF content
    async function readPdfContent(pdfPath) {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);
        return data.text;
    }

    test('should generate epics from PDF requirements', async () => {
        try {
            // Read the PDF content
            const pdfPath = 'C:/Users/jotir/OneDrive/Desktop/AWS/project_1/MongoDB/PRD- Sprint automation and DORA.pdf';
            const requirementsText = await readPdfContent(pdfPath);

            // Project data with PDF content
            const projectData = {
                projectName: "Requirements Based Project",
                description: "Project based on PDF requirements document",
                category: "Software Development",
                priority: "High",
                duration: "90",
                requirements: requirementsText
            };

            // Generate epics using Gemini
            const epics = await geminiService.generateEpics(projectData);

            // Validate epics
            expect(Array.isArray(epics)).toBe(true);
            expect(epics.length).toBeGreaterThan(0);

            // Detailed validation of each epic
            epics.forEach((epic, index) => {
                console.log(`\nEpic ${index + 1}:`);
                console.log('Title:', epic.title);
                console.log('Effort:', epic.effort);
                console.log('Objective:', epic.objective);
                console.log('Scope:', epic.scope);
                
                // Structural validation
                expect(epic).toHaveProperty('title');
                expect(epic).toHaveProperty('objective');
                expect(epic).toHaveProperty('scope');
                expect(epic).toHaveProperty('effort');
                expect(['L', 'M', 'S']).toContain(epic.effort);

                // Content validation
                expect(epic.title.length).toBeGreaterThan(5);
                expect(epic.objective.length).toBeGreaterThan(10);
                expect(epic.scope.length).toBeGreaterThan(20);
            });

            // Save the generated epics to a file for review
            const outputPath = path.join(__dirname, '../output/generated_epics.json');
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(
                outputPath,
                JSON.stringify(epics, null, 2),
                'utf8'
            );
            console.log('\nGenerated epics have been saved to:', outputPath);

        } catch (error) {
            console.error('Test error:', error);
            throw error;
        }
    }, 60000); // 60 second timeout for API call and PDF processing
});
