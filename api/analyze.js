import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "GEMINI_API_KEY not found in Vercel"
            });
        }

        const { resumeText, jobDescription } = req.body;

        if (!resumeText || !jobDescription) {
            return res.status(400).json({
                error: "Resume text and Job Description are required"
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const prompt = `
You are ResumeIQ Nexus, an expert ATS Resume Analyzer.

Analyze the resume against the job description.

Resume:
${resumeText}

Job Description:
${jobDescription}

Provide:

# ATS Score (0-100)

# Resume Summary

# Strengths

# Weaknesses

# Missing Skills

# Improvement Suggestions

# Recommended Career Roles

Format professionally with headings and bullet points.
`;

        const result = await model.generateContent(prompt);

        const analysis = result.response.text();

        return res.status(200).json({
            success: true,
            analysis
        });

    } catch (error) {

        console.error("Gemini Error:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "AI Analysis Failed"
        });
    }
}
