import React from "react";
import Button from "../../components/Button";

export default function ProductDetail() {
  return (
    <div className="p-6">
      <img src="/images/farm.jpg" alt="Product" className="w-full h-64 object-cover rounded-xl mb-4" />
      <h2 className="text-2xl font-bold mb-2">Farm Investment</h2>
      <p className="text-gray-600 mb-4">Invest in local farms and earn up to 15% ROI annually.</p>
      <Button>Invest Now</Button>
    </div>
  );
}
