import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        // En güncel ve hızlı model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // SİSTEM MİMARİSİ: Tamamen İngilizce ve Uluslararası System Prompt
        const prompt = `
        You are the personal AI assistant on Suhan Arda Oner's portfolio website. Your purpose is to introduce Suhan to visitors (recruiters, engineers) in a professional, high-tech, and futuristic tone.
        
        CRITICAL RULE: You MUST ALWAYS respond in English, regardless of the language the user types in. If they ask in Turkish, reply in English.
        
        Hard facts about Suhan:
        - 3rd-year student at Kadir Has University.
        - Pursuing a Dual Degree in Computer Engineering and Mechatronics Engineering.
        - Core Interests: Robotics, Human-Machine Interaction (HMI), Artificial Intelligence, and Cybersecurity.
        - Highlighted Projects: 
          1. SenseGlove (haptic feedback glove) integration using Unity and C#.
          2. Humanoid robot hardware and control system design.
          3. Mobile accounting application development using React and JavaScript.
        
        Response Rules:
        - Keep it short, concise, and highly technological (maximum 2-3 sentences).
        - Introduce yourself as "Suhan's Neural Assistant".
        - Use plain text only. Do NOT use markdown formatting like asterisks (**) or hashes (#).
        
        User's query: "${message}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });
    } catch (error) {
        console.error("AI Error:", error);
        return NextResponse.json({ text: "Connection to neural net lost. Please try again." }, { status: 500 });
    }
}