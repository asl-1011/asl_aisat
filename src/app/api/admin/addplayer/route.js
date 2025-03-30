import { NextResponse } from "next/server";
import { connectDB, getGFS } from "@/lib/mongodb";
import Player from "@/models/Player";
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

// ✅ [POST] Add New Player to the Team
export async function POST(req) {
    try {
        console.log("📥 Received request to add a new player");
        const formData = await req.formData();
        const name = formData.get("name");
        const position = formData.get("position");
        const team = formData.get("team");
        const profilePic = formData.get("profilePic");

        if (!name || !position || !team) {
            return NextResponse.json({ error: "Invalid or missing data" }, { status: 400 });
        }

        await connectDB();
        const gfs = getGFS();
        if (!gfs) return NextResponse.json({ error: "GridFS initialization failed" }, { status: 500 });

        // Upload profile picture if provided
        const profilePicId = profilePic ? await uploadImage(profilePic, gfs) : null;

        const newPlayer = await Player.create({
            name,
            position,
            profilePic: profilePicId,  // Store the uploaded profile picture's GridFS ID
            team: new ObjectId(team),  // Ensure the team ID is an ObjectId
        });

        console.log("✅ Player added successfully");
        return NextResponse.json(newPlayer, { status: 201 });
    } catch (error) {
        console.error("❌ Failed to add player:", error);
        return NextResponse.json({ error: "Failed to add player" }, { status: 500 });
    }
}
