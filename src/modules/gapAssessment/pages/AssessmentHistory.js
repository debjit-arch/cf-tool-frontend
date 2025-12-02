import React, { useEffect, useState } from "react";
import gapService from "../services/gapService";
import { useHistory } from "react-router-dom";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { History as HistoryIcon } from "lucide-react";

const AssessmentHistory = () => {
  const [gaps, setGaps] = useState([]);
  const history = useHistory();

  /** Fetch gaps */
  useEffect(() => {
    const fetchGaps = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const data = await gapService.getGaps();

        // 🔥 Filter only gaps belonging to the logged in user's org
        const filtered = data.filter(
          (g) => g.organization === user.organization
        );

        setGaps(filtered || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGaps();
  }, []);

  /** Group gaps by clause */

  const grouped = gaps.reduce((acc, g) => {
    if (!acc[g.clause]) acc[g.clause] = [];
    acc[g.clause].push(g);
    return acc;
  }, {});

  /** Radar chart data: percentage per clause */
  // Radar chart data
  const extractClauseNumber = (clause) => clause.split(" ")[0];

  const radarData = Object.keys(grouped).map((clause) => {
    const arr = grouped[clause];
    const answered = arr.filter(
      (q) => q.docScore !== "" || q.practiceScore !== ""
    );
    const total = answered.reduce(
      (sum, x) => sum + Number(x.totalScore || 0),
      0
    );
    const maxTotal = answered.length * 4;
    const compliance = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

    return {
      clause: extractClauseNumber(clause), // <-- FIXED
      compliance,
      fullMark: 100,
    };
  });

  return (
    <div style={container}>
      {/* Back button */}
      <button style={backBtn} onClick={() => history.push("/gap-assessment")}>
        ← Back to Dashboard{" "}
      </button>
      {/* Header */}
      <div style={headerBox}>
        <h1 style={headerTitle}>
          <HistoryIcon size={22} /> Assessment Result
        </h1>
        <p style={subText}>
          View previously reviewed documents and their final statuses.
        </p>
      </div>
      {/* Radar Chart */}
      {radarData.length > 0 && (
        <div style={chartContainer}>
          <h3 style={{ textAlign: "center", marginBottom: 10 }}>
            Compliance Overview (Per Clause)
          </h3>

          <RadarChart
            cx={390}
            cy={210}
            outerRadius={150}
            width={600}
            height={450}
            data={radarData}
          >
            {/* Spider-web style grid */}
            <PolarGrid
              gridType="polygon"
              radialLines={true}
              stroke="#555" // darker grid lines
              strokeWidth={1.2}
            />

            {/* Clause labels */}
            <PolarAngleAxis
              dataKey="clause"
              tick={{ fontSize: 12, fill: "#333" }}
            />

            {/* Circular levels / rings */}
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tickCount={6} // creates spider-web rings
              axisLine={false} // cleaner style
              tick={{
                fill: "#222", // darker label text
                fontSize: 7,
                fontWeight: "bold",
              }}
              stroke="#444"
            />

            {/* Actual radar shape */}
            <Radar
              name="Compliance"
              dataKey="compliance"
              stroke="#005FCC"
              fill="#005FCC"
              fillOpacity={0.6}
              dot={true}
            />
          </RadarChart>
        </div>
      )}
      {/* Grouped remarks by clause */}
      <div style={{ marginTop: 30 }}>
        {Object.keys(grouped).map((clause) => (
          <div key={clause} style={clauseBox}>
            <h2 style={clauseTitle}>{clause}</h2>

            {grouped[clause].map((item) => (
              <div key={item._id} style={remarkRow}>
                <p>
                  <strong>Question:</strong> {item.question}
                </p>
                <p>
                  <strong>Doc Remark:</strong> {item.docRemarks || "-"}
                </p>
                <p>
                  <strong>Practice Remark:</strong>{" "}
                  {item.practiceRemarks || "-"}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/* --------------------- Styles ---------------------- */
const container = {
  margin: "60px auto 0",
  padding: 15,
  maxWidth: 900,
};

const backBtn = {
  position: "sticky",
  top: 0,
  margin: "10px",
  padding: "10px 24px",
  borderRadius: 8,
  background: "#005FCC",
  border: "none",
  color: "#fff",
  fontWeight: 500,
  fontSize: 14,
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  zIndex: 999,
};

const headerBox = {
  background: "white",
  borderRadius: 12,
  padding: 20,
  marginBottom: 20,
  boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
  border: "1px solid #e9ecef",
  textAlign: "center",
};

const headerTitle = {
  color: "#2c3e50",
  fontSize: 22,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
};

const subText = { color: "#7f8c8d", fontSize: 14 };

const chartContainer = {
  background: "white",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
  border: "1px solid #e9ecef",
  marginBottom: 30,
};

const clauseBox = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
  border: "1px solid #e9ecef",
  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
};

const clauseTitle = {
  fontSize: 18,
  fontWeight: 700,
  marginBottom: 10,
};

const remarkRow = {
  padding: "10px 0",
  borderBottom: "1px solid #f0f0f0",
};

export default AssessmentHistory;
