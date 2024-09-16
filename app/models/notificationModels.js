const db = require("../../database");

const notificationModels = {
  // Mendapatkan semua notifikasi untuk user berdasarkan SESA ID
  async getAllNotificationsForUser(sesa) {
    try {
      const result = await db.query(
        `
        SELECT n.id, n.history_id, h.status, h.created_at, h.comment, n.is_read 
        FROM notifications n
        JOIN history h ON n.history_id = h.history_id
        WHERE n.sesa = $1
        ORDER BY h.created_at DESC;
      `,
        [sesa]
      );
      return result.rows;
    } catch (error) {
      console.error("Error fetching notifications for user:", error);
      throw error;
    }
  },

  // Menandai notifikasi sebagai sudah dibaca
  async markAsRead(notification_id) {
    try {
      await db.query(
        `
        UPDATE notifications
        SET is_read = true
        WHERE id = $1;
      `,
        [notification_id]
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  async addNotification(history_id, sesa) {
    try {
      const result = await db.query(
        `
        INSERT INTO notifications (history_id, sesa, is_read)
        VALUES ($1, $2, false)
        RETURNING *;
      `,
        [history_id, sesa]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error adding new notification:", error);
      throw error;
    }
  },
};

module.exports = notificationModels;
