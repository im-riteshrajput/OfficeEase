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

  // 🔹 GET all past members
  async getPastMembers() {
    try {
      const response = await API.get("/employees/past");
      return response.data;
    } catch (error) {
      console.error("Error fetching past members:", error);
      throw error;
    }
  }

  // 🔹 GET a specific past member by ID
  async getPastMemberById(id) {
    try {
      const response = await API.get(`/employees/past/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching past member details:", error);
      throw error;
    }
  }

  // 🔹 DELETE a past member permanently
  async deletePastMember(id, password) {
    return API.delete(`/employees/past/${id}`, { data: { password } });
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

  async deleteEmployee(id, password) {
    return API.delete(`/employees/${id}`, { data: { password } });
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

