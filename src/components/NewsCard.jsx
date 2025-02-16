import { motion } from "framer-motion";

const NewsCard = ({ imageUrl, title, description, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden transition-transform"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="w-full h-48 overflow-hidden">
        <motion.img
          src={imageUrl || "https://via.placeholder.com/400"}
          alt={title || "No Title"}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{title || "No Title Available"}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {description || "No description available."}
        </p>
      </div>
    </motion.div>
  );
};

export default NewsCard;
