"use server";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB, getGFS } from "@/lib/mongodb";
import Manager from "@/models/fantasy/Manager";
import { Readable, pipeline } from "stream";
import { promisify } from "util";
import { ObjectId } from "mongodb";
import { adminAuth } from "@/lib/firebaseAdmin";

const pipelineAsync = promisify(pipeline);
const ALLOWED_IMAGE_TYPES = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// ✅ Verify User Session
const getUserEmailFromSession = async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims.email;
  } catch (error) {
    console.error("❌ Session Verification Failed:", error);
    return null;
  }
};

// ✅ Upload Image to GridFS
const uploadImage = async (image, gfs) => {
  if (!image) return null;
  if (!ALLOWED_IMAGE_TYPES.includes(image.type)) throw new Error("Invalid file type");
  if (image.size > MAX_IMAGE_SIZE) throw new Error("File size exceeds limit (5MB)");

  const readableStream = Readable.from(Buffer.from(await image.arrayBuffer()));
  const uploadStream = gfs.openUploadStream(image.name, { contentType: image.type });
  await pipelineAsync(readableStream, uploadStream);
  return uploadStream.id; // Return uploaded image ID
};

// ✅ Delete Old Image from GridFS
const deleteOldImage = async (imageId, gfs) => {
  if (!imageId) return;
  try {
    await gfs.delete(new ObjectId(imageId));
  } catch (error) {
    console.error("❌ Failed to delete old image:", error);
  }
};

// ✅ Upload Profile Picture (POST)
export async function POST(req) {
  try {
    console.log("📥 Received request to update profile picture or cover picture");

    // ✅ Verify User Session
    const email = await getUserEmailFromSession();
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    console.log("🔹 Authenticated User:", email);

    const formData = await req.formData();
    const profilePic = formData.get("profilePic");
    const coverPic = formData.get("coverPic");

    if (!profilePic && !coverPic) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    await connectDB();
    const gfs = getGFS();
    if (!gfs) return NextResponse.json({ error: "GridFS initialization failed" }, { status: 500 });

    // ✅ Find Manager by Email
    const manager = await Manager.findOne({ email });
    if (!manager) return NextResponse.json({ error: "Manager not found" }, { status: 404 });

    let profilePicUrl = null;
    let coverPicUrl = null;

    // ✅ Upload & Update Profile Picture Separately
    if (profilePic) {
      await deleteOldImage(manager.profilePicId, gfs); // Remove old profile pic
      const profilePicId = await uploadImage(profilePic, gfs);
      manager.profilePicId = profilePicId;
      profilePicUrl = `/api/manager/image/${profilePicId}`;
    }

    // ✅ Upload & Update Cover Picture Separately
    if (coverPic) {
      await deleteOldImage(manager.coverPicId, gfs); // Remove old cover pic
      const coverPicId = await uploadImage(coverPic, gfs);
      manager.coverPicId = coverPicId;
      coverPicUrl = `/api/manager/image/${coverPicId}`;
    }

    await manager.save();

    console.log("✅ Profile update successful for:", email);
    return NextResponse.json(
      {
        message: "Profile updated successfully",
        profilePicUrl,
        coverPicUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Profile update failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function DELETE(req) {
  try {
    console.log("📤 Received request to delete profile or cover picture");
    const email = await getUserEmailFromSession();
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.log("🔹 Authenticated User:", email);

    const { pictureType } = await req.json();
    if (!["profilePic", "coverPic"].includes(pictureType)) {
      return NextResponse.json({ error: "Invalid picture type" }, { status: 400 });
    }

    await connectDB();
    const gfs = getGFS();
    if (!gfs) return NextResponse.json({ error: "GridFS initialization failed" }, { status: 500 });

    const manager = await Manager.findOne({ email });
    if (!manager) return NextResponse.json({ error: "Manager not found" }, { status: 404 });

    if (pictureType === "profilePic" && manager.profilePicId) {
      await deleteOldImage(manager.profilePicId, gfs);
      manager.profilePicId = null;
    }
    if (pictureType === "coverPic" && manager.coverPicId) {
      await deleteOldImage(manager.coverPicId, gfs);
      manager.coverPicId = null;
    }

    await manager.save();
    console.log(`✅ ${pictureType} deleted successfully for:`, email);
    return NextResponse.json({ message: `${pictureType} deleted successfully` }, { status: 200 });
  } catch (error) {
    console.error("❌ Picture deletion failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
