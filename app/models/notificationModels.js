const db = require("../db"); // Adjust according to your actual database module

const notificationModels = {
  async getNotificationsForUser(sesa) {
    try {
      // Fetch history entries for the user with statuses: created, approved, rejected
      const result = await db.query(
        `
        SELECT * FROM history
        WHERE created_by = $1
        AND status IN ('created', 'approved', 'rejected')
        ORDER BY created_at DESC
      `,
        [sesa]
      );

      return result.rows;
    } catch (error) {
      console.error("Error fetching notifications for user:", error);
      throw error;
    }
  },

  async getNotificationsForEngineer(sesa) {
    try {
      // Fetch history entries for the engineer with status: submitted
      const result = await db.query(
        `
        SELECT * FROM history
        WHERE created_by = $1
        AND status = 'submitted'
        ORDER BY created_at DESC
      `,
        [sesa]
      );

      return result.rows;
    } catch (error) {
      console.error("Error fetching notifications for engineer:", error);
      throw error;
    }
  },
};

module.exports = notificationModels;
