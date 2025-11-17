
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please ensure your API key is configured correctly.");
}

const buildPrompt = (topic: string): string => {
  return `
    You are an expert YouTube SEO strategist and a native Telugu content creator with a deep understanding of Indian viral trends. Your task is to generate a complete YouTube content package based on the user's input.

    USER INPUT: "${topic}"

    Follow these instructions precisely:

    1.  **Analyze Trends**: Fetch the latest trending topics in India related to the user's input (from YouTube, Google Search, news, social media). Choose the single BEST performing topic suitable for a Telugu YouTube audience.
    2.  **Generate Content**: Create the following content based on your chosen topic.
    3.  **Strict Formatting**: YOU MUST return the entire output enclosed in the specified tags. DO NOT add any extra text, explanations, or markdown formatting outside of these tags.

    ---
    
    [TRENDING_TOPIC]
    ### 1. Trending Topic (India)
    -   **Topic:** [The single most viral trending topic right now]
    -   **Reason:** [Explain in one concise line why it is trending]
    [END_TRENDING_TOPIC]

    [YOUTUBE_TITLES]
    ### 2. YouTube Titles (Highly SEO optimized)
    -   [Title 1: 15-60 characters, high-CTR, emotional, curiosity-based, English, 2025 YouTube ranking patterns]
    -   [Title 2: 15-60 characters, high-CTR, emotional, curiosity-based, English, 2025 YouTube ranking patterns]
    -   [Title 3: 15-60 characters, high-CTR, emotional, curiosity-based, English, 2025 YouTube ranking patterns]
    [END_YOUTUBE_TITLES]

    [HASHTAGS]
    ### 3. Hashtags (Copy Ready)
    [Provide 15 hashtags that rank in India for this topic. Mix broad and niche hashtags. Output in a single copy-friendly block like #tag1 #tag2 #tag3]
    [END_HASHTAGS]

    [YOUTUBE_DESCRIPTION]
    ### 4. YouTube Description (SEO Optimized)
    [Write a powerful YouTube description (150-200 words). Include keywords, use short paragraphs, and mix Telugu and English (Telugu 70%, English 30%). Make it highly engaging with a storytelling style.]
    [END_YOUTUBE_DESCRIPTION]

    [TELUGU_SCRIPT]
    ### 5. Telugu Video Script (1-2 Minutes)
    [Generate a natural, human-like Telugu script. Use a conversational tone, very short sentences, and avoid any robotic language.]
    [END_TELUGU_SCRIPT]

    [VIDEO_PROMPT]
    ### 6. Video Generation Prompt
    **VIDEO GENERATION PROMPT:**
    [A cinematic high-quality video about the chosen topic, featuring a realistic human, with relevant visuals, dramatic lighting, Indian context, fast-paced cuts, YouTube-style storytelling...]
    [END_VIDEO_PROMPT]

    [THUMBNAIL_PROMPT]
    ### 7. AI Thumbnail Generation Prompt
    **THUMBNAIL_GENERATION_PROMPT:**
    [Create a highly-detailed, visually striking prompt for an AI image generator. The prompt should describe a YouTube thumbnail for this video. It must be high CTR, use vibrant colors, include clear subjects, and evoke curiosity. **Crucially, all text displayed on the thumbnail MUST be written exclusively in the Telugu language. Do not use any other language for text elements.** Example: "Ultra-realistic 8K photo, a dramatic shot of a new smartphone glowing on a dark, sleek surface, with cinematic lighting highlighting its features, vibrant purple and blue background, hyper-detailed, trending on ArtStation."]
    [END_THUMBNAIL_PROMPT]
    `;
};

export const generateYoutubeContent = async (topic: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  try {
    const prompt = buildPrompt(topic);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    const content = response.text;

    if (!content) {
        throw new Error("Received an empty or invalid response from the AI.");
    }
    
    return content.trim();

  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred while communicating with the AI service.");
  }
};

export const generateThumbnail = async (prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error('No image data found in response.');
    } catch (error) {
        console.error("Error generating thumbnail:", error);
        throw new Error("Failed to generate thumbnail.");
    }
};

export const generateVideo = async (prompt: string, setStatus: (status: string) => void): Promise<string> => {
    setStatus('Checking API key...');
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
        setStatus('Please select your API key to generate video. You can learn about billing at ai.google.dev/gemini-api/docs/billing.');
        await window.aistudio.openSelectKey();
    }
    
    // Create a new instance right before the call to use the latest key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        setStatus('Initializing video generation...');
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        setStatus('Generating video... This can take a few minutes. Please wait.');
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        setStatus('Finalizing video...');
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error('Video generation completed, but no download link was found.');
        }

        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video file. Status: ${videoResponse.statusText}`);
        }
        const videoBlob = await videoResponse.blob();
        setStatus('Video generated successfully!');
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        console.error("Error generating video:", error);
        if (error instanceof Error && error.message.includes('Requested entity was not found')) {
             setStatus('API Key error. Please try selecting your key again.');
             throw new Error('API key not found or invalid. Please re-select your key and try again.');
        }
        setStatus('An error occurred during video generation.');
        throw new Error("Failed to generate video.");
    }
};
