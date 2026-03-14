import { API } from "./api";

class TaskData {

  // GET all tasks (Admin/HR)
  async getAllTasks() {
    try {
      const response = await API.get("/tasks");
      return response.data;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  // GET my tasks (Employee)
  async getMyTasks() {
    try {
      const response = await API.get("/tasks/my-tasks");
      return response.data;
    } catch (error) {
      console.error("Error fetching my tasks:", error);
      throw error;
    }
  }

  // POST create a new task
  async createTask(taskData) {
    try {
      const response = await API.post("/tasks", taskData);
      return response.data;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  // PUT accept a task
  async acceptTask(id) {
    try {
      const response = await API.put(`/tasks/${id}/accept`);
      return response.data;
    } catch (error) {
      console.error("Error accepting task:", error);
      throw error;
    }
  }

  // PUT complete a task
  async completeTask(id) {
    try {
      const response = await API.put(`/tasks/${id}/complete`);
      return response.data;
    } catch (error) {
      console.error("Error completing task:", error);
      throw error;
    }
  }

  // DELETE a task
  async deleteTask(id) {
    try {
      const response = await API.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }
}

export default new TaskData();
