import os
import logging
import httpx
import json
from typing import Dict, Any, List, Optional

logger = logging.getLogger("backend.sarvam_service")

class SarvamService:
    """
    Service to provide clinical AI assistant features powered by Sarvam AI.
    Features:
    - Summarizing medical OCR data into patient-friendly language.
    - Answering health-related educational questions.
    - Generating follow-up recommendations.
    - Including standard clinical disclaimers.
    """
    def __init__(self):
        self.sarvam_api_key = os.environ.get("SARVAM_API_KEY")
        self.gemini_api_key = os.environ.get("GEMINI_API_KEY")
        
        if not self.sarvam_api_key:
            logger.warning("SARVAM_API_KEY not found in environment. Falling back to Gemini / clinical NLP engine.")

    async def _call_sarvam_chat(self, prompt: str, system_instruction: str) -> Optional[str]:
        """
        Calls the Sarvam AI Chat completions API directly.
        """
        if not self.sarvam_api_key:
            return None
            
        url = "https://api.sarvam.ai/v1/chat/completions"
        headers = {
            "api-subscription-key": self.sarvam_api_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "sarvam-2b-v0.5",
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2
        }
        
        try:
            logger.info("Initiating call to Sarvam AI chat completion API...")
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices", [])
                    if choices:
                        return choices[0].get("message", {}).get("content", "").strip()
                logger.error(f"Sarvam API error (status {res.status_code}): {res.text}")
        except Exception as e:
            logger.error(f"Exception calling Sarvam AI API: {e}", exc_info=True)
            
        return None

    async def _call_gemini_fallback(self, prompt: str, system_instruction: str) -> str:
        """
        Helper fallback to execute clinical AI tasks using Gemini.
        """
        if not self.gemini_api_key:
            logger.warning("Both SARVAM_API_KEY and GEMINI_API_KEY are missing.")
            return "Unable to process request: No AI API keys available."
            
        model = "gemini-3.5-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_api_key}"
        
        full_prompt = f"{system_instruction}\n\nUser request:\n{prompt}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": full_prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2
            }
        }
        
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "aistudio-build"
        }
        
        try:
            logger.info("Executing Gemini clinical assistant fallback call...")
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        content_parts = candidates[0].get("content", {}).get("parts", [])
                        if content_parts:
                            return content_parts[0].get("text", "").strip()
                logger.error(f"Gemini fallback API error (status {res.status_code}): {res.text}")
        except Exception as e:
            logger.error(f"Exception during Gemini fallback call: {e}", exc_info=True)
            
        return "Clinical Assistant service temporarily offline. Please check your network connection or try again."

    async def process_llm_request(self, prompt: str, system_instruction: str) -> str:
        """
        Tries to use Sarvam AI, falls back to Gemini if Sarvam fails or is unconfigured.
        """
        response = await self._call_sarvam_chat(prompt, system_instruction)
        if response:
            return response
            
        # Fallback to Gemini
        return await self._call_gemini_fallback(prompt, system_instruction)

    async def summarize_ocr_report(self, title: str, report_type: str, extracted_text: str) -> Dict[str, Any]:
        """
        Summarizes complex medical report findings/medications into simple,
        friendly, layman explanation + follow-up suggestions + disclaimer.
        """
        system_instruction = """
        You are an expert, compassionate clinical education helper. Your job is to translate complex medical terms, lab biomarkers, or doctor prescriptions into extremely simple, patient-friendly, and non-intimidating layman terms.
        
        Structure your answer as a JSON object containing EXACTLY these fields:
        {
          "summary": "A friendly, cohesive paragraph explanation of what this report is about, translating any complex or scary medical jargon/acronyms.",
          "key_findings": [
             "List of 2-3 key findings, metrics, or medications simplified. Highlight what is normal vs what needs attention, or instructions for medications."
          ],
          "recommendations": [
             "List of 3-4 gentle educational follow-up recommendations (e.g., questions they might ask their physician during their next visit, simple safe lifestyle queries, or vitals to continue logging)."
          ],
          "disclaimer": "DISCLAIMER: This summary is generated by AI for educational purposes only and does NOT constitute professional medical advice, diagnosis, or treatment. Always consult with a licensed physician or healthcare provider before making any clinical decisions."
        }
        
        Do not output any markdown code blocks, explanatory introduction, or trailing text. Return ONLY the JSON object.
        """
        
        prompt = f"""
        Document Title: {title}
        Document Classification: {report_type}
        
        Extracted Verbatim Text / Data:
        {extracted_text}
        """
        
        raw_response = await self.process_llm_request(prompt, system_instruction)
        
        # Parse the JSON response safely
        try:
            # Sanitize in case LLM wrapped with markdown block
            sanitized = raw_response.strip()
            if sanitized.startswith("```json"):
                sanitized = sanitized.replace("```json", "", 1)
            if sanitized.endswith("```"):
                sanitized = sanitized.rsplit("```", 1)[0]
            sanitized = sanitized.strip()
            
            parsed = json.loads(sanitized)
            
            # Ensure disclaimer is included and matches user request
            if "disclaimer" not in parsed or not parsed["disclaimer"]:
                parsed["disclaimer"] = "DISCLAIMER: This summary is generated by AI for educational purposes only and does NOT constitute professional medical advice, diagnosis, or treatment. Always consult with a licensed physician or healthcare provider before making any clinical decisions."
            return parsed
        except Exception as e:
            logger.error(f"Failed to parse structured JSON from medical report summary. Raw response: {raw_response}. Error: {e}")
            
            # Formulate fallback manual structure in case response was plain text
            return {
                "summary": raw_response if raw_response else "We processed your report. It appears to be a medical document of type: " + report_type,
                "key_findings": ["No simplified findings could be parsed automatically."],
                "recommendations": [
                    "Discuss this document with your doctor at your next appointment.",
                    "Log your vitals regularly if advised by your clinical team."
                ],
                "disclaimer": "DISCLAIMER: This summary is generated by AI for educational purposes only and does NOT constitute professional medical advice, diagnosis, or treatment. Always consult with a licensed physician or healthcare provider before making any clinical decisions."
            }

    async def answer_health_question(self, question: str, history: List[Dict[str, str]] = None) -> str:
        """
        Answers a patient's health-related educational question.
        Guarantees disclaimer is always attached.
        """
        system_instruction = """
        You are MediMind Clinical AI Companion, powered by Sarvam AI. Your purpose is to answer the patient's health-related educational questions about symptoms, medications, lab measurements, or heart metrics with absolute clarity, empathy, and simplicity.
        
        IMPORTANT GUIDELINES:
        1. Keep answers compact, educational, easy to understand, and professional.
        2. Do not offer specific diagnoses or definitive prescriptions. Tell them what is common or typical.
        3. You must ALWAYS append a distinct, clear educational disclaimer at the very end of your response.
        
        The disclaimer MUST look exactly like:
        ---
        ⚠️ *DISCLAIMER: This explanation is for educational purposes only and does not substitute for professional medical advice, diagnosis, or treatment. Always consult your physician or a qualified healthcare provider for any questions regarding a medical condition.*
        """
        
        history_str = ""
        if history:
            for h in history[-5:]:  # Include last 5 messages for context
                role = "User" if h.get("sender") == "user" else "Assistant"
                history_str += f"{role}: {h.get('message')}\n"
                
        prompt = f"""
        Conversation History:
        {history_str}
        
        Patient's Question:
        {question}
        """
        
        answer = await self.process_llm_request(prompt, system_instruction)
        
        # Ensure the answer has the disclaimer attached
        disclaimer_indicator = "educational purposes only"
        if disclaimer_indicator not in answer.lower():
            answer += "\n\n---\n⚠️ *DISCLAIMER: This explanation is for educational purposes only and does not substitute for professional medical advice, diagnosis, or treatment. Always consult your physician or a qualified healthcare provider for any questions regarding a medical condition.*"
            
        return answer

sarvam_service = SarvamService()
