import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, PlusCircle, Trash2 } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NewsCard from "@/components/NewsCard";

const sliderSettings = {
  dots: true,
  infinite: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: false,
  pauseOnHover: false,
};

const NewsSection = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNews, setNewNews] = useState({ title: "", description: "", image: null });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/admin/news");
        if (!response.ok) throw new Error("Failed to fetch news.");
        const data = await response.json();
        setNewsItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setNewNews({ ...newNews, image: files[0] });
    } else {
      setNewNews({ ...newNews, [name]: value });
    }
  };

  const handleAddNews = async () => {
    if (!newNews.title || !newNews.description || !newNews.image) {
      alert("Title, description, and image are required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", newNews.title);
      formData.append("description", newNews.description);
      formData.append("image", newNews.image);

      const response = await fetch("/api/admin/news", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload news.");
      const addedNews = await response.json();
      setNewsItems([addedNews, ...newsItems]);
      setNewNews({ title: "", description: "", image: null });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteNews = async (id) => {
    if (!confirm("Are you sure you want to delete this news?")) return;
    try {
      const response = await fetch(`/api/admin/news?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete news.");
      setNewsItems(newsItems.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <motion.section
      className="bg-white rounded-2xl border shadow-lg p-6 hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Star className="w-6 h-6 text-yellow-500 mr-2" />
          Latest News
        </h2>
      </div>

      <div className="bg-gray-100 p-6 rounded-xl shadow-inner mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="title"
            placeholder="News Title"
            value={newNews.title}
            onChange={handleInputChange}
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 text-black"
          />
          <input
            type="text"
            name="description"
            placeholder="Short Description"
            value={newNews.description}
            onChange={handleInputChange}
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 text-black"
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleInputChange}
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
        <button
          onClick={handleAddNews}
          className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-lg shadow-lg hover:scale-105 transition-transform w-full"
        >
          <PlusCircle size={20} className="inline mr-2" /> Add News
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading news...</p>
      ) : error ? (
        <p className="text-center text-red-500">Error: {error}</p>
      ) : newsItems.length === 0 ? (
        <p className="text-center text-gray-500">No news available.</p>
      ) : (
        <Slider {...sliderSettings}>
          {newsItems.map((news) => (
            <div key={news._id} className="relative p-6 rounded-xl bg-white shadow-lg">
              <NewsCard
                imageUrl={news.imageUrl || "https://via.placeholder.com/300"}
                title={news.title}
                description={news.description}
              />
              <div className="absolute top-3 right-3 flex gap-3">
                <button
                  onClick={() => handleDeleteNews(news._id)}
                  className="bg-red-600 p-3 rounded-full text-white shadow-md hover:bg-red-700 transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </motion.section>
  );
};

export default NewsSection;