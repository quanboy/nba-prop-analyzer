import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import logo from "./assets/giannis-kalshi.png";

const STAT_OPTIONS = [
  { label: "Points", value: "points" },
  { label: "Rebounds", value: "rebounds" },
  { label: "Assists", value: "assists" },
  { label: "3-Pointers Made", value: "three_pointers" },
  { label: "Steals", value: "steals" },
  { label: "Blocks", value: "blocks" },
  { label: "Pts+Reb+Ast", value: "pra" },
  { label: "Pts+Reb", value: "pr" },
  { label: "Pts+Ast", value: "pa" },
];

const LOOKBACK_OPTIONS = [5, 10, 15, 20];

const CustomTooltip = ({ active, payload, line }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const hit = val > line;
    return (
      <div
        style={{
          background: "#0f1117",
          border: `1px solid ${hit ? "#00e5a0" : "#ff4560"}`,
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 13,
          color: "#fff",
        }}
      >
        <div style={{ color: "#aaa", marginBottom: 4 }}>
          {payload[0].payload.opponent}
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: hit ? "#00e5a0" : "#ff4560",
          }}
        >
          {val}
        </div>
        <div style={{ color: "#aaa", fontSize: 11, marginTop: 2 }}>
          Line: {line} — {hit ? "✓ Over" : "✗ Under"}
        </div>
        <div style={{ color: "#aaa", fontSize: 11 }}>
          {payload[0].payload.winlose === "W" ? "✓ Win" : "✗ Loss"}
        </div>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [player, setPlayer] = useState("");
  const [stat, setStat] = useState("points");
  const [line, setLine] = useState("");
  const [lookback, setLookback] = useState(10);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const statLabel = STAT_OPTIONS.find((s) => s.value === stat)?.label || stat;

  async function fetchData() {
    if (!player.trim() || !line) {
      setError("Please fill in player name and line.");
      return;
    }
    setError("");
    setLoading(true);
    setData(null);

    try {
      const res = await fetch(
        `http://localhost:8080/api/props/analyze?player=${encodeURIComponent(player)}&stat=${stat}&line=${line}&lookback=${lookback}`,
      );
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setData({ ...json, line: parseFloat(line) });
      }
    } catch (e) {
      setError(
        "Failed to connect to server. Make sure Spring Boot and Python are running.",
      );
    }
    setLoading(false);
  }

  const overPct = data
    ? Math.round((data.overCount / data.games.length) * 100)
    : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080b10",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0d1520 0%, #111827 100%)",
          borderBottom: "1px solid #1e2d40",
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <img
          src={logo}
          alt="logo"
          style={{
            width: 100,
            height: 100,
            borderRadius: 10,
            objectFit: "cover",
            objectPosition: "top",
          }}
        />
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: "#f0f4ff",
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            Line Tracker
          </div>
          <div
            style={{ fontSize: 11, color: "#4a6080", letterSpacing: "0.1em" }}
          >
            NBA PLAYER PERFORMANCE TRENDS vs THE LINE
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          padding: "28px 32px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 160px 140px auto",
          gap: 12,
          alignItems: "end",
          borderBottom: "1px solid #1a2535",
          background: "#0a0e16",
        }}
      >
        <div>
          <label
            style={{
              fontSize: 10,
              color: "#4a6080",
              letterSpacing: "0.15em",
              display: "block",
              marginBottom: 6,
            }}
          >
            PLAYER
          </label>
          <input
            value={player}
            onChange={(e) => setPlayer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchData()}
            placeholder="e.g. LeBron James"
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "#0f1520",
              border: "1px solid #1e2d40",
              borderRadius: 8,
              padding: "10px 12px",
              color: "#e0eaff",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: 10,
              color: "#4a6080",
              letterSpacing: "0.15em",
              display: "block",
              marginBottom: 6,
            }}
          >
            STAT
          </label>
          <select
            value={stat}
            onChange={(e) => setStat(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "#0f1520",
              border: "1px solid #1e2d40",
              borderRadius: 8,
              padding: "10px 12px",
              color: "#e0eaff",
              fontSize: 14,
              outline: "none",
            }}
          >
            {STAT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              fontSize: 10,
              color: "#4a6080",
              letterSpacing: "0.15em",
              display: "block",
              marginBottom: 6,
            }}
          >
            LINE
          </label>
          <input
            type="number"
            value={line}
            onChange={(e) => setLine(e.target.value)}
            placeholder="e.g. 20.5"
            step="0.5"
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "#0f1520",
              border: "1px solid #1e2d40",
              borderRadius: 8,
              padding: "10px 12px",
              color: "#e0eaff",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: 10,
              color: "#4a6080",
              letterSpacing: "0.15em",
              display: "block",
              marginBottom: 6,
            }}
          >
            LAST N GAMES
          </label>
          <select
            value={lookback}
            onChange={(e) => setLookback(parseInt(e.target.value))}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "#0f1520",
              border: "1px solid #1e2d40",
              borderRadius: 8,
              padding: "10px 12px",
              color: "#e0eaff",
              fontSize: 14,
              outline: "none",
            }}
          >
            {LOOKBACK_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} games
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            background: loading
              ? "#1e2d40"
              : "linear-gradient(135deg, #ff6b35, #ff9f1c)",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "LOADING..." : "ANALYZE"}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "16px 32px",
            color: "#ff4560",
            fontSize: 13,
            background: "#120a0d",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {data && (
        <div style={{ padding: "28px 32px" }}>
          {/* Player Header — ESPN style */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginBottom: 28,
              background: "#0d1520",
              border: "1px solid #1e2d40",
              borderRadius: 16,
              padding: "20px 24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background team color accent */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(135deg, rgba(255,107,53,0.05) 0%, transparent 60%)",
                pointerEvents: "none",
              }}
            />

            {/* Player Photo */}
            <img
              src={data.photoUrl}
              alt={data.playerName}
              onError={(e) => {
                e.target.style.display = "none";
              }}
              style={{
                width: 100,
                height: 75,
                objectFit: "cover",
                objectPosition: "top",
                borderRadius: 10,
                border: "2px solid #1e2d40",
                background: "#0a0e16",
                flexShrink: 0,
              }}
            />

            {/* Player Info */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#f0f4ff",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    letterSpacing: "0.02em",
                  }}
                >
                  {data.playerName}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#ff6b35",
                    background: "rgba(255,107,53,0.1)",
                    border: "1px solid rgba(255,107,53,0.3)",
                    borderRadius: 6,
                    padding: "2px 8px",
                    letterSpacing: "0.1em",
                  }}
                >
                  {data.team}
                </span>
              </div>

              {/* Player details row */}
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  fontSize: 12,
                  color: "#4a6080",
                  marginBottom: 8,
                  flexWrap: "wrap",
                }}
              >
                {data.jersey && (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span style={{ color: "#2a4060" }}>#</span>
                    <span style={{ color: "#6a80a0" }}>{data.jersey}</span>
                  </span>
                )}
                {data.position && (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span style={{ color: "#2a4060" }}>POS</span>
                    <span style={{ color: "#6a80a0" }}>{data.position}</span>
                  </span>
                )}
                {data.teamName && (
                  <span style={{ color: "#6a80a0" }}>{data.teamName}</span>
                )}
              </div>

              {/* Stat context */}
              <div style={{ fontSize: 12, color: "#4a6080" }}>
                {statLabel.toUpperCase()} — Last {data.games.length} games —
                Line:{" "}
                <span style={{ color: "#f7c59f", fontWeight: 700 }}>
                  {data.line}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {[
              {
                label: "OVER",
                value: data.overCount,
                sub: `of ${data.games.length} games`,
                color: "#00e5a0",
              },
              {
                label: "UNDER",
                value: data.underCount,
                sub: `of ${data.games.length} games`,
                color: "#ff4560",
              },
              {
                label: "HIT RATE",
                value: `${overPct}%`,
                sub: "over line",
                color:
                  overPct >= 60
                    ? "#00e5a0"
                    : overPct >= 40
                      ? "#f7c59f"
                      : "#ff4560",
              },
              {
                label: `L${data.games.length} AVG`,
                value: data.lastNAvg,
                sub: `vs line ${data.line}`,
                color: data.lastNAvg > data.line ? "#00e5a0" : "#ff4560",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "#0d1520",
                  border: "1px solid #1e2d40",
                  borderRadius: 12,
                  padding: "16px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#4a6080",
                    letterSpacing: "0.15em",
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{ fontSize: 28, fontWeight: 700, color: item.color }}
                >
                  {item.value}
                </div>
                <div style={{ fontSize: 11, color: "#4a6080", marginTop: 2 }}>
                  {item.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div
            style={{
              background: "#0d1520",
              border: "1px solid #1e2d40",
              borderRadius: 16,
              padding: "24px 20px 16px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#4a6080",
                letterSpacing: "0.12em",
                marginBottom: 20,
                paddingLeft: 8,
              }}
            >
              GAME LOG — {statLabel.toUpperCase()}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[...data.games].reverse()}
                margin={{ top: 10, right: 80, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1a2535"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={({ x, y, payload, index }) => {
                    const game = [...data.games].reverse()[index];
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={12}
                          textAnchor="middle"
                          fill="#4a6080"
                          fontSize={10}
                        >
                          {game.opponent.split(" ").slice(-2).join(" ")}
                        </text>
                        <text
                          x={0}
                          y={0}
                          dy={24}
                          textAnchor="middle"
                          fill="#2a4060"
                          fontSize={9}
                        >
                          {game.date}
                        </text>
                      </g>
                    );
                  }}
                  height={50}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#4a6080", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[
                    0,
                    (dataMax) => Math.ceil(Math.max(dataMax, data.line) * 1.3),
                  ]}
                />
                <Tooltip
                  content={<CustomTooltip line={data.line} />}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <ReferenceLine
                  y={data.line}
                  stroke="#f7c59f"
                  strokeDasharray="6 3"
                  strokeWidth={2}
                  label={{
                    value: `Line ${data.line}`,
                    position: "right",
                    fill: "#f7c59f",
                    fontSize: 11,
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                  label={{
                    position: "insideTop",
                    fill: "#000",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {[...data.games].reverse().map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.value > data.line ? "#00e5a0" : "#ff4560"}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div
              style={{
                display: "flex",
                gap: 20,
                justifyContent: "center",
                marginTop: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  color: "#4a6080",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: "#00e5a0",
                  }}
                />{" "}
                Over line
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  color: "#4a6080",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: "#ff4560",
                  }}
                />{" "}
                Under line
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  color: "#4a6080",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 2,
                    background: "#f7c59f",
                    borderRadius: 1,
                  }}
                />{" "}
                Prop line
              </div>
            </div>
          </div>
        </div>
      )}

      {!data && !loading && !error && (
        <div
          style={{
            padding: "80px 32px",
            textAlign: "center",
            color: "#1e2d40",
            fontSize: 13,
            letterSpacing: "0.1em",
          }}
        >
          ENTER A PLAYER, STAT, AND LINE TO BEGIN
        </div>
      )}
    </div>
  );
}
