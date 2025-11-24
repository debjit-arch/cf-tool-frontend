const API_URL = "https://safesphere.duckdns.org/task-service/api/tasks";

class TaskService {
  constructor() {
    this.username = "username"; // backend username
    this.password = "password"; // backend password
  }

  // Helper to generate Basic Auth header
  getAuthHeader() {
    const token = btoa(`${this.username}:${this.password}`);
    return { Authorization: `Basic ${token}` };
  }

  // --- Get all tasks
  async getAllTasks() {
    const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
      credentials: "include", // send credentials with CORS
    });
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  }

  // --- Get all task IDs
  async getAllTaskIds() {
    const tasks = await this.getAllTasks();
    return tasks.map((t) => t.taskId);
  }

  // --- Save (create) task
  async saveTask(taskData) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
      credentials: "include",
      body: JSON.stringify(taskData),
    });
    if (!res.ok) throw new Error("Failed to save task");
    return res.json();
  }

  // --- Update task
  async updateTask(taskId, updatedData) {
    const res = await fetch(`${API_URL}/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
      credentials: "include",
      body: JSON.stringify(updatedData),
    });
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
  }

  // --- Delete task
  async deleteTask(taskId) {
    const res = await fetch(`${API_URL}/${taskId}`, {
      method: "DELETE",
      headers: {
        ...this.getAuthHeader(),
      },
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to delete task");

    // Backend returns text, not JSON
    return res.text();
  }

  // --- Get task by ID
  async getTaskById(taskId) {
    const res = await fetch(`${API_URL}/${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeader(),
      },
      credentials: "include",
    });
    if (!res.ok) throw new Error("Task not found");
    return res.json();
  }
}

export default new TaskService();
