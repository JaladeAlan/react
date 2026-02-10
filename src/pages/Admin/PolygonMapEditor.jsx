import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";

// Fix for default marker icons in webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/**
 * PolygonMapEditor Component with OpenStreetMap
 * 
 * Three ways to input polygon coordinates:
 * 1. Draw on OpenStreetMap
 * 2. Manual coordinate input (paste JSON or enter points)
 * 3. Upload GeoJSON file
 * 
 * Props:
 * - polygon: GeoJSON polygon object { type: "Polygon", coordinates: [...] }
 * - onChange: callback function that receives the updated GeoJSON polygon
 */
export default function PolygonMapEditor({ polygon, onChange }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const [inputMode, setInputMode] = useState("draw"); // draw | manual | upload
  const [manualInput, setManualInput] = useState("");
  const [pointsList, setPointsList] = useState([]);
  const [error, setError] = useState("");

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Get center from existing polygon or default to Lagos
    const center = polygon 
      ? getCenterFromPolygon(polygon)
      : [6.5244, 3.3792];

    // Initialize map
    const map = L.map(mapRef.current).setView(center, polygon ? 15 : 12);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Initialize FeatureGroup for drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Initialize draw control
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: "#2563eb",
            fillOpacity: 0.3,
          },
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems,
      },
    });
    map.addControl(drawControl);

    // Handle polygon creation
    map.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      
      // Clear existing polygons
      drawnItems.clearLayers();
      
      // Add new polygon
      drawnItems.addLayer(layer);
      
      // Convert to GeoJSON
      const geoJson = layerToGeoJSON(layer);
      onChange(geoJson);
    });

    // Handle polygon edit
    map.on(L.Draw.Event.EDITED, (e) => {
      const layers = e.layers;
      layers.eachLayer((layer) => {
        const geoJson = layerToGeoJSON(layer);
        onChange(geoJson);
      });
    });

    // Handle polygon delete
    map.on(L.Draw.Event.DELETED, () => {
      onChange(null);
    });

    // Load existing polygon if provided
    if (polygon) {
      loadExistingPolygon(drawnItems, polygon, map);
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map when polygon changes externally
  useEffect(() => {
    if (!drawnItemsRef.current || !mapInstanceRef.current) return;

    const drawnItems = drawnItemsRef.current;
    const map = mapInstanceRef.current;

    // Clear existing layers
    drawnItems.clearLayers();

    // Load new polygon
    if (polygon) {
      loadExistingPolygon(drawnItems, polygon, map);
    }
  }, [polygon]);

  const loadExistingPolygon = (drawnItems, geoJsonPolygon, map) => {
    if (!geoJsonPolygon?.coordinates?.[0]) return;

    // Convert GeoJSON to Leaflet LatLng format
    const latLngs = geoJsonPolygon.coordinates[0].map(([lng, lat]) => [lat, lng]);

    // Create polygon
    const polygon = L.polygon(latLngs, {
      color: "#2563eb",
      fillOpacity: 0.3,
    });

    // Add to map
    drawnItems.addLayer(polygon);

    // Fit bounds
    map.fitBounds(polygon.getBounds());
  };

  const layerToGeoJSON = (layer) => {
    const latLngs = layer.getLatLngs()[0];
    const coordinates = latLngs.map((latLng) => [latLng.lng, latLng.lat]);
    
    // Close the polygon
    coordinates.push(coordinates[0]);

    return {
      type: "Polygon",
      coordinates: [coordinates],
    };
  };

  const getCenterFromPolygon = (geoJsonPolygon) => {
    if (!geoJsonPolygon?.coordinates?.[0]) {
      return [6.5244, 3.3792];
    }

    const coords = geoJsonPolygon.coordinates[0];
    const latSum = coords.reduce((sum, [lng, lat]) => sum + lat, 0);
    const lngSum = coords.reduce((sum, [lng, lat]) => sum + lng, 0);
    
    return [latSum / coords.length, lngSum / coords.length];
  };

  // Handle manual input (JSON)
  const handleManualSubmit = () => {
    setError("");
    
    try {
      const parsed = JSON.parse(manualInput);
      
      // Validate structure
      if (parsed.type !== "Polygon") {
        throw new Error("GeoJSON type must be 'Polygon'");
      }
      
      if (!Array.isArray(parsed.coordinates?.[0])) {
        throw new Error("Invalid coordinates structure");
      }

      // Validate coordinates
      const coords = parsed.coordinates[0];
      if (coords.length < 4) {
        throw new Error("Polygon must have at least 4 points (including closing point)");
      }

      // Check if closed
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        throw new Error("Polygon must be closed (first point must equal last point)");
      }

      onChange(parsed);
      setManualInput("");
      setInputMode("draw");
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle point-by-point input
  const handleAddPoint = (lat, lng) => {
    setError("");
    
    if (!lat || !lng) {
      setError("Both latitude and longitude are required");
      return;
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setError("Invalid coordinate values");
      return;
    }

    if (latNum < -90 || latNum > 90) {
      setError("Latitude must be between -90 and 90");
      return;
    }

    if (lngNum < -180 || lngNum > 180) {
      setError("Longitude must be between -180 and 180");
      return;
    }

    setPointsList([...pointsList, [lngNum, latNum]]);
  };

  const handleRemovePoint = (index) => {
    setPointsList(pointsList.filter((_, i) => i !== index));
  };

  const handleCreateFromPoints = () => {
    if (pointsList.length < 3) {
      setError("At least 3 unique points are required to create a polygon");
      return;
    }

    // Close the polygon (add first point at the end)
    const coordinates = [...pointsList, pointsList[0]];

    const polygon = {
      type: "Polygon",
      coordinates: [coordinates],
    };

    onChange(polygon);
    setPointsList([]);
    setInputMode("draw");
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    setError("");
    const file = e.target.files[0];
    
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        
        // Handle both GeoJSON Feature and direct Polygon
        let polygon;
        if (json.type === "Feature" && json.geometry?.type === "Polygon") {
          polygon = json.geometry;
        } else if (json.type === "Polygon") {
          polygon = json;
        } else if (json.type === "FeatureCollection" && json.features?.[0]?.geometry?.type === "Polygon") {
          polygon = json.features[0].geometry;
        } else {
          throw new Error("File must contain a Polygon geometry");
        }

        onChange(polygon);
        setInputMode("draw");
      } catch (err) {
        setError("Invalid GeoJSON file: " + err.message);
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="space-y-3">
      {/* Input Mode Tabs */}
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => setInputMode("draw")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            inputMode === "draw"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Draw on Map
        </button>
        <button
          type="button"
          onClick={() => setInputMode("manual")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            inputMode === "manual"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Manual Input
        </button>
        <button
          type="button"
          onClick={() => setInputMode("upload")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            inputMode === "upload"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Upload File
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Map View (always visible) */}
      <div ref={mapRef} className="w-full h-96 rounded border border-gray-300 z-0" />

      {/* Input Sections */}
      {inputMode === "draw" && (
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">Draw Mode:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click the polygon icon (⬟) in the top-left of the map</li>
            <li>Click on the map to add points</li>
            <li>Click the first point again to close the polygon</li>
            <li>Use the edit (✎) and delete (🗑) tools to modify</li>
          </ul>
          {polygon && (
            <p className="mt-2 text-green-600 font-medium">
              ✓ Polygon created ({polygon.coordinates[0].length - 1} points)
            </p>
          )}
        </div>
      )}

      {inputMode === "manual" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Paste GeoJSON */}
            <div className="col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium mb-1">Paste GeoJSON</label>
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder='{"type":"Polygon","coordinates":[[[lng,lat],...]]}'
                className="w-full p-2 border rounded text-xs font-mono h-32"
              />
              <button
                type="button"
                onClick={handleManualSubmit}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Load from JSON
              </button>
            </div>

            {/* Point-by-Point Input */}
            <div className="col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium mb-1">Add Points One-by-One</label>
              <PointInput onAdd={handleAddPoint} />
              
              {pointsList.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
                  <div className="text-xs font-medium mb-2">
                    Points ({pointsList.length}/3 minimum):
                  </div>
                  {pointsList.map((point, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1 border-b last:border-0">
                      <span className="font-mono">
                        {i + 1}. [{point[1].toFixed(6)}, {point[0].toFixed(6)}]
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(i)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleCreateFromPoints}
                    disabled={pointsList.length < 3}
                    className="mt-2 w-full px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                  >
                    Create Polygon {pointsList.length >= 3 ? '(Will auto-close)' : ''}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {inputMode === "upload" && (
        <div className="bg-gray-50 p-4 rounded">
          <label className="block text-sm font-medium mb-2">Upload GeoJSON File</label>
          <input
            type="file"
            accept=".json,.geojson"
            onChange={handleFileUpload}
            className="w-full text-sm"
          />
          <p className="text-xs text-gray-600 mt-2">
            Supported formats: GeoJSON Polygon, Feature, or FeatureCollection
          </p>
        </div>
      )}

      {/* Current Polygon Info */}
      {polygon && (
        <div className="bg-blue-50 p-3 rounded text-xs">
          <div className="font-medium mb-1">Current Polygon:</div>
          <div className="font-mono text-[10px] bg-white p-2 rounded overflow-x-auto">
            {JSON.stringify(polygon, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for point input
function PointInput({ onAdd }) {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const handleAdd = () => {
    onAdd(lat, lng);
    setLat("");
    setLng("");
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="Latitude"
          className="p-2 border rounded text-sm"
        />
        <input
          type="text"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          placeholder="Longitude"
          className="p-2 border rounded text-sm"
        />
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="w-full px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
      >
        Add Point
      </button>
    </div>
  );
}