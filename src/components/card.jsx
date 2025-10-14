import React from "react";

export const Card = ({ title, description, image }) => {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
      {image && <img src={image} alt={title} className="w-full h-40 object-cover" />}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <button className="text-blue-600 font-medium hover:underline">
          Learn More →
        </button>
      </div>
    </div>
  );
};
