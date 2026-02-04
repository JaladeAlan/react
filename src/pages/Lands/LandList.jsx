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
  LayersControl,
  AttributionControl,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "../../styles/leaflet-markers.css";

/* ===================== MONEY ===================== */
const koboToNaira = (kobo) => Number(kobo) / 100;

/* ===================== MAP HELPERS ===================== */
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

function MapInvalidate({ isFullScreen }) {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 300);
  }, [isFullScreen, map]);

  return null;
}

/* ===================== MARKER HELPERS ===================== */
function getPriceColor(priceNaira) {
  if (priceNaira < 200_000) return "#22c55e";
  if (priceNaira < 500_000) return "#facc15";
  return "#ef4444";
}

function getUnitOpacity(units) {
  if (units > 50) return 1;
  if (units > 10) return 0.8;
  return 0.6;
}

function createMarkerIcon({ priceKobo, units, active }) {
  const priceNaira = koboToNaira(priceKobo);

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
            background:${getPriceColor(priceNaira)};
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
  const [showHeatmap, setShowHeatmap] = useState(false);

  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const mapSectionRef = useRef(null);

  /* ===================== FETCH ===================== */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/lands");
        setLands(res.data.data);
        setVisibleLands(res.data.data);
      } catch {
        setError("Failed to load lands");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const landsWithCoords = useMemo(
    () => lands.filter((l) => l.lat && l.lng),
    [lands]
  );

  /* ===================== VIEWPORT FILTER ===================== */
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

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

    return () => map.off("moveend", update);
  }, [landsWithCoords]);

  /* ===================== HEATMAP ===================== */
  useEffect(() => {
    if (!mapRef.current) return;

    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (showHeatmap && visibleLands.length) {
      heatLayerRef.current = L.heatLayer(
        visibleLands.map((l) => [
          +l.lat,
          +l.lng,
          Math.max(0.25, Math.min(l.heat ?? 0, 1)),
        ]),
        { radius: 45, blur: 25, maxZoom: 17 }
      ).addTo(mapRef.current);
    }
  }, [showHeatmap, visibleLands]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading…
      </div>
    );

  if (error)
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  const defaultCenter = landsWithCoords.length
    ? [+landsWithCoords[0].lat, +landsWithCoords[0].lng]
    : [9.082, 8.6753];

  return (
    <div className="space-y-10 px-4 sm:px-8">
      {/* ===================== MAP ===================== */}
      <div
        ref={mapSectionRef}
        className={`relative ${
          isFullScreen
            ? "fixed inset-0 z-[9999] bg-white"
            : "rounded-xl overflow-hidden shadow"
        }`}
      >
        {/* TOP BUTTONS */}
        <div className="absolute top-3 right-3 z-[2000] flex gap-2">
          <button
            onClick={() => setIsFullScreen((v) => !v)}
            className="bg-white px-3 py-1 rounded shadow"
          >
            {isFullScreen ? "✕ Close" : "⛶ Fullscreen"}
          </button>

          <button
            onClick={() => setShowHeatmap((v) => !v)}
            className={`px-3 py-1 rounded shadow ${
              showHeatmap ? "bg-red-600 text-white" : "bg-white"
            }`}
          >
            🔥 {showHeatmap ? "Hide" : "Heatmap"}
          </button>
        </div>

        <MapContainer
          attributionControl={false} 
          whenCreated={(map) => {
            mapRef.current = map;
          }}
          center={defaultCenter}
          zoom={8}
          className={isFullScreen ? "h-screen w-full" : "h-[500px] w-full"}
        >
          <AttributionControl prefix={false} />

          <LayersControl position="topleft">
            <LayersControl.BaseLayer checked name="Street">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; Esri, Maxar, Earthstar Geographics"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Terrain">
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenTopoMap contributors"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {!showHeatmap && (
            <MarkerClusterGroup>
              {landsWithCoords.map((land) => {
                const active =
                  land.id === activeLandId || land.id === hoverLandId;

                return (
                  <Marker
                    key={land.id}
                    position={[+land.lat, +land.lng]}
                    icon={createMarkerIcon({
                      priceKobo: land.price_per_unit_kobo,
                      units: land.available_units,
                      active,
                    })}
                  >
                    <Popup>
                      <strong>{land.title}</strong>
                      <br />
                      ₦
                      {koboToNaira(
                        land.price_per_unit_kobo
                      ).toLocaleString()}
                      <br />
                      <Link
                        to={`/lands/${land.id}`}
                        className="text-blue-600"
                      >
                        View
                      </Link>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          )}

          <FitBounds points={landsWithCoords.map((l) => [+l.lat, +l.lng])} />
          <MapFlyController target={flyTarget} />
          <MapInvalidate isFullScreen={isFullScreen} />
        </MapContainer>
      </div>

      {/* ===================== CARDS ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {visibleLands.map((land) => (
          <div
            key={land.id}
            onMouseEnter={() => setHoverLandId(land.id)}
            onMouseLeave={() => setHoverLandId(null)}
            className="bg-white rounded-xl shadow hover:shadow-lg transition"
          >
            <img
              src={getLandImage(land)}
              alt={land.title}
              className="h-48 w-full object-cover rounded-t-xl"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg">{land.title}</h3>
              <p className="text-sm text-gray-500">{land.location}</p>
              <p className="mt-2 font-medium">
                ₦
                {koboToNaira(
                  land.price_per_unit_kobo
                ).toLocaleString()}
              </p>
              <button
                onClick={() => {
                  mapSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });

                  setTimeout(() => {
                    setActiveLandId(land.id);
                    setFlyTarget({
                      lat: +land.lat,
                      lng: +land.lng,
                    });
                  }, 400);
                }}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded"
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
