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
  Shield,
  Zap,
  FileCheck,
  Users,
  TrendingUp,
  Clock,
  Award,
  Star,
} from "lucide-react";
import api from "../utils/api";

export default function Splash() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const res = await api.get("/land");
        // Handle the response structure properly
        const landsData = res.data?.data || res.data || [];
        setLands(landsData.slice(0, 5));
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
    }, 5000);
    return () => clearInterval(interval);
  }, [lands]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % lands.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + lands.length) % lands.length);

  return (
    <div className="bg-white">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-white/20">
            <TrendingUp size={16} />
            <span className="text-sm font-medium">
              Trusted by 10,000+ investors
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Invest in Premium Land,
            <br />
            <span className="text-blue-200">Build Your Wealth</span>
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Secure your financial future with verified land investments across
            Nigeria. Start with as low as ₦5,000.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 group"
            >
              Get Started Free
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={18} /> Login
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 sm:gap-12 mt-16 max-w-3xl mx-auto">
            <StatBox number="10K+" label="Active Investors" />
            <StatBox number="500+" label="Properties Listed" />
            <StatBox number="₦5B+" label="Total Investment" />
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 sm:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Start your investment journey in four simple steps
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Browse Lands",
                desc: "Explore verified properties with complete documentation and transparent pricing.",
                icon: <Home size={32} />,
                color: "blue",
              },
              {
                step: "02",
                title: "Select & Invest",
                desc: "Choose your preferred land and purchase units that fit your budget.",
                icon: <CheckCircle size={32} />,
                color: "green",
              },
              {
                step: "03",
                title: "Secure Payment",
                desc: "Pay safely using multiple payment methods.",
                icon: <Shield size={32} />,
                color: "purple",
              },
              {
                step: "04",
                title: "Track & Grow",
                desc: "Monitor your portfolio and watch your investment appreciate over time.",
                icon: <TrendingUp size={32} />,
                color: "orange",
              },
            ].map((step) => (
              <StepCard key={step.step} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="py-20 px-6 sm:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
              Featured Properties
            </h2>
            <p className="text-gray-600">
              Handpicked investment opportunities in prime locations
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : lands.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <Home size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">New properties coming soon!</p>
            </div>
          ) : (
            <div className="relative">
              {/* Carousel Container */}
              <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                {lands.map((land, i) => {
                  // Get image URL from the response
                  const imageUrl =
                    land.images?.length > 0
                      ? land.images[0].url
                      : "/no-image.jpeg";

                  // Convert kobo to naira
                  const pricePerUnit = (land.price_per_unit_kobo || 0) / 100;

                  return (
                    <div
                      key={land.id}
                      className={`absolute inset-0 transition-opacity duration-700 ${
                        i === currentIndex ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={land.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/no-image.jpeg";
                        }}
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                      {/* Property Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                        <div className="max-w-4xl mx-auto">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                              Featured
                            </span>
                            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
                              {land.available_units?.toLocaleString() || 0} units
                              available
                            </span>
                            <span className="bg-green-600/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
                              {land.size?.toLocaleString() || 0} sqm
                            </span>
                            {land.sold_percentage > 0 && (
                              <span className="bg-orange-600/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
                                {land.sold_percentage}% sold
                              </span>
                            )}
                          </div>

                          <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                            {land.title}
                          </h3>

                          <p className="flex items-center gap-2 text-white/90 mb-1">
                            <MapPin size={16} />
                            {land.location}
                          </p>

                          {land.description && (
                            <p className="text-sm text-white/70 mb-4 line-clamp-2">
                              {land.description}
                            </p>
                          )}

                          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                            <div>
                              <p className="text-sm text-white/70 mb-1">
                                Price per unit
                              </p>
                              <p className="text-3xl sm:text-4xl font-bold">
                                ₦{pricePerUnit.toLocaleString()}
                              </p>
                              <p className="text-xs text-white/60 mt-1">
                                Total units:{" "}
                                {land.total_units?.toLocaleString() || 0}
                              </p>
                            </div>
                            <Link
                              to="/register"
                              className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition flex items-center gap-2 w-full sm:w-auto justify-center"
                            >
                              Invest Now
                              <ArrowRight size={16} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              {lands.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition z-10"
                    aria-label="Previous property"
                  >
                    <ChevronLeft size={24} className="text-gray-700" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition z-10"
                    aria-label="Next property"
                  >
                    <ChevronRight size={24} className="text-gray-700" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {lands.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {lands.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`transition-all ${
                        i === currentIndex
                          ? "w-8 h-3 bg-blue-600 rounded-full"
                          : "w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400"
                      }`}
                      aria-label={`Go to property ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 px-6 sm:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
              Why Choose Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide everything you need for a secure and profitable land
              investment
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield size={32} />,
                title: "Verified Lands",
                desc: "All properties are legally verified with complete documentation.",
                color: "blue",
              },
              {
                icon: <Zap size={32} />,
                title: "Flexible Payments",
                desc: "Pay safely using multiple payment methods.",
                color: "green",
              },
              {
                icon: <FileCheck size={32} />,
                title: "Fast Processing",
                desc: "Quick documentation and seamless title transfer process.",
                color: "purple",
              },
              {
                icon: <Users size={32} />,
                title: "Expert Support",
                desc: "Dedicated team to guide you through every step of your investment.",
                color: "orange",
              },
            ].map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 sm:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
              What Our Investors Say
            </h2>
            <p className="text-gray-600">
              Join thousands of satisfied investors building wealth through land
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Chidi Okonkwo",
                role: "Business Owner",
                text: "I've invested in 3 properties so far and the process was incredibly smooth. The team is transparent and professional.",
                rating: 5,
              },
              {
                name: "Amina Bello",
                role: "Software Engineer",
                text: "The flexible payment plan made it easy for me to start investing. My land value has already appreciated by 15%!",
                rating: 5,
              },
              {
                name: "Tunde Adeyemi",
                role: "Real Estate Investor",
                text: "Best platform for verified land investments in Nigeria. The documentation process was fast and hassle-free.",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <TestimonialCard key={i} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative py-24 px-6 sm:px-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Award size={48} className="mx-auto mb-6 text-blue-200" />
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Ready to Build Your Wealth?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join over 10,000 smart investors who are securing their financial
            future through verified land investments.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-blue-700 font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 group"
            >
              Start Investing Today
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              to="/lands"
              className="bg-transparent border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-blue-700 transition-all"
            >
              Browse Properties
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>Verified Properties</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Fast Processing</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 sm:px-12 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Everything you need to know about investing with us
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How do I purchase land?",
                answer:
                  "Simply browse available properties, select your preferred land, choose the number of units you want to purchase, and complete the payment securely through your dashboard. You can pay in full or opt for our flexible installment plans.",
              },
              {
                question: "Are all properties verified?",
                answer:
                  "Yes, every property listed on our platform undergoes rigorous verification. We ensure all lands have proper documentation, clear titles, and are free from legal disputes before listing.",
              },
              {
                question: "How long does the documentation process take?",
                answer:
                  "Once payment is completed, the documentation and title transfer process typically takes 2-4 weeks. Our team handles all the paperwork and keeps you updated throughout the process.",
              },
              {
                question: "What is the minimum investment amount?",
                answer:
                  "You can start investing with as low as ₦5,000 depending on the property. Each land listing shows the price per unit, allowing you to invest according to your budget.",
              },
            ].map((faq, i) => (
              <FAQItem key={i} {...faq} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ========== COMPONENTS ========== */

const StatBox = ({ number, label }) => (
  <div className="text-center">
    <p className="text-3xl sm:text-4xl font-bold mb-2">{number}</p>
    <p className="text-sm sm:text-base text-blue-200">{label}</p>
  </div>
);

const StepCard = ({ step, title, desc, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="relative">
      {/* Step Number */}
      <div className="absolute -top-4 -left-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg">
        {step}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 h-full">
        <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
          {icon}
        </div>
        <h3 className="font-bold text-xl text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 text-center group hover:-translate-y-1">
      <div
        className={`inline-flex p-4 rounded-xl ${colorClasses[color]} mb-4 group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <h3 className="font-bold text-lg text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
};

const TestimonialCard = ({ name, role, text, rating }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all">
    <div className="flex gap-1 mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
      ))}
    </div>
    <p className="text-gray-700 mb-6 leading-relaxed italic">"{text}"</p>
    <div>
      <p className="font-semibold text-gray-800">{name}</p>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
  </div>
);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-800 pr-8">{question}</span>
        <ChevronRight
          size={20}
          className={`text-blue-600 transition-transform flex-shrink-0 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <p className="px-6 pb-5 text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};