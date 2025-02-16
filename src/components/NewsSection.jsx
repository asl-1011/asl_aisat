import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NewsCard from "@/components/NewsCard";

// Slider settings
const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: false,
  pauseOnHover: false,
};

// NewsSection Component
const NewsSection = ({ setSelectedNews = () => {} }) => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setNewsItems(data);
        } else {
          throw new Error("Invalid news data format received");
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Handle news selection
  const handleNewsClick = useCallback(
    (newsId) => {
      if (typeof setSelectedNews === "function") {
        setSelectedNews(newsId);
      } else {
        console.warn("setSelectedNews is not a valid function");
      }
    },
    [setSelectedNews]
  );

  return (
    <motion.section
      className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12 }}
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Star className="w-5 h-5 text-yellow-500 mr-2" />
        Latest News
      </h2>

      {/* Show loading state */}
      {loading && <p className="text-center text-gray-500">Loading news...</p>}

      {/* Show error message if fetching fails */}
      {error && (
        <p className="text-center text-red-500">
          Failed to load news: {error}
        </p>
      )}

      {/* Display news items */}
      {!loading && !error && newsItems.length === 0 && (
        <p className="text-center text-gray-500">No news available</p>
      )}

      {!loading && !error && newsItems.length > 0 && (
        <Slider {...sliderSettings}>
          {newsItems.map((news) => (
            <div key={news.id}>
              <NewsCard
                imageUrl={news.imageUrl}
                title={news.title}
                description={news.description}
                onClick={() => handleNewsClick(news.id)}
              />
            </div>
          ))}
        </Slider>
      )}
    </motion.section>
  );
};

export default NewsSection;
