import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    imageUrl: { 
      type: String, 
      required: true, 
      validate: {
        validator: (v) => /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i.test(v),
        message: "Invalid image URL format",
      },
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

newsSchema.index({ createdAt: -1 });

const News = mongoose.models.News || mongoose.model("News", newsSchema);

export default News;
