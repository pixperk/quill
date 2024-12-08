
import { GoogleGenerativeAI } from "@google/generative-ai";


export const gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
