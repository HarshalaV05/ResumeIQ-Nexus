import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        // Check API Key
        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY not found");

            return res.status(500).json({
                error: "GEMINI_API_KEY not configured in Vercel"
            });
        }

        const { resumeText, jobDescription } = req.body;

        // Validate Input
        if (!resumeText || !jobDescription) {
            return res.status(400).json({
                error: "Resume text and Job Description are required"
            });
        }

        const genAI = new GoogleGenerativeAI(
            process.env.GEMINI_API_KEY
        );

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const prompt = `
You are an expert ATS Resume Analyzer.

Analyze the following resume against the given job description.

====================
RESUME
====================

${resumeText}

====================
JOB DESCRIPTION
====================

${jobDescription}

Provide:

1. ATS Score (0-100)
2. Resume Summary
3. Strengths
4. Weaknesses
5. Missing Skills
6. Improvement Suggestions
7. Recommended Career Roles

Use clear headings and bullet points.
`;

        const result =
            await model.generateContent(prompt);

        const response =
            await result.response;

        const analysis =
            response.text();

        return res.status(200).json({
            success: true,
            analysis
        });

    }
    catch (error) {

        console.error("Gemini Error:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "AI Analysis Failed"
        });
    }
}
