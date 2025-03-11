"use server";

import { NextResponse } from "next/server";
import { connectDB, getGFS } from "@/lib/mongodb";
import News from "@/models/News";
import { Readable, pipeline } from "stream";
import { promisify } from "util";
import { ObjectId } from "mongodb";

const pipelineAsync = promisify(pipeline);

// Add News (POST)
export async function POST(req) {
  try {
    console.log("📥 Received POST request for news upload");

    const formData = await req.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const image = formData.get("image");

    if (!title || !description || !image) {
      throw new Error("Missing required fields");
    }

    await connectDB();
    const gfs = getGFS();
    if (!gfs) throw new Error("❌ GridFS initialization failed");

    const readableStream = new Readable();
    readableStream.push(Buffer.from(await image.arrayBuffer()));
    readableStream.push(null);

    const uploadStream = gfs.openUploadStream(image.name, {
      contentType: image.type,
    });
    await pipelineAsync(readableStream, uploadStream);

    if (!uploadStream.id) {
      throw new Error("❌ Upload Stream ID is undefined");
    }

    console.log("✅ Image successfully uploaded to GridFS");
    const imageUrl = `/api/news/image/${uploadStream.id}`;

    const newNews = await News.create({
      title,
      description,
      imageId: uploadStream.id,
      imageUrl,
    });

    return NextResponse.json(newNews, { status: 201 });
  } catch (error) {
    console.error("❌ Internal Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// Get News List (GET)
export async function GET() {
    try {
      await connectDB();
      const newsList = await News.find({});
      return NextResponse.json(
        newsList.map((news) => ({
          _id: news._id,
          id: news._id.toString(),
          title: news.title,
          description: news.description,
          imageUrl: `/api/admin/news/${news.imageId}`, // Ensure image URL is generated
        })),
        { status: 200 }
      );
    } catch (error) {
      console.error("❌ Fetching news failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  

// Get Image (GET /api/news/:id)
export async function GET_IMAGE(req, { params }) {
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

// Delete News (DELETE /api/news/:id)
export async function DELETE(req) {
  try {
    await connectDB();
    
    // Extract `id` from query parameters
    const id = req.nextUrl.searchParams.get("id");
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Find and delete the news entry
    const news = await News.findByIdAndDelete(id);
    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    // Delete the associated image from GridFS
    if (news.imageId) {
      const gfs = getGFS();
      await gfs.delete(new ObjectId(news.imageId));
    }

    return NextResponse.json({ message: "News deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Deleting news failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
