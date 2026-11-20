import os
import json
import urllib.request
import urllib.error
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
OPENROUTER_API_KEY = (os.getenv("OPENROUTER_API_KEY") or "").strip()

app = FastAPI(title="AI Smart Agriculture Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VisionRequest(BaseModel):
    image_base64: str

@app.get("/")
@app.get("/api/health")
@app.get("/api/status")
def status_check():
    return {
        "status": "ok",
        "online": True,
        "mode": "live",
        "api_key_configured": bool(OPENROUTER_API_KEY)
    }

@app.get("/api/sensors/latest")
def sensors_latest():
    return {"moisture": 64, "temperature": 26.5, "humidity": 68, "ph": 6.6}

@app.post("/api/ai/vision-analyze")
def vision_analyze(req: VisionRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY missing on server")

    image_url = req.image_base64 if req.image_base64.startswith("data:") else f"data:image/jpeg;base64,{req.image_base64}"

    prompt = """
    You are an expert agricultural scientist and botanist.
    Analyze the uploaded image. Identify ANY crop, fruit, vegetable, spice, grain, herb, or plant leaf shown—even if it is uncommon.
    If the image does NOT contain any plant, crop, fruit, vegetable, seed, or agricultural produce, set "is_plant_or_food" to false.

    Return ONLY pure JSON (no markdown, no extra text) with these exact keys:
    {
      "is_plant_or_food": true,
      "crop": "Common English Name with Hindi Name (e.g., Dragon Fruit (ड्रैगन फ्रूट))",
      "icon": "Single best matching emoji (e.g., 🐉, 🍅, 🥭, 🌾, 🍓)",
      "category": "Vegetable / Fruit / Cereal Crop / Pulse / Spice / Oilseed / Commercial Crop",
      "categoryBadge": "Emoji + Category · Short botanical type (e.g., 🍎 Fruit · Tropical Climbing Cactus Fruit)",
      "badgeColor": "#10b981",
      "family": "Botanical Family (e.g., Cactaceae (Cactus Family))",
      "botanical": "Scientific Latin name (e.g., Selenicereus undatus)",
      "nature": "1-2 lines describing plant type, growth habit, and edible part",
      "nutrition": "Key vitamins, minerals, antioxidants, or commercial value",
      "climate": "Ideal temperature range · Best soil type · Optimal soil pH",
      "care": "Key irrigation, fertilizer, and cultivation tip",
      "condition": "Healthy [Crop Name] OR exact disease/pest/rot name",
      "severity": "Healthy OR Mild OR Moderate OR Severe",
      "confidence": 95,
      "cause": "Pathogen name, nutrient deficiency, or 'No disease signs detected'",
      "symptoms": "2-3 lines describing visual state of the leaf/fruit/crop in the photo",
      "organic": "Practical organic/bio-fertilizer or natural remedy",
      "chemical": "Recommended fungicide/pesticide with dosage, or 'No chemical spray required'",
      "preventive": "Preventive farming and storage advice"
    }
    """

    priority_models = [
        "google/gemma-4-31b-it:free",
        "google/gemma-4-26b-a4b-it:free",
        "nvidia/nemotron-3.5-super-vl:free",
        "openrouter/free"
    ]

    last_error = "Unknown error"

    for model_name in priority_models:
        try:
            payload = {
                "model": model_name,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    }
                ]
            }

            request = urllib.request.Request(
                "https://openrouter.ai/api/v1/chat/completions",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://yogesh000v.github.io/Ai-smart-Agriculture-Assistant/",
                    "X-Title": "AI Smart Agriculture"
                },
                method="POST"
            )

            with urllib.request.urlopen(request, timeout=35) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                raw_text = result["choices"][0]["message"]["content"].strip()

                start = raw_text.find("{")
                end = raw_text.rfind("}")
                if start != -1 and end != -1:
                    raw_text = raw_text[start:end + 1]

                parsed = json.loads(raw_text)
                print(f"SUCCESS with model: {model_name}")
                return parsed

        except urllib.error.HTTPError as he:
            err_body = he.read().decode("utf-8", errors="ignore")
            last_error = f"HTTP {he.code}: {err_body}"
            print(f"Model {model_name} failed -> {last_error}")
        except Exception as e:
            last_error = str(e)
            print(f"Model {model_name} failed -> {last_error}")

    raise HTTPException(status_code=500, detail=f"All vision models failed: {last_error}")
