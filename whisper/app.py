from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import tempfile
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading Whisper model...")
model = WhisperModel(
    "base.en",
    device="cpu",
    compute_type="int8"
)
print("Whisper model loaded")

@app.get("/health")
async def health():
    return {"status": "healthy", "model": "base.en"}

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    if not file.content_type.startswith('audio/'):
        raise HTTPException(400, "File must be audio")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        segments, info = model.transcribe(
            tmp_path,
            language="en",
            beam_size=5,
            vad_filter=True
        )
        
        text = " ".join([segment.text for segment in segments]).strip()
        
        return {
            "text": text,
            "language": info.language,
            "duration": info.duration
        }
    finally:
        os.unlink(tmp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)