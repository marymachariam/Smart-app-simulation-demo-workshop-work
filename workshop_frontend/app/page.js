"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styles from "./page.module.css";

const API_URL = "http://localhost:8000/simulate";

const DEFAULT_SKU = {
  sku_id: "SKU-001",
  initial_stock: 100,
  avg_daily_demand: 8,
  lead_time_days: 5,
  safety_stock: 20,
};

function Panel({ ticket, title, children }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.ticket}>{ticket}</span>
        <h2 className={styles.panelTitle}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}

export default function Home() {
  const [sku, setSku] = useState(DEFAULT_SKU);
  const [days, setDays] = useState(60);
  const [disruptions, setDisruptions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [autoLog, setAutoLog] = useState([]);
  const [naiveLog, setNaiveLog] = useState([]);
  const [autoStockouts, setAutoStockouts] = useState(null);
  const [naiveStockouts, setNaiveStockouts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);

  function handleSkuChange(field, value) {
    setSku((prev) => ({ ...prev, [field]: Number(value) }));
  }

  function addDisruption(type) {
    const magnitude = type === "demand_spike" ? 3 : 5;
    setDisruptions((prev) => [
      ...prev,
      { day: currentDay, sku_id: sku.sku_id, type, magnitude },
    ]);
  }

  function clearDisruptions() {
    setDisruptions([]);
  }

  async function runSimulation() {
    setLoading(true);
    try {
      const basePayload = { skus: [sku], days: Number(days), disruptions };

      const [autoRes, naiveRes] = await Promise.all([
        fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...basePayload, strategy: "automated" }),
        }).then((r) => r.json()),
        fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...basePayload, strategy: "naive" }),
        }).then((r) => r.json()),
      ]);

      const autoResult = autoRes[sku.sku_id];
      const naiveResult = naiveRes[sku.sku_id];

      const merged = autoResult.stock_history.map((val, i) => ({
        day: i,
        automated: Math.round(val),
        naive: Math.round(naiveResult.stock_history[i]),
      }));

      setChartData(merged);
      setAutoLog(autoResult.log);
      setNaiveLog(naiveResult.log);
      setAutoStockouts(autoResult.stockout_days);
      setNaiveStockouts(naiveResult.stockout_days);
    } catch (err) {
      console.error(err);
      alert("Could not reach the backend. Is uvicorn running on port 8000?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Warehouse ops · live simulation</p>
        <h1 className={styles.title}>
          Reorder engine automated vs naive
        </h1>
      </div>

      <div className={styles.grid}>
        <Panel ticket="CFG-01" title="Configuration">
          <Field label="SKU ID">
            <input
              className={styles.input}
              value={sku.sku_id}
              onChange={(e) =>
                setSku((p) => ({ ...p, sku_id: e.target.value }))
              }
            />
          </Field>
          <Field label="Initial stock">
            <input
              type="number"
              className={styles.input}
              value={sku.initial_stock}
              onChange={(e) => handleSkuChange("initial_stock", e.target.value)}
            />
          </Field>
          <Field label="Avg daily demand">
            <input
              type="number"
              className={styles.input}
              value={sku.avg_daily_demand}
              onChange={(e) =>
                handleSkuChange("avg_daily_demand", e.target.value)
              }
            />
          </Field>
          <Field label="Lead time (days)">
            <input
              type="number"
              className={styles.input}
              value={sku.lead_time_days}
              onChange={(e) =>
                handleSkuChange("lead_time_days", e.target.value)
              }
            />
          </Field>
          <Field label="Safety stock">
            <input
              type="number"
              className={styles.input}
              value={sku.safety_stock}
              onChange={(e) => handleSkuChange("safety_stock", e.target.value)}
            />
          </Field>
          <Field label={`Simulation length (days)`}>
            <input
              type="number"
              className={styles.input}
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </Field>

          <button
            onClick={runSimulation}
            disabled={loading}
            className={styles.btnPrimary}
          >
            {loading ? "Running…" : "Run simulation"}
          </button>
        </Panel>

        <Panel ticket="DIS-02" title="Inject disruption">
          <Field label={`Disruption day (0–${days})`}>
            <input
              type="number"
              className={styles.input}
              value={currentDay}
              onChange={(e) => setCurrentDay(Number(e.target.value))}
            />
          </Field>

          <button
            onClick={() => addDisruption("demand_spike")}
            className={styles.btnSpike}
          >
            Demand spike ×3
          </button>
          <button
            onClick={() => addDisruption("supplier_delay")}
            className={styles.btnDelay}
          >
            Supplier delay +5d
          </button>
          <button onClick={clearDisruptions} className={styles.btnGhost}>
            Clear disruptions
          </button>

          <p className={styles.queuedLabel}>Queued</p>
          {disruptions.length === 0 && (
            <p className={styles.emptyState}>— none —</p>
          )}
          <ul className={styles.disruptionList}>
            {disruptions.map((d, i) => (
              <li key={i} className={styles.disruptionItem}>
                DAY {String(d.day).padStart(3, "0")} · {d.type} ×{d.magnitude}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel ticket="RES-03" title="Stockout comparison">
          <div className={styles.compareRow}>
            <span className={styles.compareLabel}>Automated</span>
            <span className={styles.compareValueAuto}>
              {autoStockouts === null ? "—" : `${autoStockouts}d`}
            </span>
          </div>
          <div className={styles.compareRow}>
            <span className={styles.compareLabel}>Naive baseline</span>
            <span className={styles.compareValueNaive}>
              {naiveStockouts === null ? "—" : `${naiveStockouts}d`}
            </span>
          </div>
        </Panel>
      </div>

      {chartData.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <Panel ticket="CHT-04" title="Stock level over time">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333b47" />
                <XAxis
                  dataKey="day"
                  stroke="#8b93a1"
                  tick={{ fill: "#8b93a1", fontSize: 12, fontFamily: "monospace" }}
                  label={{
                    value: "Day",
                    position: "insideBottom",
                    offset: -5,
                    fill: "#8b93a1",
                  }}
                />
                <YAxis
                  stroke="#8b93a1"
                  tick={{ fill: "#8b93a1", fontSize: 12, fontFamily: "monospace" }}
                  label={{
                    value: "Stock",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#8b93a1",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1e232b",
                    border: "1px solid #333b47",
                    fontFamily: "monospace",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#eceef1" }}
                />
                <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="automated"
                  stroke="#2fbf8f"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="naive"
                  stroke="#e2543a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      )}

      {(autoLog.length > 0 || naiveLog.length > 0) && (
        <div className={styles.logGrid}>
          <Panel ticket="LOG-05" title="Automated log">
            <ul className={styles.logList}>
              {autoLog.map((line, i) => (
                <li key={i} className={styles.logItem}>
                  {line}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel ticket="LOG-06" title="Naive baseline log">
            <ul className={styles.logList}>
              {naiveLog.map((line, i) => (
                <li key={i} className={styles.logItem}>
                  {line}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}
    </main>
  );
}