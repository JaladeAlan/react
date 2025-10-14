import { Link } from "react-router-dom";

const products = [
  { id: 1, name: "Solar Investment", price: "$1200" },
  { id: 2, name: "Real Estate Share", price: "$2500" },
  { id: 3, name: "Crypto Fund", price: "$600" },
];

export default function ProductList() {
  return (
    <div className="max-w-6xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Marketplace</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">{p.name}</h3>
            <p className="text-gray-500 mb-4">{p.price}</p>
            <Link
              to={`/marketplace/${p.id}`}
              className="text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
