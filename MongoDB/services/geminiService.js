const { GoogleGenAI } = require("@google/genai");

class GeminiService {
    constructor() {
        this.ai = new GoogleGenAI({
            apiKey: process.env.GOOGLE_API_KEY
        });
    }

    async generateEpics(projectData) {
        try {
            const prompt = this.constructPrompt(projectData);
            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: prompt
            });
            const epics = JSON.parse(response.text);
            return this.validateAndFormatEpics(epics);
        } catch (error) {
            console.error('Error generating epics:', error);
            throw error;
        }
    }

    constructPrompt(projectData) {
        return `
        Act as an expert Agile Project Manager and Epic Writer.
        
        Project Context:
        - Name: ${projectData.projectName}
        - Description: ${projectData.description}
        - Category: ${projectData.category}
        - Priority: ${projectData.priority}
        - Duration: ${projectData.duration} days
        - Technical Requirements: ${projectData.requirements}
        
        Task: Generate a set of comprehensive epics for this project following these guidelines:
        
        1. Each epic should:
           - Be focused on a significant feature or capability
           - Have clear, measurable objectives
           - Be sized appropriately (L/M/S based on complexity and effort)
           - Be independent and deliverable on its own
           - Have clear scope boundaries
        
        2. Consider these aspects when generating epics:
           - Core functionality and features
           - User experience and interface needs
           - Technical architecture components
           - Integration requirements
           - Data management needs
           - Infrastructure requirements
        
        For effort sizing:
        - L (Large): Complex features requiring significant development time (2-4 weeks)
        - M (Medium): Moderate complexity features (1-2 weeks)
        - S (Small): Simple, straightforward features (2-5 days)
        
        Format each epic in this exact JSON structure:
        {
          "effort": "L/M/S",
          "title": "Clear, descriptive title of the epic",
          "objective": "What this epic aims to achieve and its value to users/project",
          "scope": "Detailed description of what is included and what is not included"
        }
        
        Return an array of 3-7 epics that collectively cover the entire project scope.
        Ensure each epic is independent yet collectively comprehensive.`;
    }

    validateAndFormatEpics(epics) {
        // Validate each epic has required fields and correct format
        return epics.map(epic => ({
            user_id: 'pending',
            project_id: 'pending',
            effort: epic.effort,
            title: epic.title,
            objective: epic.objective,
            scope: epic.scope,
            status: 'generated'
        }));
    }

    validateEpicQuality(epic) {
        const requirements = [
            // Title requirements
            epic.title?.length >= 5 && epic.title?.length <= 100,
            // Objective requirements
            epic.objective?.length >= 10,
            // Scope requirements
            epic.scope?.length >= 20,
            // Effort validation
            ['L', 'M', 'S'].includes(epic.effort)
        ];

        return requirements.every(Boolean);
    }

    identifyIssues(epic) {
        const issues = [];
        
        if (!epic.title || epic.title.length < 5) {
            issues.push("Title is too short or missing");
        }
        if (!epic.objective || epic.objective.length < 10) {
            issues.push("Objective needs more detail");
        }
        if (!epic.scope || epic.scope.length < 20) {
            issues.push("Scope needs more detail");
        }
        if (!['L', 'M', 'S'].includes(epic.effort)) {
            issues.push("Invalid effort size");
        }

        return issues;
    }
}

module.exports = new GeminiService();
