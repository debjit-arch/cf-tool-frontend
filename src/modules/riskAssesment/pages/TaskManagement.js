import React, { useState, useEffect, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import InputField from "../components/inputs/InputField";
import SelectField from "../components/inputs/SelectField";
import TextAreaField from "../components/inputs/TextAreaField";
import taskService from "../services/taskService";
import riskService from "../services/riskService";
import {
  getAllUsers,
  getDepartments,
} from "../../departments/services/userService";

export default function TaskManagement({ riskFormData = {} }) {
  const history = useHistory();
  const location = useLocation();
  const rawUser = sessionStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  const today = new Date().toISOString().split("T")[0];

  const [tasks, setTasks] = useState([]);
  const [risks, setRisks] = useState([]);
  const [riskOptions, setRiskOptions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null); // Track edit mode

  const [formData, setFormData] = useState({
    riskId: riskFormData.riskId || "",
    organization: user.organization,
    department: "",
    employee: "",
    employeeName: "",
    description: "",
    startDate: today,
    endDate: "",
  });

  const STATUS = {
    PENDING: "Pending",
    COMPLETED_PENDING: "Completed (Pending Approval)",
    APPROVED: "Approved",
  };

  // --- Fetch Departments, Users, Risks, Tasks ---
  useEffect(() => {
    let mounted = true;
    getDepartments()
      .then(
        (d) =>
          mounted &&
          setDepartments(
            Array.isArray(d)
              ? d.filter((dept) => dept.organization === user.organization)
              : []
          )
      )
      .catch(console.error);
    return () => (mounted = false);
  }, []);
  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      try {
        const res = await getAllUsers();
        if (!mounted) return;
        setUsers(
          Array.isArray(res)
            ? res.filter((u) => u.organization === user.organization)
            : []
        );
      } catch (err) {
        console.error(err);
        setUsers([]);
      }
    };
    fetchUsers();
    return () => (mounted = false);
  }, []);
  useEffect(() => {
    let mounted = true;
    const fetchRisks = async () => {
      try {
        const risksData = await riskService.getAllRisks();
        const allRisks = Array.isArray(risksData)
          ? risksData.filter((r) => r.organization === user.organization)
          : [];

        if (!mounted) return setRisks(allRisks);
        if (!user) return setRiskOptions([]);
        if (user.role === "risk_manager") {
          setRiskOptions(
            allRisks.map((r) => ({ value: r.riskId, label: r.riskId }))
          );
        } else {
          const deptList = await getDepartments();
          const userDept = (Array.isArray(deptList) ? deptList : []).find(
            (d) => String(d._id) === String(user.department)
          );
          if (!userDept) return setRiskOptions([]);
          const deptRisks = allRisks.filter(
            (r) => r.department === userDept.name
          );
          setRiskOptions(
            deptRisks.map((r) => ({ value: r.riskId, label: r.riskId }))
          );
        }
      } catch (err) {
        console.error(err);
        setRisks([]);
        setRiskOptions([]);
      }
    };
    fetchRisks();
    return () => (mounted = false);
  }, [user]);
  useEffect(() => {
    let mounted = true;
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await taskService.getAllTasks();
        if (!mounted) return;
        setTasks(
          riskFormData.riskId
            ? fetchedTasks.filter(
                (t) =>
                  t.riskId === riskFormData.riskId &&
                  t.organization === user.organization
              )
            : fetchedTasks.filter((t) => t.organization === user.organization)
        );
      } catch (err) {
        console.error(err);
        setTasks([]);
      }
    };
    fetchTasks();
    return () => (mounted = false);
  }, [riskFormData.riskId]);

  // --- Form handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (!name) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "department")
      setFormData((prev) => ({ ...prev, department: value, employee: "" }));
  };
  const handleDeptChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      employee: "",
      employeeName: "",
    }));
  };

  const empOptions = useMemo(() => {
    const dept = departments?.find((d) => d.name === formData.department)?.id;
    return (users || [])
      .filter((u) => u.department && String(u.department) === String(dept))
      .map((u) => ({ value: u._id, label: u.name }));
  }, [users, departments, formData.department]);

  // --- Add / Edit Task ---
  const saveTask = async () => {
    if (
      !formData.riskId ||
      !formData.department ||
      !formData.startDate ||
      !formData.endDate
    ) {
      alert("Please fill all required fields!");
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert("End date cannot be before start date.");
      return;
    }

    const relatedRisk = risks.find((r) => r.riskId === formData.riskId);
    if (
      relatedRisk &&
      (formData.startDate < relatedRisk.startDate ||
        formData.endDate > relatedRisk.endDate)
    ) {
      alert(
        `Task dates must be within the risk period (${relatedRisk.startDate} → ${relatedRisk.endDate})`
      );
      return;
    }

    // let employeeId = formData.employee || "";
    // let employeeName = formData.employeeName || "";
    // if (employeeId && !employeeName) {
    //   console.log(employeeId);
    //   const found = users.find((u) => String(u._id) === String(employeeId));
    //   employeeName = found ? found.name : "";
    // }

    let employeeId = formData.employee || "";
    let employeeName = formData.employeeName || "";

    // Auto-assign to department's risk_owner if no employee selected
    if (!employeeId && formData.department) {
      const deptId = formData.department;
      const dept = departments?.find((d) => d.name === deptId)?.id;
      console.log(dept);
      const deptRiskOwner = users.find(
        (u) => String(u.department) === String(dept) && u.role === "risk_owner"
      );
      console.log(deptRiskOwner);
      if (deptRiskOwner) {
        employeeId = deptRiskOwner.name; // assign ID
        employeeName = deptRiskOwner.name; // assign name
        console.log(
          "Assigned to department risk owner:",
          employeeName,
          employeeId
        );
      }
    } else if (employeeId && !employeeName) {
      console.log(employeeId);
      const found = users.find((u) => String(u._id) === String(employeeId));
      employeeName = found ? found.name : "";
    }

    if (editingTaskId) {
      const updatedTask = {
        ...formData,
        employee: employeeId,
        employeeName,
        taskId: editingTaskId,
      };
      try {
        await taskService.updateTask(editingTaskId, updatedTask);
        setTasks((prev) =>
          prev.map((t) => (t.taskId === editingTaskId ? updatedTask : t))
        );
      } catch (err) {
        console.error(err);
        alert("Failed to update task.");
        return;
      }
    } else {
      const newTaskId = `T-${
        tasks.filter((t) => t.riskId === formData.riskId).length + 1
      }`;
      const newTask = {
        ...formData,
        employee: employeeId,
        employeeName,
        taskId: newTaskId,
        status: STATUS.PENDING,
      };
      try {
        await taskService.saveTask(newTask);
        const allTasks = await taskService.getAllTasks();
        setTasks(
          riskFormData.riskId
            ? allTasks.filter(
                (t) =>
                  t.riskId === riskFormData.riskId &&
                  t.organization === user.organization
              )
            : allTasks.filter((t) => t.organization === user.organization)
        );
      } catch (err) {
        console.error(err);
        alert("Failed to add task.");
        return;
      }
    }

    setFormData({
      riskId: riskFormData.riskId || "",
      department: "",
      employee: "",
      employeeName: "",
      description: "",
      startDate: today,
      endDate: "",
    });
    setIsModalOpen(false);
    setEditingTaskId(null);
  };

  // --- Delete Task ---
  const deleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
      if (activeTaskId === taskId) setActiveTaskId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete task.");
    }
  };

  // --- Mark Complete ---
  const markTaskComplete = async (taskId) => {
    const taskToUpdate = tasks.find((t) => t.taskId === taskId);
    if (!taskToUpdate) return;
    const updatedTask = {
      ...taskToUpdate,
      status: ["risk_manager", "risk_owner"].includes(user?.role)
        ? STATUS.APPROVED
        : STATUS.COMPLETED_PENDING,
    };
    await taskService.updateTask(taskId, updatedTask);
    setTasks((prev) =>
      prev.map((t) => (t.taskId === taskId ? updatedTask : t))
    );
  };

  // --- Edit Handler ---
  const editTask = (task) => {
    setFormData({
      riskId: task.riskId,
      department: task.department,
      employee: task.employee,
      employeeName: task.employeeName,
      description: task.description,
      startDate: task.startDate,
      endDate: task.endDate,
    });
    setEditingTaskId(task.taskId);
    setIsModalOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("T")[0].split("-");
    return `${day}-${month}-${year}`;
  };

  const buttonStyle = {
    minWidth: "50px",
    padding: "4px 8px",
    borderRadius: "5px",
    border: "none",
    fontSize: "13px",
    color: "#fff",
    cursor: "pointer",
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1000px", margin: "auto" }}>
      <h2 style={{ textAlign: "center" }}>Action Plan</h2>
      <p
        style={{
          textAlign: "center",
          color: "#7f8c8d",
          fontSize: "16px",
          marginBottom: "15px",
        }}
      >
        Tasks to treat identified Risks.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "12px",
        }}
      >
        {tasks
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
          .map((task) => {
            const isActive = activeTaskId === task.taskId;
            return (
              <div
                key={task.taskId}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "12px",
                  cursor: "pointer",
                  background: isActive ? "#f0f8ff" : "#fff",
                  boxShadow: isActive
                    ? "0 4px 10px rgba(0,0,0,0.15)"
                    : "0 1px 3px rgba(0,0,0,0.1)",
                  transition: "all 0.3s",
                }}
                onClick={() => setActiveTaskId(isActive ? null : task.taskId)}
              >
                <h4 style={{ margin: 0, fontWeight: "bold" }}>
                  {task.description}
                </h4>
                {isActive && (
                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "14px",
                      lineHeight: "1.4",
                    }}
                  >
                    <p>
                      <strong>Assignee:</strong> {task.employee || "—"}
                    </p>
                    <p>
                      <strong>Start:</strong> {formatDate(task.startDate)}
                    </p>
                    <p>
                      <strong>End:</strong> {formatDate(task.endDate)}
                    </p>
                    <p>
                      <strong>Status:</strong> {task.status}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginTop: "6px",
                      }}
                    >
                      {task.status === STATUS.PENDING &&
                        String(task.employee) === String(user?.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markTaskComplete(task.taskId);
                            }}
                            style={{ ...buttonStyle, background: "#2ecc71" }}
                          >
                            ✅ Mark Complete
                          </button>
                        )}
                      {task.status === STATUS.COMPLETED_PENDING &&
                        ["risk_manager", "risk_owner"].includes(user?.role) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markTaskComplete(task.taskId);
                            }}
                            style={{ ...buttonStyle, background: "#f39c12" }}
                          >
                            ✅ Approve
                          </button>
                        )}
                      {task.status === STATUS.APPROVED && (
                        <span>✅ Approved</span>
                      )}

                      {["risk_owner", "risk_manager"].includes(user?.role) && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              editTask(task);
                            }}
                            style={{ ...buttonStyle, background: "#3498db" }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.taskId);
                            }}
                            style={{ ...buttonStyle, background: "#e74c3c" }}
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {user && ["risk_owner", "risk_manager"].includes(user.role) && (
        <div style={{ marginTop: "20px" }}>
          <button
            style={{
              background: "#3498db",
              color: "#fff",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            onClick={() => setIsModalOpen(true)}
          >
            ➕ Add Task
          </button>
        </div>
      )}

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "10px",
              width: "100%",
              maxWidth: "450px",
              boxSizing: "border-box",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ marginBottom: "15px" }}>
              {editingTaskId ? "Edit Task" : "Add Task"}
            </h3>
            <div style={{ display: "grid", gap: "12px" }}>
              {location.pathname === "/risk-assessment/tasks" && (
                <SelectField
                  label="Related Risk"
                  name="riskId"
                  value={formData.riskId}
                  onChange={handleInputChange}
                  options={riskOptions}
                  placeholder="Select related risk"
                />
              )}
              <SelectField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleDeptChange}
                options={departments.map((d) => ({
                  value: d._id,
                  label: d.name,
                }))}
                placeholder="Select department"
              />
              <SelectField
                label="Assign To"
                name="employee"
                value={formData.employee}
                onChange={handleInputChange}
                options={empOptions}
                placeholder="Select employee"
              />
              <TextAreaField
                label="Task Description / Person"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the mitigation task..."
                rows={2}
              />
              <InputField
                label="Start Date"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={today}
              />
              <InputField
                label="End Date"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate || today}
                max={riskFormData.deadlineDate || undefined}
              />
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  marginTop: "10px",
                }}
              >
                <button
                  style={{
                    padding: "8px 16px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    background: "#ccc",
                  }}
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTaskId(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  style={{
                    padding: "8px 16px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    background: "#3498db",
                    color: "#fff",
                  }}
                  onClick={saveTask}
                >
                  {editingTaskId ? "Update Task" : "Save Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
