import { NextResponse } from "next/server";
import { connectDB, getGFS, getBucket } from "@/lib/mongodb";
import Team from "@/models/team";
import { ObjectId } from "mongodb";
import { Readable, pipeline } from "stream";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const uploadImageToGridFS = async (file, gfs) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error("Invalid image type");
  if (file.size > MAX_IMAGE_SIZE) throw new Error("Image exceeds 5MB");

  const buffer = Buffer.from(await file.arrayBuffer());
  const stream = Readable.from(buffer);
  const uploadStream = gfs.openUploadStream(file.name, {
    contentType: file.type,
  });

  await pipelineAsync(stream, uploadStream);
  return uploadStream.id.toString();
};

const deleteOldImage = async (id, bucket) => {
  try {
    if (ObjectId.isValid(id)) {
      await bucket.delete(new ObjectId(id));
    }
  } catch (err) {
    console.warn("⚠️ Failed to delete old image:", err.message);
  }
};

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const gfs = getGFS();
    const bucket = getBucket();
    const { id } = params;

    const formData = await req.formData();
    const team = await Team.findById(id);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // ✅ 1. Update simple fields
    const allowedFields = ["team_name", "manager", "description"];
    allowedFields.forEach((field) => {
      const value = formData.get(field);
      if (value && value.trim() !== "") {
        team[field] = value.trim();
      }
    });

    // ✅ 2. Update players
    const playersRaw = formData.get("players");
    if (playersRaw) {
      let parsedPlayers = [];
      try {
        parsedPlayers = JSON.parse(playersRaw);
      } catch {
        return NextResponse.json({ error: "Invalid players format" }, { status: 400 });
      }

      const existingPlayers = await Team.find({ _id: { $ne: id } })
        .populate("players")
        .then((teams) =>
          teams.flatMap((t) => t.players.map((p) => p.toString()))
        );

      const newPlayers = parsedPlayers.filter((p) => !existingPlayers.includes(p));
      team.players = newPlayers;
    }

    // ✅ 3. Replace team logo (if provided)
    const teamLogoFile = formData.get("team_logo");
    if (teamLogoFile && typeof teamLogoFile === "object" && teamLogoFile.size > 0) {
      // Delete old logo from GridFS
      if (team.team_logo) {
        await deleteOldImage(team.team_logo, bucket);
      }

      // Upload new logo
      const newLogoId = await uploadImageToGridFS(teamLogoFile, gfs);
      team.team_logo = newLogoId;
    }

    // ✅ 4. Save and return updated team
    await team.save();
    const populatedTeam = await team.populate("players");

    return NextResponse.json(populatedTeam, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to update team:", error);
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
  }
}

// Delete a Team (DELETE)
export async function DELETE(req, { params }) {
    await connectDB();
    const { id } = params;

    try {
        const team = await Team.findById(id);
        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        const gfs = getGFS();
        if (gfs && team.team_logo) {
            try {
                await gfs.delete(new ObjectId(team.team_logo));
            } catch (err) {
                console.warn("⚠️ Failed to delete team logo:", err.message);
            }
        }

        await team.deleteOne();
        return NextResponse.json({ message: "Team deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
    }
}