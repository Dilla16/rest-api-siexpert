const db = require("../../database");

const UserModel = {
  async createUser(sesa, name, email, hashedPassword, role, department) {
    const departmentFormatted = `{${department.map((dep) => `"${dep}"`).join(",")}}`;

    const query = `
      INSERT INTO users (sesa, name, email, password, role, department)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [sesa, name, email, hashedPassword, role, departmentFormatted];

    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getUsers() {
    const query = "SELECT * FROM users";
    const result = await db.query(query);
    return result.rows;
  },

  async deleteUserBySesa(sesa) {
    const query = "DELETE FROM users WHERE sesa = $1";
    const values = [sesa];
    return await db.query(query, values);
  },

  async updateUser(sesa, { name, email, role, department }) {
    const departmentFormatted = department ? `{${department.map((dep) => `"${dep}"`).join(",")}}` : null;

    const query = `
      UPDATE users
      SET 
        name = COALESCE($2, name),
        email = COALESCE($3, email),
        role = COALESCE($4, role),
        department = COALESCE($5, department)
      WHERE sesa = $1
      RETURNING *
    `;
    const values = [sesa, name, email, role, departmentFormatted];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getUserBySesa(sesa) {
    const query = "SELECT * FROM users WHERE sesa = $1";
    const values = [sesa];
    const result = await db.query(query, values);

    const user = result.rows[0];

    // Pastikan department adalah array
    if (user && !Array.isArray(user.department)) {
      user.department = user.department ? [user.department] : [];
    }

    return user;
  },

  async getDepartmentBySesa(sesa) {
    const query = "SELECT department FROM users WHERE sesa = $1";
    const values = [sesa];
    try {
      const result = await db.query(query, values);

      if (!result.rows.length || !result.rows[0].department) {
        throw new Error("User department not found");
      }

      // Check if department is a string or array and handle accordingly
      let department = result.rows[0].department;

      if (typeof department === "string") {
        // Handle string department and convert to array
        department = department.split(",").map((dept) => dept.trim());
      } else if (!Array.isArray(department)) {
        throw new Error("Invalid department format");
      }

      return department;
    } catch (error) {
      console.error("Error in getDepartmentBySesa:", error.message || error);
      throw new Error("Database query failed");
    }
  },
};

module.exports = UserModel;
