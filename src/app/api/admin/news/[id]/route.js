"use server";

import { NextResponse } from "next/server";
import { connectDB, getGFS } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import News from "@/models/News"; // Ensure the model is correctly imported

// ✅ DELETE News by ID
export async function DELETE(req, context) {
  try {
    await connectDB();
    
    const { params } = context;
    if (!params || !params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const news = await News.findByIdAndDelete(params.id);
    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    const gfs = getGFS();
    if (gfs && news.imageId) {
      await gfs.findOneAndDelete({ _id: new ObjectId(news.imageId) });
    }

    return NextResponse.json({ message: "News deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Deleting news failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ GET News Image by ID
export async function GET(req, context) {
  try {
    await connectDB();
    const gfs = getGFS();
    if (!gfs) throw new Error("❌ GridFS initialization failed");

    const { params } = context;
    if (!params || !params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const fileCursor = gfs.find({ _id: new ObjectId(params.id) });
    const files = await fileCursor.toArray();

    if (!files.length) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = files[0];
    const downloadStream = gfs.openDownloadStream(file._id);

    // ✅ Convert stream into a readable response
    const readableStream = new ReadableStream({
      start(controller) {
        downloadStream.on("data", (chunk) => controller.enqueue(chunk));
        downloadStream.on("end", () => controller.close());
        downloadStream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(readableStream, {
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
