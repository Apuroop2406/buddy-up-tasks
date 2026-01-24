import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const systemPrompt = `You are a strict but fair task verification AI for a student accountability app called StudyLock. 
Your job is to verify if a student has genuinely completed their task based on the proof they provide.

VERIFICATION RULES:
1. The proof must be RELEVANT to the task - check if keywords, topics, or content align with the task title and description
2. For assignments/exams: Look for specific subject matter, problem solutions, notes, or study materials
3. For projects: Look for code, designs, documents, or progress evidence
4. For personal tasks: Be slightly more lenient but still require reasonable evidence

AUTOMATIC REJECTION CASES:
- Generic or vague descriptions like "I did it" or "completed"
- Completely unrelated content
- Suspicious or potentially fake submissions
- Empty or minimal effort responses

APPROVAL CRITERIA:
- Specific details that match the task requirements
- Evidence of actual work (screenshots, detailed explanations, file names matching the subject)
- Reasonable effort shown

You must respond with a JSON object containing:
{
  "approved": boolean,
  "confidence": number (0-100),
  "feedback": string (encouraging if approved, constructive if rejected),
  "matchedKeywords": string[] (relevant words found in proof that relate to task),
  "concerns": string[] (any red flags or issues found)
}`;

    const userMessage = `TASK TO VERIFY:
Title: ${taskTitle}
Description: ${taskDescription || "No description provided"}
Type: ${taskType}

STUDENT'S PROOF SUBMISSION:
${proofText ? `Text Description: ${proofText}` : "No text description provided"}
${proofUrl ? `File Uploaded: Yes (URL: ${proofUrl})` : "No file uploaded"}

Analyze this submission and determine if it genuinely shows completion of the specified task. Be thorough but fair.`;

    console.log("Verifying proof for task:", taskTitle);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3, // Lower temperature for more consistent verification
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
      // Fallback: try to determine approval from text
      const isApproved = content.toLowerCase().includes('"approved": true') || 
                         content.toLowerCase().includes('"approved":true');
      verificationResult = {
        approved: isApproved,
        confidence: 50,
        feedback: isApproved 
          ? "Your submission has been verified. Good work!" 
          : "Please provide more specific details about your work.",
        matchedKeywords: [],
        concerns: ["Could not fully analyze submission"],
      };
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
