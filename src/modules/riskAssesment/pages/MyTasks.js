import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import taskService from "../services/taskService";

const MyTasks = () => {
  const history = useHistory();
  const rawUser = sessionStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchAssignedTasks = async () => {
      try {
        setLoading(true);
        if (!user) {
          setTasks([]);
          setLoading(false);
          return;
        }

        const allTasks = await taskService.getAllTasks();
        if (!mounted) return;

        const filteredTasks = allTasks.filter(
          (t) => String(t.employee) === String(user._id || user.id)
        );
        setTasks(filteredTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAssignedTasks();
    }
    return () => (mounted = false);
  }, [user]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const [year, month, day] = dateStr.split("T")[0].split("-");
      return `${day}-${month}-${year}`;
    } catch {
      return "—";
    }
  };

  const backBtnStyle = {
    position: "fixed",
    top: "40px",
    right: "120px",
    padding: "10px 20px",
    borderRadius: "6px",
    backgroundColor: "#005FCC",
    border: "none",
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0, 95, 204, 0.3)",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    zIndex: 99,
  };

  const handleBackBtnMouseEnter = (e) => {
    e.target.style.backgroundColor = "#0046a3";
    e.target.style.boxShadow = "0 6px 12px rgba(0, 70, 163, 0.5)";
    e.target.style.transform = "translateY(-2px)";
  };

  const handleBackBtnMouseLeave = (e) => {
    e.target.style.backgroundColor = "#005FCC";
    e.target.style.boxShadow = "0 4px 8px rgba(0, 95, 204, 0.3)";
    e.target.style.transform = "translateY(0)";
  };

  const pageStyle = {
    padding: "30px 20px",
    maxWidth: "1000px",
    margin: "80px auto 0",
    minHeight: "calc(100vh - 80px)",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "30px",
  };

  const titleStyle = {
    color: "#2c3e50",
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
  };

  const subtitleStyle = {
    color: "#7f8c8d",
    fontSize: "16px",
    fontWeight: "400",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    overflow: "hidden",
  };

  const theadStyle = {
    background: "#f4f6f8",
    borderBottom: "2px solid #ddd",
  };

  const thStyle = {
    padding: "12px",
    textAlign: "left",
    fontWeight: "600",
    color: "#2c3e50",
    fontSize: "14px",
    border: "1px solid #ddd",
  };

  const tdStyle = {
    padding: "12px",
    border: "1px solid #ddd",
    color: "#495057",
    fontSize: "14px",
  };

  const emptyStyle = {
    textAlign: "center",
    padding: "40px",
    color: "#7f8c8d",
    fontSize: "16px",
  };

  const statusBadgeStyle = (status) => {
    let bgColor = "#e9ecef";
    let textColor = "#495057";

    if (status === "Pending") {
      bgColor = "#fff3cd";
      textColor = "#856404";
    } else if (status === "Completed (Pending Approval)") {
      bgColor = "#cfe2ff";
      textColor = "#084298";
    } else if (status === "Approved") {
      bgColor = "#d1e7dd";
      textColor = "#0f5132";
    }

    return {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: "20px",
      backgroundColor: bgColor,
      color: textColor,
      fontWeight: "600",
      fontSize: "12px",
    };
  };

  if (!user) {
    return (
      <div style={pageStyle}>
        <div style={emptyStyle}>
          <p>Please log in to view your assigned tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Back to Dashboard Button */}
      <button
        style={backBtnStyle}
        onClick={() => history.push("/risk-assessment")}
        onMouseEnter={handleBackBtnMouseEnter}
        onMouseLeave={handleBackBtnMouseLeave}
      >
        ← Back to Dashboard
      </button>

      <div style={pageStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>✅ My Tasks</h1>
          <p style={subtitleStyle}>View all tasks assigned to you</p>
        </div>

        {/* Tasks Table */}
        {tasks.length === 0 ? (
          <div style={emptyStyle}>No tasks assigned to you yet.</div>
        ) : (
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Start Date</th>
                <th style={thStyle}>End Date</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.taskId}>
                  <td style={tdStyle}>{task.description || "—"}</td>
                  <td style={tdStyle}>
                    {task.startDate ? new Date(task.startDate).toLocaleDateString() : "—"}
                  </td>
                  <td style={tdStyle}>
                    {task.endDate ? new Date(task.endDate).toLocaleDateString() : "—"}
                  </td>
                  <td style={tdStyle}>
                    <span style={statusBadgeStyle(task.status)}>{task.status || "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default MyTasks;
