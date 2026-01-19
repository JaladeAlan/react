import { useEffect, useMemo, useRef, useState } from "react";
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
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

/* ===================== MAP FLY CONTROLLER ===================== */
function MapFlyController({ target }) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;

    map.flyTo([target.lat, target.lng], 16, {
      animate: true,
      duration: 1.2,
    });
  }, [target, map]);

  return null;
}

/* ===================== FIT BOUNDS ===================== */
function FitBounds({ points }) {
  const map = useMap();
  const done = useRef(false);

  useEffect(() => {
    if (!points.length || done.current) return;
    map.fitBounds(points, { padding: [50, 50] });
    done.current = true;
  }, [points, map]);

  return null;
}

/* ===================== MARKER HELPERS ===================== */
function getPriceColor(price) {
  if (price < 200_000) return "#22c55e";
  if (price < 500_000) return "#facc15";
  return "#ef4444";
}

function getUnitOpacity(units) {
  if (units > 50) return 1;
  if (units > 10) return 0.8;
  return 0.6;
}

function createMarkerIcon({ price, units, active }) {
  return L.divIcon({
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    html: `
      <div class="relative">
        ${active ? `<span class="pulse-ring"></span>` : ""}
        <div
          class="marker-dot"
          style="
            background:${getPriceColor(price)};
            opacity:${getUnitOpacity(units)};
            border:2px solid white;
          "
        ></div>
      </div>
    `,
  });
}

/* ===================== MAIN ===================== */
export default function LandList() {
  const [lands, setLands] = useState([]);
  const [visibleLands, setVisibleLands] = useState([]);
  const [activeLandId, setActiveLandId] = useState(null);
  const [hoverLandId, setHoverLandId] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);

  const markersRef = useRef({});

  /* ===================== FETCH ===================== */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/lands");
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : res.data;
        setLands(list);
        setVisibleLands(list);
      } catch {
        setError("Failed to load lands");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ===================== ESC ===================== */
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setIsFullScreen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  /* ===================== FILTER COORDS ===================== */
  const landsWithCoords = useMemo(
    () => lands.filter((l) => l.lat && l.lng),
    [lands]
  );

  /* ===================== VIEWPORT FILTER ===================== */
  const bindViewport = (map) => {
    const update = () => {
      const bounds = map.getBounds();
      setVisibleLands(
        landsWithCoords.filter((l) =>
          bounds.contains([+l.lat, +l.lng])
        )
      );
    };

    map.on("moveend", update);
    update();
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading lands...
      </div>
    );

  if (error)
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8 space-y-10">
      <h2 className="text-2xl font-bold text-gray-800">Available Lands</h2>

      {/* ===================== MAP ===================== */}
      {landsWithCoords.length > 0 && (
        <div
          className={`relative transition-all ${
            isFullScreen
              ? "fixed inset-0 z-[9999] bg-white"
              : "rounded-xl overflow-hidden shadow"
          }`}
        >
          <button
            onClick={() => setIsFullScreen((v) => !v)}
            className="absolute top-3 right-3 z-[1000] bg-white px-3 py-1 rounded shadow text-sm"
          >
            {isFullScreen ? "✕ Close Map" : "⛶ Full Screen"}
          </button>

          <MapContainer
            whenCreated={bindViewport}
            zoom={8}
            className={`w-full ${
              isFullScreen ? "h-screen" : "min-h-[450px]"
            }`}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <MarkerClusterGroup chunkedLoading>
              {landsWithCoords.map((land) => {
                const isActive =
                  land.id === activeLandId ||
                  land.id === hoverLandId;

                return (
                  <Marker
                    key={land.id}
                    position={[+land.lat, +land.lng]}
                    icon={createMarkerIcon({
                      price: land.price_per_unit,
                      units: land.available_units,
                      active: isActive,
                    })}
                    eventHandlers={{
                      click: () => setActiveLandId(land.id),
                      mouseover: () => setHoverLandId(land.id),
                      mouseout: () => setHoverLandId(null),
                    }}
                    ref={(marker) => {
                      if (marker)
                        markersRef.current[land.id] = marker;
                    }}
                  >
                    <Popup>
                      <div className="space-y-1 text-sm">
                        <strong>{land.title}</strong>
                        <p>{land.location}</p>
                        <p>
                          ₦
                          {Number(
                            land.price_per_unit
                          ).toLocaleString()}
                        </p>
                        <Link
                          to={`/lands/${land.id}`}
                          className="block mt-2 bg-green-600 text-white rounded px-3 py-1 text-center"
                        >
                          Invest Now
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>

            <FitBounds
              points={landsWithCoords.map((l) => [+l.lat, +l.lng])}
            />

            <MapFlyController target={flyTarget} />
          </MapContainer>
        </div>
      )}

      {/* ===================== CARDS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {visibleLands.map((land) => (
          <div
            key={land.id}
            onMouseEnter={() => setHoverLandId(land.id)}
            onMouseLeave={() => setHoverLandId(null)}
            className={`bg-white rounded-xl shadow flex flex-col transition ${
              hoverLandId === land.id
                ? "ring-2 ring-blue-500 shadow-lg"
                : "hover:shadow-lg"
            }`}
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
              <p className="text-sm text-gray-500 mb-2">
                {land.location}
              </p>

              <div className="text-sm space-y-1 mb-4">
                <p>Size: {land.size} sq ft</p>
                <p>
                  Price: ₦
                  {Number(
                    land.price_per_unit
                  ).toLocaleString()}
                </p>
                <p>Units: {land.available_units}</p>
              </div>

              <button
                onClick={() => {
                  setActiveLandId(land.id);
                  setFlyTarget({
                    lat: +land.lat,
                    lng: +land.lng,
                  });

                  setTimeout(() => {
                    markersRef.current[land.id]?.openPopup();
                  }, 700);
                }}
                className="mt-auto bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition"
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
