from models import SimulationRequest
def run_simulation(req: SimulationRequest):
    results = {}
    for sku in req.skus:
        stock = sku.initial_stock
        pending_orders = []  # (arrival_day, quantity)
        demand_today = sku.avg_daily_demand
        log = []
        stock_history = []
        stockout_days = 0

        for day in range(req.days):
            # apply active disruptions
            for d in req.disruptions:
                if d.sku_id == sku.sku_id and d.day == day:
                    if d.type == "demand_spike":
                        demand_today = sku.avg_daily_demand * d.magnitude
                        log.append(f"Day {day}: demand spike x{d.magnitude}")
                    elif d.type == "supplier_delay":
                        pending_orders = [(a + int(d.magnitude), q) for a, q in pending_orders]
                        log.append(f"Day {day}: supplier delay +{int(d.magnitude)}d")

            # receive any arriving orders
            arriving = [q for a, q in pending_orders if a == day]
            stock += sum(arriving)
            pending_orders = [(a, q) for a, q in pending_orders if a != day]

            # consume demand
            stock -= demand_today
            if stock < 0:
                stockout_days += 1
                stock = 0

            # reorder point (dynamic — responds to current demand rate)
            reorder_point = demand_today * sku.lead_time_days + sku.safety_stock

            if req.strategy == "automated":
                trigger = stock <= reorder_point and not pending_orders
            else:  # naive baseline: only reorder once stock hits zero
                trigger = stock <= 0 and not pending_orders

            if trigger:
                order_qty = demand_today * sku.lead_time_days * 2  # simple order-up-to logic
                pending_orders.append((day + sku.lead_time_days, order_qty))
                log.append(f"Day {day}: reorder triggered, qty {order_qty:.0f}")

            stock_history.append(stock)

        results[sku.sku_id] = {
            "stock_history": stock_history,
            "log": log,
            "stockout_days": stockout_days,
        }
    return results