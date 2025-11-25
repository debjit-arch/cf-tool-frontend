import React, { useState, useEffect, useCallback, useRef } from "react";
import { useHistory } from "react-router-dom";
import riskService from "../services/riskService";
import { getDepartments } from "../../departments/services/userService";
import {
  BarChart3,
  FileText,
  PlusCircle,
  CheckCircle,
  FolderOpen,
} from "lucide-react";

const RiskAssessment = () => {
  const history = useHistory();

  const [user] = useState(() => JSON.parse(sessionStorage.getItem("user")));

  const [tourStep, setTourStep] = useState(0);
  const [tourActive, setTourActive] = useState(true);
  const [spotlightStyle, setSpotlightStyle] = useState({});
  const [tooltipStyle, setTooltipStyle] = useState({});

  const totalRiskRef = useRef(null);
  const sampleRiskRef = useRef(null);
  const quickActionsRef = useRef(null);
  const myRisksRef = useRef(null);
  const taskRef = useRef(null);

  const tourSteps = [
    {
      title: "Welcome to Risk Management",
      text: "Let’s take a quick tour of what each tile does.",
      ref: null,
    },
    {
      title: "Risk Statistics",
      text: "These cards show the total, low, medium, high, open, and closed risks.",
      ref: totalRiskRef,
    },
    {
      title: "Sample Risks",
      text: "Choose ready-made risks from the library.",
      ref: sampleRiskRef,
    },
    {
      title: "Add New Risks",
      text: "Shortcuts to add new risks and assign or manage Tasks.",
      ref: quickActionsRef,
    },
    {
      title: "My Tasks",
      text: "View the Tasks assigned to you.",
      ref: taskRef,
    },
    {
      title: "My Risks",
      text: "All risks assigned to your department.",
      ref: myRisksRef,
    },
  ];

  const spotlightStyles = `
  .tour-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.65);
    backdrop-filter: none;
    z-index: 9998;
  }

  .tour-spotlight {
    position: absolute;
    background: transparent;
    border: 2px solid #3498db;
    border-radius: 12px;
    box-shadow: 0 0 0 2000px rgba(0,0,0,0.65);
    z-index: 9999;
    transition: all 0.25s ease;
  }

  .tour-tooltip {
    position: absolute;
    background: white;
    padding: 14px 18px;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.25);
    z-index: 10000;
    width: 260px;
    animation: fadeIn 0.25s ease;
  }

  .tour-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
  }

  .tour-btn {
    padding: 8px 14px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
  }

  .btn-next { background: #3498db; color: white; }
  .btn-skip { background: #7f8c8d; color: white; }
  .btn-prev { background: #95a5a6; color: white; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

  // useEffect(() => {
  //   if (!tourActive) return;

  //   const step = tourSteps[tourStep];

  //   setTimeout(() => {
  //     // Step without an element (e.g., Welcome)
  //     if (!step.ref || !step.ref.current) {
  //       setSpotlightStyle({ display: "none" });

  //       setTooltipStyle({
  //         top: "40%",
  //         left: "50%",
  //         transform: "translate(-50%, -50%)",
  //       });

  //       return;
  //     }

  //     const el = step.ref.current.getBoundingClientRect();

  //     setSpotlightStyle({
  //       top: el.top - 10 + "px",
  //       left: el.left - 10 + "px",
  //       width: el.width + 20 + "px",
  //       height: el.height + 20 + "px",
  //       display: "block",
  //     });

  //     setTooltipStyle({
  //       top: el.bottom + 15 + "px",
  //       left: el.left + "px",
  //       transform: "translate(0, 0)",
  //     });

  //     window.scrollTo({ top: el.top - 80, behavior: "smooth" });
  //   }, 50);
  // }, [tourStep, tourActive]);

  useEffect(() => {
    if (!tourActive) return;

    const step = tourSteps[tourStep];
    if (!step.ref || !step.ref.current) {
      setTooltipStyle({
        top: "40%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
      return;
    }

    const el = step.ref.current;

    // Scroll element into view smoothly, center it
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Wait until next animation frame to calculate tooltip position
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      setTooltipStyle({
        top: window.scrollY + rect.bottom + 10 + "px",
        left: rect.left + rect.width / 2 + "px",
        transform: "translateX(-50%)",
      });
    });
  }, [tourStep, tourActive]);

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = spotlightStyles;
    document.head.appendChild(styleTag);
  }, []);

  const [riskStats, setRiskStats] = useState({
    total: 0,
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
    open: 0,
    closed: 0,
  });

  const [departmentName, setDepartmentName] = useState("");

  useEffect(() => {
    if (!user) {
      history.push("/");
    }
  }, [user, history]);

  const calculateRiskLevel = (risk) => {
    const impact = Math.max(
      parseInt(risk.confidentiality) || 0,
      parseInt(risk.integrity) || 0,
      parseInt(risk.availability) || 0
    );
    const probability = parseInt(risk.probability) || 0;
    const riskScore = impact * probability;

    if (riskScore <= 3) return "Low";
    if (riskScore <= 8) return "Medium";
    if (riskScore <= 12) return "High";
    return "Critical";
  };

  const loadRiskStats = useCallback(async () => {
    if (!user) return;

    try {
      const risks = await riskService.getAllRisks();
      if (!Array.isArray(risks)) return;

      console.log("User Department:", user.department?.name);
      console.log(
        "All Risk Departments:",
        risks.map((r) => r.department)
      );

      const departments = await getDepartments();
      const deptName = departments.find(
        (d) => d.id === user.department?.id
      )?.name;
      if (!deptName) return;

      const departmentRisks = risks.filter(
        (risk) =>
          risk.department &&
          user.department?.name &&
          risk.department.trim().toLowerCase() ===
            user.department.name.trim().toLowerCase()
      );

      const stats = departmentRisks.reduce(
        (acc, risk) => {
          acc.total++;
          const level = calculateRiskLevel(risk);
          acc[level.toLowerCase()]++;
          if (risk.status === "Closed") acc.closed++;
          else acc.open++;
          return acc;
        },
        {
          total: 0,
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
          open: 0,
          closed: 0,
        }
      );

      setRiskStats(stats);
      setDepartmentName(deptName);
    } catch (error) {
      console.error("Error loading risk stats:", error);
    }
  }, [user]);

  useEffect(() => {
    loadRiskStats();
  }, [loadRiskStats]);

  if (!user) return null;

  const pageStyle = {
    marginTop: "5px",
    padding: "10px",
    maxWidth: "900px",
    margin: "1px auto 0",
  };

  const headerStyle = {
    background: "white",
    borderRadius: "8px",
    padding: "5px",
    marginBottom: "15px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e9ecef",
    textAlign: "center",
  };

  const statsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px",
    marginBottom: "15px",
  };

  const statCardStyle = {
    background: "white",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    textAlign: "center",
    border: "1px solid #e9ecef",
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  const actionsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  };

  const actionCardStyle = {
    background: "white",
    padding: "14px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    textAlign: "center",
    border: "1px solid #e9ecef",
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ color: "#2c3e50", marginBottom: "5px", fontSize: "22px" }}>
          <BarChart3 size={24} style={{ marginRight: "8px" }} />
          Risk Management Dashboard
        </h1>
        <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
          Identify, Manage, and Treat Risk.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={statsStyle}>
        <div
          ref={totalRiskRef}
          style={{ ...statCardStyle, borderLeft: "3px solid #3498db" }}
          onClick={() => history.push("/risk-assessment/saved")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{ color: "#3498db", margin: "0 0 6px 0", fontSize: "28px" }}
          >
            {riskStats.total}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              margin: 0,
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Total Risks
          </p>
        </div>
        <div
          style={{ ...statCardStyle, borderLeft: "3px solid #27ae60" }}
          onClick={() => history.push("/risk-assessment/saved")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{ color: "#27ae60", margin: "0 0 6px 0", fontSize: "28px" }}
          >
            {riskStats.low}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              margin: 0,
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Low Risk
          </p>
        </div>
        <div
          style={{ ...statCardStyle, borderLeft: "3px solid #f39c12" }}
          onClick={() => history.push("/risk-assessment/saved")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{ color: "#f39c12", margin: "0 0 6px 0", fontSize: "28px" }}
          >
            {riskStats.medium}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              margin: 0,
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Medium Risk
          </p>
        </div>
        <div
          style={{ ...statCardStyle, borderLeft: "3px solid #e74c3c" }}
          onClick={() => history.push("/risk-assessment/saved")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{ color: "#e74c3c", margin: "0 0 6px 0", fontSize: "28px" }}
          >
            {riskStats.high + riskStats.critical}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              margin: 0,
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            High Risk
          </p>
        </div>
        <div
          style={{ ...statCardStyle, borderLeft: "3px solid #e74c3c" }}
          onClick={() => history.push("/risk-assessment/saved")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{ color: "#e74c3c", margin: "0 0 6px 0", fontSize: "28px" }}
          >
            {riskStats.open}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              margin: 0,
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Open Risk
          </p>
        </div>
        <div
          style={{ ...statCardStyle, borderLeft: "3px solid #e74c3c" }}
          onClick={() => history.push("/risk-assessment/saved")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{ color: "#e74c3c", margin: "0 0 6px 0", fontSize: "28px" }}
          >
            {riskStats.closed}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              margin: 0,
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            CLosed Risk
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={actionsStyle}>
        <div
          ref={sampleRiskRef}
          style={actionCardStyle}
          onClick={() => history.push("/risk-assessment/templates")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-3px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <FileText
            size={32}
            style={{ marginBottom: "10px", color: "#3498db" }}
          />
          <h3
            style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#2c3e50" }}
          >
            Sample Risks
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#7f8c8d" }}>
            Choose your Risk from This Repository
          </p>
        </div>

        <div
          ref={quickActionsRef}
          style={{
            ...actionCardStyle,
            background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
            color: "white",
          }}
          onClick={() => history.push("/risk-assessment/add")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-3px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <PlusCircle size={32} style={{ marginBottom: "10px" }} />
          <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>
            Add New Risk
          </h3>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
            Identify a New Risk
          </p>
        </div>

        <div
          style={actionCardStyle}
          onClick={() => history.push("/risk-assessment/my-tasks")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-3px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
          ref={taskRef}
        >
          <CheckCircle
            size={32}
            style={{ marginBottom: "10px", color: "#2ecc71" }}
          />
          <h3
            style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#2c3e50" }}
          >
            My Tasks
          </h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#7f8c8d" }}>
            View Tasks Assigned to You
          </p>
        </div>

        {(user.role === "risk_owner" ||
          user.role === "risk_manager" ||
          user.role === "super_admin") && (
          <div
            ref={myRisksRef}
            style={actionCardStyle}
            onClick={() => history.push("/risk-assessment/saved")}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-3px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <FolderOpen
              size={32}
              style={{ marginBottom: "10px", color: "#2c3e50" }}
            />
            <h3
              style={{
                margin: "0 0 6px 0",
                fontSize: "16px",
                color: "#2c3e50",
              }}
            >
              My Risks
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#7f8c8d" }}>
              View Identified Risk for your Department
            </p>
          </div>
        )}
      </div>
      {tourActive && (
        <>
          <div className="tour-overlay"></div>

          <div className="tour-spotlight" style={spotlightStyle}></div>

          <div className="tour-tooltip" style={tooltipStyle}>
            <h3>{tourSteps[tourStep].title}</h3>
            <p>{tourSteps[tourStep].text}</p>

            <div className="tour-buttons">
              <button
                className="tour-btn btn-prev"
                disabled={tourStep === 0}
                onClick={() => setTourStep((prev) => prev - 1)}
              >
                Previous
              </button>

              <button
                className="tour-btn btn-next"
                onClick={() => {
                  if (tourStep === tourSteps.length - 1) {
                    setTourActive(false);
                  } else {
                    setTourStep((prev) => prev + 1);
                  }
                }}
              >
                {tourStep === tourSteps.length - 1 ? "Finish" : "Next"}
              </button>

              <button
                className="tour-btn btn-skip"
                onClick={() => setTourActive(false)}
              >
                Skip
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RiskAssessment;
