"use server";

import { writeFile, mkdir, readFile } from "fs/promises";
import { join } from "path";

export async function POST(req) {
  try {
    const { encodedData } = await req.json();

    function decodeBase64(data) {
      return JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
    }

    function sanitize(value) {
      if (typeof value === "string") {
        return value
          .trim()
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
          .replace(/<[^>]*>?/gm, "");
      }
      if (typeof value === "number") {
        return isNaN(value) ? null : value;
      }
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          return value.map(sanitize);
        }
        return Object.fromEntries(
          Object.entries(value).map(([key, val]) => [sanitize(key), sanitize(val)])
        );
      }
      return value;
    }

    function formatTime(date) {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12 || 12; // Convert 0 -> 12 for 12-hour format
      return `${hours}-${String(minutes).padStart(2, "0")}-${ampm}`;
    }

    const decodedData = decodeBase64(encodedData);
    const sanitizedData = sanitize(decodedData);
    console.log("🔹 Decoded & Sanitized Device Data:", sanitizedData);

    const ip = sanitizedData.clientIp?.ip || "unknown_ip";
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const timeFormatted = formatTime(now);
    const logDir = join(process.cwd(), "logs", date);
    const logFile = join(logDir, `${ip}.json`);

    await mkdir(logDir, { recursive: true });

    // Read existing log if it exists
    let existingLogs = [];
    try {
      const data = await readFile(logFile, "utf-8");
      existingLogs = JSON.parse(data);
      if (!Array.isArray(existingLogs)) {
        existingLogs = [existingLogs]; // If it's a single object, wrap it in an array
      }
    } catch (err) {
      if (err.code !== "ENOENT") throw err; // Ignore file not found errors
    }

    // Append new data with formatted time
    existingLogs.push({ timestamp: `${date} ${timeFormatted}`, ...sanitizedData });

    // Write updated log
    await writeFile(logFile, JSON.stringify(existingLogs, null, 2), "utf-8");

    return new Response(
      JSON.stringify(
        { success: true, message: "Log updated successfully", file: logFile },
        null,
        2
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error processing device data:", error.message);

    return new Response(
      JSON.stringify(
        { success: false, message: error.message },
        null,
        2
      ),
      { status: 500 }
    );
  }
}
