import { useEffect, useRef, useState } from "react";

/**
 * PolygonMapEditor Component
 * 
 * Allows users to draw polygons on Google Maps and outputs GeoJSON format
 * 
 * Props:
 * - polygon: GeoJSON polygon object { type: "Polygon", coordinates: [...] }
 * - onChange: callback function that receives the updated GeoJSON polygon
 */
export default function PolygonMapEditor({ polygon, onChange }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps API if not already loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=drawing`;
      script.async = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const center = polygon 
      ? getCenterFromPolygon(polygon)
      : { lat: 6.5244, lng: 3.3792 }; // Default to Lagos, Nigeria

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: polygon ? 15 : 12,
      mapTypeId: "hybrid",
    });

    mapInstanceRef.current = map;

    // Initialize Drawing Manager
    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: polygon ? null : window.google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
      },
      polygonOptions: {
        fillColor: "#2563eb",
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: "#1d4ed8",
        editable: true,
        draggable: true,
      },
    });

    drawingManager.setMap(map);
    drawingManagerRef.current = drawingManager;

    // Handle polygon completion
    window.google.maps.event.addListener(drawingManager, "polygoncomplete", (newPolygon) => {
      // Remove existing polygon
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
      }

      polygonRef.current = newPolygon;
      drawingManager.setDrawingMode(null);

      // Convert to GeoJSON and call onChange
      const geoJson = polygonToGeoJSON(newPolygon);
      onChange(geoJson);

      // Add listeners for editing
      addPolygonListeners(newPolygon);
    });

    // Load existing polygon if provided
    if (polygon) {
      loadExistingPolygon(map, polygon);
    }

    return () => {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
      }
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setMap(null);
      }
    };
  }, [isLoaded]);

  const loadExistingPolygon = (map, geoJsonPolygon) => {
    if (!geoJsonPolygon?.coordinates?.[0]) return;

    // Convert GeoJSON to Google Maps LatLng format
    const paths = geoJsonPolygon.coordinates[0].map(([lng, lat]) => ({
      lat,
      lng,
    }));

    const polygon = new window.google.maps.Polygon({
      paths,
      fillColor: "#2563eb",
      fillOpacity: 0.3,
      strokeWeight: 2,
      strokeColor: "#1d4ed8",
      editable: true,
      draggable: true,
    });

    polygon.setMap(map);
    polygonRef.current = polygon;

    // Add listeners for editing
    addPolygonListeners(polygon);

    // Fit bounds to polygon
    const bounds = new window.google.maps.LatLngBounds();
    paths.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds);
  };

  const addPolygonListeners = (polygon) => {
    // Listen for path changes
    const path = polygon.getPath();
    
    window.google.maps.event.addListener(path, "set_at", () => {
      onChange(polygonToGeoJSON(polygon));
    });

    window.google.maps.event.addListener(path, "insert_at", () => {
      onChange(polygonToGeoJSON(polygon));
    });

    window.google.maps.event.addListener(path, "remove_at", () => {
      onChange(polygonToGeoJSON(polygon));
    });

    // Listen for drag end
    window.google.maps.event.addListener(polygon, "dragend", () => {
      onChange(polygonToGeoJSON(polygon));
    });
  };

  const polygonToGeoJSON = (polygon) => {
    const path = polygon.getPath();
    const coordinates = [];

    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push([point.lng(), point.lat()]);
    }

    // Close the polygon (first point = last point)
    if (coordinates.length > 0) {
      coordinates.push(coordinates[0]);
    }

    return {
      type: "Polygon",
      coordinates: [coordinates],
    };
  };

  const getCenterFromPolygon = (geoJsonPolygon) => {
    if (!geoJsonPolygon?.coordinates?.[0]) {
      return { lat: 6.5244, lng: 3.3792 };
    }

    const coords = geoJsonPolygon.coordinates[0];
    const latSum = coords.reduce((sum, [lng, lat]) => sum + lat, 0);
    const lngSum = coords.reduce((sum, [lng, lat]) => sum + lng, 0);
    
    return {
      lat: latSum / coords.length,
      lng: lngSum / coords.length,
    };
  };

  const handleClear = () => {
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
      onChange(null);
      
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setDrawingMode(
          window.google.maps.drawing.OverlayType.POLYGON
        );
      }
    }
  };

  return (
    <div className="space-y-2">
      <div
        ref={mapRef}
        className="w-full h-96 rounded border border-gray-300"
      />
      
      {polygon && (
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Clear Polygon
        </button>
      )}
      
      <p className="text-xs text-gray-500">
        {!polygon 
          ? "Click on the polygon tool above the map, then click points to draw a polygon. Click the first point again to close it."
          : "You can edit the polygon by dragging points or edges. Click 'Clear Polygon' to start over."}
      </p>
    </div>
  );
}