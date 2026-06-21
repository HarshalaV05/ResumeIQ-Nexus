import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const {
            resumeText,
            jobDescription
        } = req.body;

        const model =
            genAI.getGenerativeModel({
                model: "gemini-2.5-flash"
            });

        const prompt = `
You are a professional ATS Resume Analyzer.

Analyze the resume against the job description.

Resume:
${resumeText}

Job Description:
${jobDescription}

Provide:

1. ATS Score (0-100)
2. Resume Summary
3. Strengths
4. Weaknesses
5. Missing Skills
6. Improvement Suggestions
7. Recommended Career Roles

Format the response professionally using headings and bullet points.
`;

        const result =
            await model.generateContent(prompt);

        const response =
            await result.response;

        const text =
            response.text();

        return res.status(200).json({
            analysis: text
        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "AI Analysis Failed"
        });

    }

}