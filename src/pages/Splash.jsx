import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Home,
  ArrowRight,
  LogIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../utils/api";

export default function Splash() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const res = await api.get("/land");
        setLands(res.data.slice(0, 5)); // limit to 5 for demo
      } catch (err) {
        console.error("Error fetching lands:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLands();
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (lands.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % lands.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [lands]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % lands.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + lands.length) % lands.length);
  };

  return (
    <div className="bg-gray-50">
      {/* HERO */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <h1 className="text-4xl font-bold mb-4">Find Your Next Investment</h1>
        <p className="text-lg mb-6">
          Explore premium lands in fast-growing locations.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition flex items-center gap-2"
          >
            Get Started <ArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="bg-transparent border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition flex items-center gap-2"
          >
            <LogIn size={18} /> Login
          </Link>
        </div>
      </section>

      {/* ABOUT US */}
      <section className="py-16 px-6 sm:px-12 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">About Us</h2>
        <p className="max-w-2xl mx-auto text-gray-600">
          We connect you with verified and affordable land investments across
          Nigeria, ensuring transparency and peace of mind every step of the
          way.
        </p>
      </section>

      {/* OUR PROPERTIES */}
      <section className="py-16 px-6 sm:px-12 bg-white relative">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Our Properties
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading properties...</p>
        ) : lands.length === 0 ? (
          <p className="text-center text-gray-500">No properties available yet.</p>
        ) : (
          <div className="relative max-w-4xl mx-auto">
            {/* === Carousel Container === */}
            <div className="relative w-full h-64 sm:h-80 md:h-[28rem] rounded-xl overflow-hidden shadow-lg">
              {lands.map((land, i) => {
                const imageUrl =
                  land.images?.length > 0
                    ? `${BASE_URL}/storage/${land.images[0].image_path}`
                    : "/no-image.jpeg";

                return (
                  <img
                    key={land.id}
                    src={imageUrl}
                    alt={land.title}
                    loading="lazy"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                      i === currentIndex ? "opacity-100" : "opacity-0"
                    }`}
                  />
                );
              })}
            </div>

            {/* === Property Info === */}
            <div className="mt-6 text-center">
              <h3 className="text-xl font-semibold text-gray-800 flex justify-center items-center gap-2">
                <Home size={18} className="text-blue-600" />
                {lands[currentIndex]?.title}
              </h3>
              <p className="text-sm text-gray-500 flex justify-center items-center gap-1 mt-1">
                <MapPin size={14} />
                {lands[currentIndex]?.location}
              </p>
              <p className="text-blue-600 font-bold mt-3">
                ₦{Number(lands[currentIndex]?.price_per_unit || 0).toLocaleString()}
              </p>
              <Link
                to={`/register`}
                className="inline-block mt-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg"
              >
                Get Started
              </Link>
            </div>

            {/* === Navigation Buttons === */}
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-gray-100 transition"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/90 p-2 rounded-full shadow hover:bg-gray-100 transition"
            >
              <ChevronRight size={24} className="text-gray-700" />
            </button>

            {/* === Dots Indicator === */}
          <div className="absolute top-[-1.5rem] left-1/2 transform -translate-x-1/2 flex gap-2">
              {lands.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === currentIndex ? "bg-blue-600 scale-110" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    
      {/* FEATURES */}
      <section className="py-16 px-6 sm:px-12 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Why Choose Us</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            "Verified Lands",
            "Flexible Payments",
            "Fast Documentation",
            "Trusted Partners",
          ].map((feature) => (
            <div
              key={feature}
              className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-gray-800 mb-2">{feature}</h3>
              <p className="text-gray-600 text-sm">
                Enjoy hassle-free land ownership and secure investments.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-6 sm:px-12 bg-white text-center">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Testimonials</h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          “Buying land through this platform was smooth, transparent, and
          stress-free. Highly recommended!”
        </p>
        <p className="mt-4 font-semibold text-blue-600">
          — A Satisfied Investor
        </p>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 sm:px-12 bg-gray-50">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          FAQs
        </h2>
        <div className="max-w-2xl mx-auto space-y-4">
          <details className="bg-white p-4 rounded-lg shadow">
            <summary className="font-medium cursor-pointer">
              How do I purchase a land?
            </summary>
            <p className="text-gray-600 mt-2">
              Simply select a land, confirm available units, and make your
              payment securely from your dashboard.
            </p>
          </details>
          <details className="bg-white p-4 rounded-lg shadow">
            <summary className="font-medium cursor-pointer">
              Can I pay in installments?
            </summary>
            <p className="text-gray-600 mt-2">
              Yes, flexible installment options are available for most
              properties.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
