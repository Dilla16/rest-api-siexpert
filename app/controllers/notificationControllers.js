const notificationModels = require("../models/notificationModels");

const notificationController = {
  // Mendapatkan notifikasi user berdasarkan SESA ID
  async getUserNotifications(req, res) {
    const { sesa } = req.params;

    try {
      const notifications = await notificationModels.getAllNotificationsForUser(sesa);
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Error fetching notifications" });
    }
  },

  async markNotificationAsRead(req, res) {
    const { notification_id } = req.params; // Mengambil notification_id dari URL parameter

    try {
      await notificationModels.markAsRead(notification_id);
      res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ error: "Error marking notification as read" });
    }
  },

  // Menambahkan notifikasi baru
  async createNotification(req, res) {
    const { history_id, sesa } = req.body; // Mengambil data dari body request

    try {
      const newNotification = await notificationModels.addNotification(history_id, sesa);
      res.status(201).json(newNotification);
    } catch (error) {
      res.status(500).json({ error: "Error creating notification" });
    }
  },
};

module.exports = notificationController;
