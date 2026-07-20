from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import SimulationRequest
from simulation import run_simulation

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/simulate")
def simulate(req: SimulationRequest):
    return run_simulation(req)