import Counter from "../models/Counter.js";

// Company prefix — first 2 letters of "Bimfrox"
const COMPANY_PREFIX = "BM";

// Department → 2-letter code mapping
const DEPARTMENT_CODES = {
  "Engineering": "EN",
  "Design": "DE",
  "Marketing": "MK",
  "Human Resources": "HR",
  "Product": "PR",
  "Sales": "SL"
};

/**
 * Generates a custom Employee ID in the format: BM25EN0001
 *   - BM   = Company prefix (Bimfrox)
 *   - 25   = Last 2 digits of joining year
 *   - EN   = Department code
 *   - 0001 = Auto-incremented sequence number (zero-padded to 4 digits)
 *
 * @param {string} department - Department name (e.g. "Engineering")
 * @param {string|Date} joinDate - The employee's join date
 * @returns {Promise<string>} The generated employee ID
 */
export async function generateEmployeeId(department, joinDate) {
  // Get the last 2 digits of the joining year
  const date = new Date(joinDate);
  const yearCode = String(date.getFullYear()).slice(-2);

  // Get department code (fallback to first 2 letters uppercase if not mapped)
  const deptCode = DEPARTMENT_CODES[department] || department.slice(0, 2).toUpperCase();

  // Atomically increment and get the next sequence number
  const counter = await Counter.findOneAndUpdate(
    { name: "employeeId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // Zero-pad the sequence number to 4 digits
  const seqNumber = String(counter.seq).padStart(4, "0");

  return `${COMPANY_PREFIX}${yearCode}${deptCode}${seqNumber}`;
}

export { DEPARTMENT_CODES };
