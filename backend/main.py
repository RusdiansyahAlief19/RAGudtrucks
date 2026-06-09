from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from rag_engine import RAGEngine
import uvicorn

load_dotenv()

app = FastAPI(title="Astra UD Trucks Fleet Intelligence Platform API")

# Configure CORS so the frontend can interact with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str

# Initialize RAG Engine globally
engine = None

@app.on_event("startup")
def startup_event():
    global engine
    try:
        engine = RAGEngine()
    except Exception as e:
        print(f"WARNING: Gagal memuat RAG Engine saat startup. Apakah dataset sudah di-ingest? Error: {e}")

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    if engine is None:
        return {"error": "Sistem RAG Engine belum siap atau indeks belum di-generate."}
        
    try:
        result = engine.generate_answer(request.query)
        return result
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
