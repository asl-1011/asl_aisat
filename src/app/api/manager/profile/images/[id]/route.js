"use server";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB, getGFS } from "@/lib/mongodb";
import Manager from "@/models/fantasy/Manager";
import { Readable } from "stream";
import { ObjectId } from "mongodb";
import { adminAuth } from "@/lib/firebaseAdmin";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// ✅ Utility: Verify User Session
const getUserEmailFromSession = async () => {
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims.email;
  } catch (error) {
    console.error("❌ Session Verification Failed:", error);
    return null;
  }
};

// ✅ Function to Upload Image
const uploadImage = async (image, gfs) => {
  if (!image) return null;
  if (!ALLOWED_IMAGE_TYPES.includes(image.type)) throw new Error("Invalid file type");
  if (image.size > MAX_IMAGE_SIZE) throw new Error("File size exceeds 5MB");

  const uploadStream = gfs.openUploadStream(image.name, { contentType: image.type });
  await Readable.from(Buffer.from(await image.arrayBuffer())).pipe(uploadStream);
  return uploadStream.id.toString();
};

// ✅ Function to Delete Image from GridFS
const deleteOldImage = async (imageId, gfs) => {
  if (!imageId) return;
  try {
    await gfs.delete(new ObjectId(String(imageId)));
  } catch (error) {
    console.error("❌ Failed to delete image:", error);
  }
};

// ✅ [GET] Retrieve Image
export async function GET(req, { params }) {
  try {
    await connectDB();
    const gfs = getGFS();
    if (!gfs) throw new Error("❌ GridFS initialization failed");

    if (!params || !params.id) {
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const file = await gfs.files.findOne({ _id: new ObjectId(id) });
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const downloadStream = gfs.openDownloadStream(file._id);
    return new NextResponse(downloadStream, {
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("❌ Image retrieval failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ [POST] Upload or Update Images (Requires Authentication)
export async function POST(req) {
  try {
    console.log("📥 Received request to upload/update profile pictures");

    const formData = await req.formData();
    const managerId = formData.get("managerId");
    const profilePic = formData.get("profilePic");
    const coverPic = formData.get("coverPic");

    if (!managerId || !ObjectId.isValid(managerId)) {
      return NextResponse.json({ error: "Invalid or missing Manager ID" }, { status: 400 });
    }

    const email = await getUserEmailFromSession();
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    console.log("🔹 Authenticated User:", email);

    await connectDB();
    const gfs = getGFS();
    if (!gfs) return NextResponse.json({ error: "GridFS initialization failed" }, { status: 500 });

    const manager = await Manager.findById(managerId);
    if (!manager) return NextResponse.json({ error: "Manager not found" }, { status: 404 });
    if (manager.email !== email) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    if (profilePic) await deleteOldImage(manager.profilePicId, gfs);
    if (coverPic) await deleteOldImage(manager.coverPicId, gfs);

    manager.profilePicId = profilePic ? await uploadImage(profilePic, gfs) : manager.profilePicId;
    manager.coverPicId = coverPic ? await uploadImage(coverPic, gfs) : manager.coverPicId;
    await manager.save();

    console.log("✅ Profile updated successfully for:", email);
    return NextResponse.json(
      {
        message: "Profile updated successfully",
        profilePicUrl: manager.profilePicId ? `/api/manager/image/${manager.profilePicId}` : null,
        coverPicUrl: manager.coverPicId ? `/api/manager/image/${manager.coverPicId}` : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Profile update failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ [DELETE] Remove Image (Requires Authentication)
export async function DELETE(req) {
  try {
    const { managerId, imageType } = await req.json();
    if (!managerId || !ObjectId.isValid(managerId)) {
      return NextResponse.json({ error: "Invalid Manager ID" }, { status: 400 });
    }

    const email = await getUserEmailFromSession();
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    console.log("🗑️ Deleting image for:", email);

    await connectDB();
    const gfs = getGFS();
    if (!gfs) return NextResponse.json({ error: "GridFS initialization failed" }, { status: 500 });

    const manager = await Manager.findById(managerId);
    if (!manager) return NextResponse.json({ error: "Manager not found" }, { status: 404 });
    if (manager.email !== email) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    if (imageType === "profilePic") await deleteOldImage(manager.profilePicId, gfs);
    else if (imageType === "coverPic") await deleteOldImage(manager.coverPicId, gfs);
    else return NextResponse.json({ error: "Invalid image type" }, { status: 400 });

    await manager.save();
    console.log("✅ Image deleted successfully");
    return NextResponse.json({ message: "Image deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Image deletion failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
