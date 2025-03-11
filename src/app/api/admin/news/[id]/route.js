"use server";

import { NextResponse } from "next/server";
import { connectDB, getGFS } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const news = await News.findByIdAndDelete(id);
    if (!news) return NextResponse.json({ error: "News not found" }, { status: 404 });

    const gfs = getGFS();
    if (news.imageId) await gfs.delete(new ObjectId(news.imageId));

    return NextResponse.json({ message: "News deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Deleting news failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const gfs = getGFS();
    if (!gfs) throw new Error("❌ GridFS initialization failed");

    const { id } = params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const fileCursor = gfs.find({ _id: new ObjectId(id) });
    const files = await fileCursor.toArray();
    if (!files.length) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const file = files[0];
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
