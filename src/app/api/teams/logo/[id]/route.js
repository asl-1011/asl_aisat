"use server";

import { NextResponse } from "next/server";
import { connectDB, getGFS } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Readable } from "stream";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const gfs = getGFS();
        if (!gfs) throw new Error("❌ GridFS initialization failed");

        const { id } = params;
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
        }

        // Find the image metadata
        const fileCursor = gfs.find({ _id: new ObjectId(id) });
        const files = await fileCursor.toArray();
        if (!files.length) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const file = files[0];
        const downloadStream = gfs.openDownloadStream(file._id);

        // Convert stream into a readable response
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
