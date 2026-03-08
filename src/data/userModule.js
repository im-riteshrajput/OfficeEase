import EmployeeData from "../data/EmployeeData.js";

  export default fetchEmployees = async () => {
    const data = await EmployeeData.getEmployees();
    return data;
  };
  