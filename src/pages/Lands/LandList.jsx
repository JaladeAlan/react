import { useEffect, useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { getLandImage } from "../../utils/images";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import L from "leaflet";
import { DefaultIcon } from "../../utils/leafletIcon";
import "leaflet/dist/leaflet.css";
import "@changey/react-leaflet-markercluster/dist/styles.min.css";

L.Marker.prototype.options.icon = DefaultIcon;

const activeIcon = new L.Icon({
  iconUrl: "/marker-active.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

/* ===================== COMPONENT ===================== */
export default function Lands() {
  const [lands, setLands] = useState([]);
  const [visibleLands, setVisibleLands] = useState([]);
  const [activeLandId, setActiveLandId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);

  const mapRef = useRef(null);

  /* ===================== FETCH DATA ===================== */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/lands");
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setLands(list);
        setVisibleLands(list);
      } catch (err) {
        console.error(err);
        setError("Failed to load lands.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ===================== FULLSCREEN BODY LOCK ===================== */
  useEffect(() => {
    document.body.style.overflow = isFullScreen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isFullScreen]);

  /* ===================== ESC TO EXIT ===================== */
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setIsFullScreen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  /* ===================== COORD FILTER ===================== */
  const landsWithCoords = useMemo(
    () => lands.filter((l) => l.lat && l.lng),
    [lands]
  );

  /* ===================== FIT BOUNDS HELPER ===================== */
  function FitBounds({ bounds }) {
    const map = useMap();
    useEffect(() => {
      if (bounds.length === 0) return;
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }, [bounds, map]);
    return null;
  }

  /* ===================== VIEWPORT FILTER ===================== */
  const bindViewportFilter = (map) => {
    const update = () => {
      const bounds = map.getBounds();
      setVisibleLands(
        lands.filter((l) => l.lat && l.lng && bounds.contains([l.lat, l.lng]))
      );
    };
    map.on("moveend", update);
  };

  /* ===================== LOADING / ERROR ===================== */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading lands...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  /* ===================== RENDER ===================== */
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8 space-y-10">
      <h2 className="text-2xl font-bold text-gray-800">Available Lands</h2>

      {/* ===================== MAP ===================== */}
      {landsWithCoords.length > 0 && (
        <div
          className={`relative transition-all duration-300 ${
            isFullScreen
              ? "fixed inset-0 z-[9999] bg-white"
              : "h-[450px] rounded-xl overflow-hidden shadow"
          }`}
        >
          <button
            onClick={() => setIsFullScreen((v) => !v)}
            className="absolute top-3 right-3 z-[1000] bg-white px-3 py-1 rounded shadow text-sm"
          >
            {isFullScreen ? "✕ Close Map" : "⛶ Full Screen"}
          </button>

          <MapContainer
            whenCreated={(map) => {
              mapRef.current = map;
              bindViewportFilter(map);
            }}
            zoom={8}
            className={`w-full ${isFullScreen ? "h-screen" : "h-full"}`}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <MarkerClusterGroup chunkedLoading>
              {landsWithCoords.map((land) => (
                <Marker
                  key={land.id}
                  position={[land.lat, land.lng]}
                  icon={activeLandId === land.id ? activeIcon : DefaultIcon}
                  eventHandlers={{
                    click: () => setActiveLandId(land.id),
                  }}
                >
                  <Popup>
                    <div className="space-y-1">
                      <strong>{land.title}</strong>
                      <p className="text-sm">{land.location}</p>
                      <p className="text-sm">
                        ₦{Number(land.price_per_unit).toLocaleString()}
                      </p>
                     <Link to={`/lands/${land.id}`} className="block mt-2 bg-green-600 text-white rounded px-3 py-1 text-center">
                      Invest Now
                    </Link>

                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>

            {/* Fit bounds on first load */}
            <FitBounds
              bounds={landsWithCoords.map((l) => [l.lat, l.lng])}
            />
          </MapContainer>

          <div className="absolute bottom-2 left-2 z-[1000] bg-white/80 px-2 py-1 rounded text-[11px]">
            © OpenStreetMap contributors
          </div>
        </div>
      )}

      {/* ===================== CARDS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {visibleLands.map((land) => (
          <div
            key={land.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col"
          >
            <img
              src={getLandImage(land)}
              alt={land.title}
              onError={(e) =>
                (e.currentTarget.src =
                  "/storage/land_images/placeholder.png")
              }
              className="w-full h-48 object-cover rounded-t-xl"
            />

            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg font-semibold">{land.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{land.location}</p>

              <div className="text-sm space-y-1 mb-4">
                <p>Size: {land.size} sq ft</p>
                <p>
                  Price: ₦{Number(land.price_per_unit).toLocaleString()}
                </p>
                <p>Units: {land.available_units}</p>
              </div>

              <button
                onClick={() => {
                  setActiveLandId(land.id);
                  mapRef.current?.flyTo([land.lat, land.lng], 13, {
                    animate: true,
                    duration: 1.2,
                  });
                }}
                className="mt-auto bg-blue-600 text-white rounded-lg py-2"
              >
                View on Map
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
