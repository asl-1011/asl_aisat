import { connectDB } from "@/lib/mongodb";
import Manager from "@/models/fantasy/Manager";
import FantasyPlayer from "@/models/fantasy/FantasyPlayer";

export async function updateAllManagersPoints() {
  try {
    await connectDB();

    // Find all managers
    const managers = await Manager.find({}, "_id players");

    if (!managers.length) {
      throw new Error("❌ No managers found in the database.");
    }

    // Process each manager and calculate points
    const managerPoints = [];

    await Promise.all(
      managers.map(async (manager) => {
        if (!manager.players.length) {
          return;
        }

        // Fetch total points of players in the manager's team
        const players = await FantasyPlayer.find({ _id: { $in: manager.players } }, "total_points");

        if (!players.length) {
          return;
        }

        // Calculate total points
        const totalPoints = players.reduce((sum, player) => sum + player.total_points, 0);

        // Store manager's points for ranking calculation
        managerPoints.push({ _id: manager._id, points: totalPoints });
      })
    );

    if (!managerPoints.length) {
      throw new Error("❌ No valid managers with points.");
    }

    // Sort managers by points in descending order to determine rankings
    managerPoints.sort((a, b) => b.points - a.points);

    // Update manager's points and ranking (manager_rank)
    await Promise.all(
      managerPoints.map(async (manager, index) => {
        await Manager.updateOne(
          { _id: manager._id },
          { $set: { points: manager.points, manager_rank: index + 1 } }
        );
      })
    );

    return {
      success: true,
      message: `🏆 Managers' points and rankings updated successfully!`,
      updatedManagers: managerPoints.length,
    };
  } catch (error) {
    console.error("❌ Error updating manager points and rankings:", error);
    return { success: false, message: "Internal Server Error" };
  }
}
