import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    imageId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "uploads.files", // Reference to GridFS files collection
      required: true 
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

newsSchema.index({ createdAt: -1 });

const News = mongoose.models.News || mongoose.model("News", newsSchema);

export default News;
