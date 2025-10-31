import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Home,
  ArrowRight,
  LogIn,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import api from "../utils/api";

export default function Splash() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://growth-estate.onrender.com";

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const res = await api.get("/land");
        setLands(res.data.slice(0, 5));
      } catch (err) {
        console.error("Error fetching lands:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLands();
  }, []);

  // Auto-slide every 10 seconds
  useEffect(() => {
    if (lands.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % lands.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [lands]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % lands.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + lands.length) % lands.length);

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

      {/* HOW IT WORKS */}
      <section className="py-16 px-6 sm:px-12 bg-white text-center">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">How It Works</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            {
              title: "1. Browse Lands",
              desc: "Explore available lands with detailed information and verified ownership.",
            },
            {
              title: "2. Select & Invest",
              desc: "Choose your preferred land and purchase the number of units you want.",
            },
            {
              title: "3. Make Payment",
              desc: "Pay securely using your dashboard — full or installment options available.",
            },
            {
              title: "4. Track & Earn",
              desc: "Monitor your investments and get updates as your land appreciates.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-lg transition"
            >
              <CheckCircle className="mx-auto text-blue-600 mb-3" size={28} />
              <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* OUR PROPERTIES */}
      <section className="py-16 px-6 sm:px-12 bg-gray-50 relative">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Featured Properties
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading properties...</p>
        ) : lands.length === 0 ? (
          <p className="text-center text-gray-500">
            No properties available yet.
          </p>
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
                ₦
                {Number(lands[currentIndex]?.price_per_unit || 0).toLocaleString()}
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
            <div className="flex justify-center gap-2 mt-6">
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
      <section className="py-16 px-6 sm:px-12 bg-white text-center">
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
              className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-gray-800 mb-2">{feature}</h3>
              <p className="text-gray-600 text-sm">
                Enjoy hassle-free land ownership and secure investments.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 💎 INVEST NOW CTA BANNER */}
      <section className="py-20 px-6 sm:px-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-center text-white">
        <h2 className="text-4xl font-bold mb-4">Ready to Start Investing?</h2>
        <p className="text-lg mb-8 text-blue-100">
          Join thousands of smart investors securing their future through real estate.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg shadow hover:bg-gray-100 transition flex items-center gap-2"
          >
            Start Now <ArrowRight size={18} />
          </Link>
          <Link
            to="/land"
            className="bg-transparent border border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-blue-700 transition"
          >
            Explore Lands
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-6 sm:px-12 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Testimonials</h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          “Buying land through this platform was smooth, transparent, and
          stress-free. Highly recommended!”
        </p>
        <p className="mt-4 font-semibold text-blue-600">— A Satisfied Investor</p>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 sm:px-12 bg-white">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          FAQs
        </h2>
        <div className="max-w-2xl mx-auto space-y-4">
          <details className="bg-gray-50 p-4 rounded-lg shadow">
            <summary className="font-medium cursor-pointer">
              How do I purchase a land?
            </summary>
            <p className="text-gray-600 mt-2">
              Simply select a land, confirm available units, and make your
              payment securely from your dashboard.
            </p>
          </details>
          <details className="bg-gray-50 p-4 rounded-lg shadow">
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
 