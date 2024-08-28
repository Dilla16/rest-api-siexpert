const notificationModels = require("../models/returnModels");

const notificationController = {
  async getUserNotifications(req, res) {
    const { sesa } = req.params;
    const { userRole } = req.userData; // Assuming userRole is available from user data

    if (!sesa) {
      return res.status(400).json({ error: "Bad Request", details: "User ID is required" });
    }

    try {
      let notifications = [];

      // Fetch notifications based on userRole
      if (userRole === "User") {
        notifications = await notificationModels.getNotificationsForUser(sesa);
      } else if (userRole === "Engineer") {
        notifications = await notificationModels.getNotificationsForEngineer(sesa);
      } else {
        return res.status(403).json({ error: "Forbidden", details: "Invalid user role" });
      }

      res.status(200).json({ notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  },
};

module.exports = notificationController;
