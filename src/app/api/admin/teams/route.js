import { NextResponse } from "next/server";
import { connectDB, getGFS } from "@/lib/mongodb";
import Team from "@/models/team";
import { ObjectId } from "mongodb";
import { Readable, pipeline } from "stream";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// ✅ Function to Upload Team Logo to GridFS
const uploadImage = async (image, gfs) => {
    if (!image) return null;
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) throw new Error("Invalid file type");
    if (image.size > MAX_IMAGE_SIZE) throw new Error("File size exceeds 5MB");

    const uploadStream = gfs.openUploadStream(image.name, { contentType: image.type });
    await pipelineAsync(Readable.from(Buffer.from(await image.arrayBuffer())), uploadStream);
    return uploadStream.id.toString();
};

// ✅ [GET] Fetch All Teams with Player Details
export async function GET() {
    await connectDB();
    try {
        const teams = await Team.find().populate("players");
        return NextResponse.json(teams, { status: 200 });
    } catch (error) {
        console.error("❌ Failed to fetch teams:", error);
        return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
    }
}

// ✅ [POST] Create a New Team with Logo Upload
export async function POST(req) {
    try {
        console.log("📥 Received request to create a new team");
        const formData = await req.formData();
        const team_name = formData.get("team_name");
        const manager = formData.get("manager"); // Store manager as string
        const players = JSON.parse(formData.get("players") || "[]").map(id => new ObjectId(id));
        const team_logo = formData.get("team_logo");

        if (!team_name || !manager) {
            return NextResponse.json({ error: "Invalid or missing data" }, { status: 400 });
        }

        await connectDB();
        const gfs = getGFS();
        if (!gfs) return NextResponse.json({ error: "GridFS initialization failed" }, { status: 500 });

        const teamLogoId = team_logo ? await uploadImage(team_logo, gfs) : null;
        const newTeam = await Team.create({ team_name, team_logo: teamLogoId, manager, players });
        
        console.log("✅ Team created successfully");
        return NextResponse.json(newTeam, { status: 201 });
    } catch (error) {
        console.error("❌ Failed to create team:", error);
        return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
    }
}
