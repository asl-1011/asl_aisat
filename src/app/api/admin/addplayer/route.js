import { NextResponse } from "next/server";
import { connectDB, getGFS } from "@/lib/mongodb";
import Player from "@/models/Player";
import Team from "@/models/team";
import { ObjectId } from "mongodb";
import { Readable, pipeline } from "stream";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// ✅ Function to Upload Profile Picture to GridFS
const uploadImage = async (image, gfs) => {
    if (!image) return null;
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) throw new Error("Invalid file type");
    if (image.size > MAX_IMAGE_SIZE) throw new Error("File size exceeds 5MB");

    const uploadStream = gfs.openUploadStream(image.name, { contentType: image.type });
    await pipelineAsync(Readable.from(Buffer.from(await image.arrayBuffer())), uploadStream);
    return uploadStream.id.toString();
};

// ✅ [POST] Add New Player to the Team and Update Team's Players
export async function POST(req) {
    try {
        console.log("📥 Received request to add a new player");

        const formData = await req.formData();
        const name = formData.get("name");
        const position = formData.get("position");
        const teamId = formData.get("team");
        const profilePic = formData.get("profilePic");

        // Validate required fields
        if (!name || !position || !teamId) {
            return NextResponse.json({ error: "Invalid or missing data" }, { status: 400 });
        }

        await connectDB();
        const gfs = getGFS();
        if (!gfs) return NextResponse.json({ error: "GridFS initialization failed" }, { status: 500 });

        // Upload profile picture if provided
        const profilePicId = profilePic ? await uploadImage(profilePic, gfs) : null;

        // Create new player
        const newPlayer = await Player.create({
            name,
            position,
            profilePic: profilePicId,  // Store the uploaded profile picture's GridFS ID
            team: new ObjectId(teamId),  // Ensure the team ID is an ObjectId
        });

        // Update the team by adding the new player's ID to the team's players array
        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            { $push: { players: newPlayer._id } },  // Push player ID into the team's players array
            { new: true }
        );

        if (!updatedTeam) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        console.log("✅ Player added successfully and team updated");
        return NextResponse.json({ player: newPlayer, team: updatedTeam }, { status: 201 });
    } catch (error) {
        console.error("❌ Failed to add player:", error);
        return NextResponse.json({ error: "Failed to add player" }, { status: 500 });
    }
}
