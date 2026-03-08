import {API} from "./api";

class EmployeeData {

  // 🔹 GET all employees
  async getEmployees() {
    try {
      const response = await API.get("/employees");
      return response.data;
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  }

  // 🔹 POST (push) new employee
  async createEmployees(userData) {
    try {
      const response = await API.post("/employees", userData);
      return response.data;
    } catch (error) {
      console.error("Error creating employee:", error);
      throw error;
    }
  }

  async deleteEmployee(id) {
  return API.delete(`/employees/${id}`);
}

async updateEmployee(id, data) {
  try {
    const response = await API.put(`/employees/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
}


}

export default new EmployeeData();

