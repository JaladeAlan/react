import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { getLandImage } from "../../utils/images";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
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

function MapRefSetter({ setMapRef }) {
  const map = useMap();
  
  useEffect(() => {
    setMapRef(map);
  }, [map, setMapRef]);
  
  return null;
}

/* ===================== ZOOM TRACKER ===================== */
function ZoomTracker({ setZoom }) {
  const map = useMap();
  
  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    setZoom(map.getZoom());
    map.on('zoom', onZoom);
    return () => map.off('zoom', onZoom);
  }, [map, setZoom]);
  
  return null;
}

/* ===================== HEATMAP LABELS ===================== */
function HeatmapLabels({ lands }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on('zoom', onZoom);
    return () => map.off('zoom', onZoom);
  }, [map]);

  if (zoom < 10) return null;

  const trendingLands = lands
    .filter(l => l.heat > 0.15)
    .sort((a, b) => b.heat - a.heat)
    .slice(0, 8);

  return (
    <>
      {trendingLands.map(land => (
        <Marker
          key={`label-${land.id}`}
          position={[+land.lat, +land.lng]}
          icon={L.divIcon({
            className: '',
            html: `
              <div style="
                background: rgba(239, 68, 68, 0.95);
                color: white;
                padding: 6px 12px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                pointer-events: none;
              ">
                🔥 ${land.title}
              </div>
            `,
            iconSize: [120, 30],
            iconAnchor: [60, 15],
          })}
        />
      ))}
    </>
  );
}

/* ===================== HEATMAP LEGEND ===================== */
function HeatmapLegend({ show }) {
  if (!show) return null;

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
      <div className="text-xs font-semibold mb-2">Activity Level</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-24 h-4 rounded" style={{
            background: 'linear-gradient(to right, rgba(16,185,129,0.6), rgba(251,191,36,0.7), rgba(239,68,68,0.9))'
          }}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}

