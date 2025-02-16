import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NewsCard from "@/components/NewsCard";

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

const NewsSection = ({ setSelectedNews }) => {
  const [newsItems, setNewsItems] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news"); // Fetch from Next.js API
        const data = await response.json();
        setNewsItems(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

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
      {newsItems.length === 0 ? (
        <p className="text-center text-gray-500">No news available</p>
      ) : (
        <Slider {...sliderSettings}>
          {newsItems.map((news) => (
            <div key={news.id}>
              <NewsCard
                imageUrl={news.imageUrl}
                title={news.title}
                description={news.description}
                onClick={() => setSelectedNews(news.id)}
              />
            </div>
          ))}
        </Slider>
      )}
    </motion.section>
  );
};

export default NewsSection;
