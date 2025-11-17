import React from "react";
import { Star } from "lucide-react";

const RatingStars = ({
  rating,
  onRatingChange,
  interactive = false,
  size = "md",
}) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          className={`${
            interactive
              ? "cursor-pointer hover:scale-110 transition-transform"
              : "cursor-default"
          } ${sizes[size]} ${
            star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"
          }`}
          disabled={!interactive}
        >
          <Star className={`${sizes[size]}`} />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