/* ===================== MARKER HELPERS ===================== */
function getPriceColor(priceNaira) {
  if (priceNaira < 2000) return "#22c55e";
  if (priceNaira < 5000) return "#facc15";
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
  const [currentZoom, setCurrentZoom] = useState(8);

  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const mapSectionRef = useRef(null);

  /* ===================== FETCH ===================== */
  useEffect(() => {
    (async () => {
      try {
        const landsRes = await api.get("/lands");
        setLands(landsRes.data.data);
        setVisibleLands(landsRes.data.data);
      } catch (err) {
        setError("Failed to load lands");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Separate lands by geometry type
  const landsWithPoints = useMemo(
    () => lands.filter((l) => l.lat && l.lng && !l.has_polygon),
    [lands]
  );

  const landsWithPolygons = useMemo(
    () => lands.filter((l) => l.has_polygon && l.polygon),
    [lands]
  );

  const allLandsWithCoords = useMemo(
    () => [...landsWithPoints, ...landsWithPolygons],
    [landsWithPoints, landsWithPolygons]
  );

  /* ===================== VIEWPORT FILTER ===================== */
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const update = () => {
      const bounds = map.getBounds();
      setVisibleLands(
        lands.filter((l) => {
          if (l.lat && l.lng && !l.has_polygon) {
            return bounds.contains([+l.lat, +l.lng]);
          }
          if (l.has_polygon && l.polygon) {
            return l.polygon.some(p => bounds.contains([p.lat, p.lng]));
          }
          return false;
        })
      );
    };

    map.on("moveend", update);
    update();

    return () => map.off("moveend", update);
  }, [lands]);

  /* ===================== FULLSCREEN BODY SCROLL LOCK ===================== */
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);

  /* ===================== HEATMAP ===================== */
  useEffect(() => {
    if (!mapRef.current) return;

    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (showHeatmap && allLandsWithCoords.length > 0) {
      const heatPoints = allLandsWithCoords.map((l) => [
        +l.lat,
        +l.lng,
        Math.max(0.1, Math.min(l.heat ?? 0.5, 1)),
      ]);

      const layer = L.heatLayer(heatPoints, {
        radius: 50,
        blur: 30,
        maxZoom: 17,
        max: 1.0,
        minOpacity: 0.4,
        gradient: {
          0.0: 'rgba(59, 130, 246, 0)',
          0.2: 'rgba(16, 185, 129, 0.6)',
          0.4: 'rgba(251, 191, 36, 0.7)',
          0.6: 'rgba(245, 158, 11, 0.8)',
          0.8: 'rgba(239, 68, 68, 0.9)',
          1.0: 'rgba(220, 38, 38, 1)'
        }
      });

      layer.addTo(mapRef.current);

      const container = layer._container;
      if (container) {
        container.style.opacity = '0';
        container.style.transition = 'opacity 0.5s ease-in-out';
        setTimeout(() => {
          container.style.opacity = '1';
        }, 10);
      }

      heatLayerRef.current = layer;
    }
  }, [showHeatmap, allLandsWithCoords]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">Loading lands...</div>
      </div>
    );

  if (error)
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  const defaultCenter = allLandsWithCoords.length
    ? [+allLandsWithCoords[0].lat, +allLandsWithCoords[0].lng]
    : [9.082, 8.6753];

  const allMapPoints = [
    ...landsWithPoints.map((l) => [+l.lat, +l.lng]),
    ...landsWithPolygons.flatMap((l) => 
      l.polygon.map(p => [p.lat, p.lng])
    )
  ];

  // Show markers for polygons when zoomed out (< 12), polygons when zoomed in
  const showPolygonMarkers = currentZoom < 12;

  const renderMapContent = () => (
    <>
      {!showHeatmap && (
        <>
          {/* Point-based lands - always show as markers */}
          <MarkerClusterGroup>
            {landsWithPoints.map((land) => {
              const active = land.id === activeLandId || land.id === hoverLandId;

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
                    <div className="text-sm">
                      <strong className="block mb-1">{land.title}</strong>
                      <div className="text-gray-600">{land.location}</div>
                      <div className="font-semibold mt-1">
                        ₦{koboToNaira(land.price_per_unit_kobo).toLocaleString()}/unit
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {land.available_units.toLocaleString()} units available
                      </div>
                      <Link
                        to={`/lands/${land.id}`}
                        className="text-blue-600 hover:underline text-xs block mt-2"
                      >
                        View Details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Polygon-based lands - show as markers when zoomed out */}
            {showPolygonMarkers && landsWithPolygons.map((land) => {
              const active = land.id === activeLandId || land.id === hoverLandId;

              return (
                <Marker
                  key={`marker-${land.id}`}
                  position={[+land.lat, +land.lng]}
                  icon={createMarkerIcon({
                    priceKobo: land.price_per_unit_kobo,
                    units: land.available_units,
                    active,
                  })}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong className="block mb-1">{land.title}</strong>
                      <div className="text-gray-600">{land.location}</div>
                      <div className="font-semibold mt-1">
                        ₦{koboToNaira(land.price_per_unit_kobo).toLocaleString()}/unit
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {land.available_units.toLocaleString()} units available
                      </div>
                      <Link
                        to={`/lands/${land.id}`}
                        className="text-blue-600 hover:underline text-xs block mt-2"
                      >
                        View Details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>

          {/* Polygon-based lands - show as polygons when zoomed in */}
          {!showPolygonMarkers && landsWithPolygons.map((land) => {
            const active = land.id === activeLandId || land.id === hoverLandId;
            
            return (
              <Polygon
                key={`polygon-${land.id}`}
                positions={land.polygon.map(p => [p.lat, p.lng])}
                pathOptions={{
                  color: getPriceColor(koboToNaira(land.price_per_unit_kobo)),
                  fillColor: getPriceColor(koboToNaira(land.price_per_unit_kobo)),
                  fillOpacity: active ? 0.5 : 0.3,
                  weight: active ? 3 : 2,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <strong className="block mb-1">{land.title}</strong>
                    <div className="text-gray-600">{land.location}</div>
                    <div className="font-semibold mt-1">
                      ₦{koboToNaira(land.price_per_unit_kobo).toLocaleString()}/unit
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {land.available_units.toLocaleString()} units available
                    </div>
                    <Link
                      to={`/lands/${land.id}`}
                      className="text-blue-600 hover:underline text-xs block mt-2"
                    >
                      View Details →
                    </Link>
                  </div>
                </Popup>
              </Polygon>
            );
          })}
        </>
      )}
    </>
  );

  return (
    <>
      {/* Fullscreen overlay */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[9999] bg-white">
          <div className="absolute top-4 right-4 z-[10000] flex gap-2">
            <button
              onClick={() => setIsFullScreen(false)}
              className="bg-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition font-medium border border-gray-200"
            >
              ✕ Close Fullscreen
            </button>

            <button
              onClick={() => setShowHeatmap((v) => !v)}
              className={`
                px-4 py-2 rounded-lg shadow-lg font-medium transition-all
                ${showHeatmap 
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }
              `}
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <span>{showHeatmap ? "Hide Heatmap" : "Show Heatmap"}</span>
              </span>
            </button>
          </div>

          <MapContainer
            attributionControl={false} 
            center={defaultCenter}
            zoom={8}
            className="h-full w-full"
          >
            <AttributionControl prefix={false} />
            <MapRefSetter setMapRef={(map) => { mapRef.current = map; }} />
            <ZoomTracker setZoom={setCurrentZoom} />

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

            {renderMapContent()}

            {showHeatmap && <HeatmapLabels lands={allLandsWithCoords} />}
            
            <HeatmapLegend show={showHeatmap} />

            <FitBounds points={allMapPoints} />
            <MapFlyController target={flyTarget} />
            <MapInvalidate isFullScreen={isFullScreen} />
          </MapContainer>
        </div>
      )}

      {/* Normal page content */}
      <div className="space-y-10 px-4 sm:px-8 pb-10">
        {!isFullScreen && (
          <div
            ref={mapSectionRef}
            className="relative rounded-xl overflow-hidden shadow-lg"
          >
            <div className="absolute top-3 right-3 z-[2000] flex gap-2">
              <button
                onClick={() => setIsFullScreen(true)}
                className="bg-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition font-medium border border-gray-200"
              >
                ⛶ Fullscreen
              </button>

              <button
                onClick={() => setShowHeatmap((v) => !v)}
                className={`
                  px-4 py-2 rounded-lg shadow-lg font-medium transition-all
                  ${showHeatmap 
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600" 
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <span>{showHeatmap ? "Hide Heatmap" : "Show Heatmap"}</span>
                </span>
              </button>
            </div>

            <MapContainer
              attributionControl={false} 
              center={defaultCenter}
              zoom={8}
              className="h-[500px] w-full"
            >
              <AttributionControl prefix={false} />
              <MapRefSetter setMapRef={(map) => { mapRef.current = map; }} />
              <ZoomTracker setZoom={setCurrentZoom} />

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

              {renderMapContent()}

              {showHeatmap && <HeatmapLabels lands={allLandsWithCoords} />}
              
              <HeatmapLegend show={showHeatmap} />

              <FitBounds points={allMapPoints} />
              <MapFlyController target={flyTarget} />
              <MapInvalidate isFullScreen={isFullScreen} />
            </MapContainer>
          </div>
        )}

        {/* Cards */}
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
                <p className="mt-2 font-medium text-lg">
                  ₦{koboToNaira(land.price_per_unit_kobo).toLocaleString()}
                  <span className="text-sm text-gray-500">/unit</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {land.available_units.toLocaleString()} units available
                </p>
                
                <div className="mt-4 space-y-2">
                  <Link
                    to={`/lands/${land.id}`}
                    className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium text-center"
                  >
                    View Details
                  </Link>
                  
                  <button
                    onClick={() => {
                      if (showHeatmap) {
                        setShowHeatmap(false);
                      }
                      
                      if (isFullScreen) {
                        setIsFullScreen(false);
                      }
                      
                      setTimeout(() => {
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
                          
                          setTimeout(() => {
                            setActiveLandId(null);
                          }, 3000);
                        }, 400);
                      }, 100);
                    }}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition font-medium flex items-center justify-center gap-2"
                  >
                    <span>📍</span>
                    <span>View on Map</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}