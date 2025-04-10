"use server";

import { connectDB, getGFS } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const gfs = getGFS();
        if (!gfs) throw new Error("❌ GridFS initialization failed");

        const { id } = params;
        if (!id || !ObjectId.isValid(id)) {
            return new Response(JSON.stringify({ error: "Invalid file ID" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const files = await gfs.find({ _id: new ObjectId(id) }).toArray();
        if (!files.length) {
            return new Response(JSON.stringify({ error: "File not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        const file = files[0];
        const downloadStream = gfs.openDownloadStream(file._id);

        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();

        downloadStream.on("data", (chunk) => writer.write(chunk));
        downloadStream.on("end", () => writer.close());
        downloadStream.on("error", (err) => writer.abort(err));

        return new Response(readable, {
            headers: {
                "Content-Type": file.contentType || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000",
            },
        });

    } catch (error) {
        console.error("❌ Image retrieval failed:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
