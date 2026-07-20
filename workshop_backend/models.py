from pydantic import BaseModel
from typing import Literal

class SKUConfig(BaseModel):
    sku_id: str
    initial_stock: int
    avg_daily_demand: float
    lead_time_days: int
    safety_stock: int

class Disruption(BaseModel):
    day: int
    sku_id: str
    type: Literal["demand_spike", "supplier_delay"]
    magnitude: float  # e.g. 3.0 = 3x demand, or extra days delay

class SimulationRequest(BaseModel):
    skus: list[SKUConfig]
    days: int
    disruptions: list[Disruption] = []
    strategy: Literal["automated", "naive"] = "automated"