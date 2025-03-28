import { connectDB } from "@/lib/mongodb"; // Adjust import path
import FantasyPlayer from "@/models/fantasy/FantasyPlayer";
import axios from "axios";

export async function updateAllPlayersData() {
  try {
    await connectDB();

    // Fetch all player UIDs from the database
    const players = await FantasyPlayer.find({}, "player_uid player_team_id");


    if (!players.length) {
      throw new Error("❌ No players found in the database.");
    }

    const league_id = "125";
    const sports_id = "5";

    // Process each player
    const updatePromises = players.map(async (player) => {
      const { player_uid, player_team_id } = player;

      try {
        // Fetch player data from API
        const { data } = await axios.post(
          "https://fantasy.indiansuperleague.com/fantasy/sl_roster/get_playercard_sl_master_data",
          { league_id, sports_id, player_team_id, player_uid }
        );

        if (!data?.data) {
          throw new Error(`❌ No valid data for Player UID: ${player_uid}`);
        }

        const playerData = data.data;

        // Extract only the fields that change frequently
        const updateQuery = {
          total_points: parseInt(playerData.total_points) || 0,
          player_status: parseInt(playerData.player_status) || 0,
          updated_at: new Date(),
          weekly_scores: (playerData.master_data || []).map((week) => ({
            week: parseInt(week.week) || 0,
            score: parseInt(week.score) || 0,
            season_game_uid: week.season_game_uid || null,
          })),
        };

        // Update only the necessary fields in the database
        await FantasyPlayer.updateOne({ player_uid: playerData.player_uid }, { $set: updateQuery });

        return { success: true, message: `✅ Updated player ${playerData.full_name}` };
      } catch (playerError) {
        console.error(`❌ Error updating Player UID ${player_uid}:`, playerError);
        return { success: false, message: `❌ Failed to update Player UID ${player_uid}` };
      }
    });

    // Execute all updates
    const results = await Promise.allSettled(updatePromises);

    const successfulUpdates = results.filter((r) => r.status === "fulfilled" && r.value.success);
    const failedUpdates = results.filter((r) => r.status === "rejected" || (r.value && !r.value.success));

    return {
      success: true,
      message: `🏆 Players Updated: ${successfulUpdates.length}, Failed: ${failedUpdates.length}`,
      results,
    };
  } catch (error) {
    console.error("❌ Error updating player data:", error);
    return { success: false, message: "Internal Server Error" };
  }
}
