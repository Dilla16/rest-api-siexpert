const db = require("../../database");

const notificationModels = {
  // Mendapatkan semua notifikasi untuk user berdasarkan SESA ID
  async getAllNotificationsForUser(sesa) {
    try {
      const result = await db.query(
        `
        SELECT n.id, n.history_id, n.retur_id, h.status, h.created_at, h.created_by, n.is_read
        FROM notifications n
        JOIN history h ON n.history_id = h.history_id
        WHERE n.sesa = $1
        ORDER BY h.created_at DESC;
        `,
        [sesa]
      );

      // Menambahkan caption berdasarkan status
      const notificationsWithCaptions = result.rows.map((notification) => {
        let caption = "";

        switch (notification.status) {
          case "created":
            caption = "One Return have been created";
            break;
          case "signed":
            caption = `One Return have signed by ${notification.created_by}`;
            break;
          case "submitted":
            caption = "One return has been submitted";
            break;
          case "rejected":
            caption = "One return has been rejected";
            break;
          case "approved":
            caption = "One return has been approved and the return process has been closed";
            break;
          default:
            caption = "Notification update";
            break;
        }

        return {
          ...notification,
          caption,
        };
      });

      // Mengembalikan hasil dengan sesa dan notifications
      return {
        sesa,
        notifications: notificationsWithCaptions,
      };
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

  async addNotification(historyIds, sesaArray, returIds) {
    try {
      // Log input values for debugging
      console.log("Received historyIds:", historyIds);
      console.log("Received sesaArray:", sesaArray);
      console.log("Received returIds:", returIds);
      console.log("Received returIds:", returIds);

      // Ensure inputs are arrays
      if (!Array.isArray(historyIds)) {
        historyIds = [historyIds];
      }
      if (!Array.isArray(sesaArray)) {
        sesaArray = [sesaArray];
      }
      if (!Array.isArray(returIds)) {
        returIds = [returIds];
      }

      // Validate input
      if (historyIds.length === 0 || sesaArray.length === 0 || returIds.length === 0) {
        throw new Error("History IDs, Sesa array, and Retur IDs cannot be empty.");
      }

      // Generate all combinations of historyId, sesa, and returId
      const values = [];
      for (const historyId of historyIds) {
        for (const sesa of sesaArray) {
          for (const returId of returIds) {
            values.push(`('${historyId}', '${sesa}', '${returId}', false)`);
          }
        }
      }

      // Join all values into a single string
      const valuesString = values.join(", ");

      // Insert all notifications in one query
      const query = `
        INSERT INTO notifications (history_id, sesa, retur_id, is_read)
        VALUES ${valuesString}
        RETURNING *;
      `;

      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error adding new notifications:", error);
      throw error;
    }
  },
};

module.exports = notificationModels;
