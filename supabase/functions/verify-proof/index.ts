import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchImageAsBase64(imageUrl: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    console.log("Fetching image from:", imageUrl);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error("Failed to fetch image:", response.status);
      return null;
    }
    
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);
    
    console.log("Image fetched successfully, size:", uint8Array.length, "bytes, type:", contentType);
    return { base64, mimeType: contentType };
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskTitle, taskDescription, taskType, proofText, proofUrl } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the verification prompt
    const systemPrompt = `You are a STRICT and thorough task verification AI for a student accountability app called StudyLock.
Your job is to verify if a student has GENUINELY completed their task based on the proof they provide.

BE EXTREMELY CRITICAL AND SKEPTICAL. Students may try to cheat by submitting unrelated images or vague descriptions.

VERIFICATION RULES:
1. The proof MUST be DIRECTLY RELEVANT to the task - not just tangentially related
2. For assignments/exams: Look for specific subject matter, problem solutions, notes, or study materials that MATCH the task
3. For projects: Look for code, designs, documents, or progress evidence that MATCHES the project description
4. For personal tasks: Still require clear evidence of completion
5. If an image is provided, CAREFULLY analyze what is shown in the image and verify it matches the task

AUTOMATIC REJECTION CASES (BE STRICT):
- Generic or vague descriptions like "I did it" or "completed" or "finished"
- Images that don't clearly show work related to the specific task
- Random screenshots, memes, or unrelated content
- Blurry or unreadable images
- Stock photos or images found online
- Screenshots of just a file name without actual content
- Empty documents or blank pages
- Proof that doesn't match the SPECIFIC task (e.g., math homework proof for an English essay task)

APPROVAL CRITERIA (ALL must be met):
- Specific details that DIRECTLY match the task title and description
- Visual evidence (if image) clearly shows completed work for THIS specific task
- The content is readable and verifiable
- Clear connection between proof and the exact task requirements

EXAMPLES OF WHAT TO REJECT:
- Task: "Complete Math Chapter 5" → Image of random notes → REJECT (not specifically Chapter 5)
- Task: "Write Biology Essay" → Screenshot of Google Docs home → REJECT (doesn't show the essay)
- Task: "Study for Physics Exam" → Picture of a closed textbook → REJECT (doesn't show studying)
- Task: "Finish Coding Project" → Random code screenshot → REJECT (verify it's the actual project)

You must respond with a JSON object containing:
{
  "approved": boolean,
  "confidence": number (0-100, be conservative - only high confidence for clear matches),
  "feedback": string (be specific about why approved/rejected),
  "matchedKeywords": string[] (specific words/topics from proof that match the task),
  "concerns": string[] (list ALL red flags or issues found, even minor ones)
}`;

    // Build message content based on what's provided
    let userContent: any[] = [];
    
    // Add text instruction
    let textMessage = `TASK TO VERIFY:
Title: ${taskTitle}
Description: ${taskDescription || "No description provided"}
Type: ${taskType}

STUDENT'S PROOF SUBMISSION:
${proofText ? `Text Description: ${proofText}` : "No text description provided"}
${proofUrl ? `Image URL provided: Yes` : "No image uploaded"}

`;

    // If there's an image URL, try to fetch and include it
    let imageData = null;
    if (proofUrl) {
      // Check if it's an image URL
      const isImage = proofUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) || 
                      proofUrl.includes('/proofs/') || // Our storage bucket
                      proofUrl.includes('image');
      
      if (isImage) {
        imageData = await fetchImageAsBase64(proofUrl);
      }
    }

    if (imageData) {
      // Use vision model with image
      textMessage += `\nAn image has been provided. CAREFULLY analyze the image content and determine if it shows genuine proof of completing the task "${taskTitle}". Look for specific text, diagrams, code, or work that matches the task requirements. Be VERY skeptical of generic or unrelated images.`;
      
      userContent = [
        { type: "text", text: textMessage },
        {
          type: "image_url",
          image_url: {
            url: `data:${imageData.mimeType};base64,${imageData.base64}`
          }
        }
      ];
    } else if (proofUrl) {
      // URL provided but couldn't fetch image
      textMessage += `\nNote: An image URL was provided but could not be analyzed. Base verification only on text description. If no meaningful text description is provided, REJECT the submission.`;
      userContent = [{ type: "text", text: textMessage }];
    } else {
      // No image, just text
      textMessage += `\nNo image was uploaded. Verify based ONLY on the text description. Be strict - vague descriptions should be rejected.`;
      userContent = [{ type: "text", text: textMessage }];
    }

    console.log("Verifying proof for task:", taskTitle, "with image:", !!imageData);

    // Use a vision-capable model
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Vision-capable model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.1, // Very low temperature for consistent, strict verification
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI verification temporarily unavailable. Please try again." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    console.log("AI verification response:", content);

    // Parse the JSON response from the AI
    let verificationResult;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        verificationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Default to rejection when parsing fails for safety
      verificationResult = {
        approved: false,
        confidence: 0,
        feedback: "Could not verify submission. Please provide clearer proof with more details.",
        matchedKeywords: [],
        concerns: ["Verification system could not analyze submission properly"],
      };
    }

    // Extra safety: if confidence is below 60%, reject
    if (verificationResult.approved && verificationResult.confidence < 60) {
      verificationResult.approved = false;
      verificationResult.feedback = `Confidence too low (${verificationResult.confidence}%). Please provide clearer proof that specifically shows completion of "${taskTitle}".`;
      verificationResult.concerns.push("Confidence score below threshold");
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...verificationResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Verification failed" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
