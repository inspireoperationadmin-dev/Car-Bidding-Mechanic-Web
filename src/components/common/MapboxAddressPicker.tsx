import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, LocateFixed, Loader2, AlertCircle } from "lucide-react";
import geoApi, { type Suggestion } from "../../api/geoApi";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface MapboxAddressPickerProps {
  onChange: (address: string) => void;
  onPostalCodeChange?: (postalCode: string) => void;
  value?: string;
  postalCodeValue?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  extraEndAdornment?: React.ReactNode;
}

const MapboxAddressPicker: React.FC<MapboxAddressPickerProps> = ({
  onChange,
  onPostalCodeChange,
  value = "",
  postalCodeValue = "",
  error,
  helperText,
  disabled,
  extraEndAdornment,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isProgrammaticChangeRef = useRef(false);

  const [inputValue, setInputValue] = useState(value);
  const [postalCode, setPostalCode] = useState(postalCodeValue);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync internal state with external value prop
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      isProgrammaticChangeRef.current = true;
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (postalCodeValue !== undefined && postalCodeValue !== postalCode) {
      setPostalCode(postalCodeValue);
    }
  }, [postalCodeValue]);

  const [options, setOptions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const handlePinLocation = useCallback(
    async (lat: number, lng: number) => {
      if (!map.current) return;

      console.log(`Pinning location: Lat ${lat}, Lng ${lng}`);

      if (!marker.current) {
        marker.current = new mapboxgl.Marker({ color: "#0EA5E9" })
          .setLngLat([lng, lat])
          .addTo(map.current);
      } else {
        marker.current.setLngLat([lng, lat]);
      }

      map.current.flyTo({ center: [lng, lat], zoom: 15 });

      try {
        setLoading(true);
        const result = await geoApi.reverseGeocode(lat, lng);
        console.log("Reverse Geocode Result:", result);
        isProgrammaticChangeRef.current = true;
        setOpen(false);
        setOptions([]);
        setInputValue(result.address);
        onChange(result.address);

        if (result.postalCode || result.address) {
          const pCode = result.postalCode || "";
          setPostalCode(pCode);
          if (onPostalCodeChange) onPostalCodeChange(pCode);
        }
      } catch (err) {
        console.error("Reverse Geocode Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [onChange, onPostalCodeChange]
  );

  const handlePinLocationRef = useRef(handlePinLocation);
  useEffect(() => {
    handlePinLocationRef.current = handlePinLocation;
  }, [handlePinLocation]);

  const disabledRef = useRef(disabled);
  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error("VITE_MAPBOX_ACCESS_TOKEN is missing!");
      setTokenError("Missing Token");
      return;
    }

    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [79.8612, 6.9271], // Colombo default
        zoom: 12,
        attributionControl: false,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        console.log("Map Loaded Successfully");
        map.current?.resize();
      });

      map.current.on("error", (e) => {
        const mapError = e as any;
        console.error("Mapbox GL Error:", mapError);
        if (mapError.error?.status === 401 || mapError.error?.status === 403) {
          setTokenError("Invalid or Restricted Token");
        }
      });

      map.current.on("click", (e) => {
        if (disabledRef.current) return;
        handlePinLocationRef.current(e.lngLat.lat, e.lngLat.lng);
      });
    } catch (err) {
      console.error("Map Initialization Error:", err);
      setTokenError("Initialization Failed");
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (isProgrammaticChangeRef.current) {
      isProgrammaticChangeRef.current = false;
      return;
    }

    if (inputValue.length < 3) {
      setOptions([]);
      setOpen(false);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const results = await geoApi.searchAddress(inputValue);
        if (active) {
          setOptions(results);
          if (results.length > 0) setOpen(true);
        }
      } catch (err) {
        console.error("Search Fetch Error:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 450);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputValue]);

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    isProgrammaticChangeRef.current = true;
    setOpen(false);
    setOptions([]);
    setInputValue(suggestion.address);
    onChange(suggestion.address);

    if (map.current) {
      if (!marker.current) {
        marker.current = new mapboxgl.Marker({ color: "#0EA5E9" })
          .setLngLat([suggestion.coordinates.lng, suggestion.coordinates.lat])
          .addTo(map.current);
      } else {
        marker.current.setLngLat([suggestion.coordinates.lng, suggestion.coordinates.lat]);
      }
      map.current.flyTo({ center: [suggestion.coordinates.lng, suggestion.coordinates.lat], zoom: 15 });
    }

    if (suggestion.postalCode) {
      setPostalCode(suggestion.postalCode);
      if (onPostalCodeChange) onPostalCodeChange(suggestion.postalCode);
    } else {
      geoApi.reverseGeocode(suggestion.coordinates.lat, suggestion.coordinates.lng).then((res) => {
        if (res.postalCode) {
          setPostalCode(res.postalCode);
          if (onPostalCodeChange) onPostalCodeChange(res.postalCode);
        }
      }).catch(console.error);
    }
  };

  const centerToCurrentLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => handlePinLocation(pos.coords.latitude, pos.coords.longitude),
        (err) => console.error("Geolocation Error:", err)
      );
    }
  };

  return (
    <div className="space-y-4 mt-2">
      {/* Search Input with Autocomplete */}
      <div className="relative space-y-1.5" ref={dropdownRef}>
        <Label className="text-xs font-semibold text-foreground">Shop Address</Label>
        <div className="relative">
          <MapPin
            className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
              tokenError ? "text-destructive" : "text-primary"
            }`}
          />
          <Input
            value={inputValue}
            onChange={(e) => {
              isProgrammaticChangeRef.current = false;
              setInputValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (options.length > 0) setOpen(true);
            }}
            placeholder="Search your shop location..."
            disabled={disabled}
            className={`pl-9 pr-20 h-10 text-sm ${error || tokenError ? "border-destructive" : ""}`}
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            {extraEndAdornment}
            <button
              type="button"
              onClick={centerToCurrentLocation}
              disabled={disabled}
              title="Locate my current position"
              className="p-1 rounded-md text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              <LocateFixed className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Helper / Error text */}
        {(helperText || tokenError) && (
          <p
            className={`text-xs ${
              tokenError || error ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {tokenError ? `Map Error: ${tokenError}` : helperText}
          </p>
        )}

        {/* Autocomplete Dropdown */}
        {open && options.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md p-1 shadow-xl text-popover-foreground animate-in fade-in zoom-in-95">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectSuggestion(option)}
                className="w-full flex items-start gap-2.5 px-3 py-2 text-left text-xs rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span className="font-medium line-clamp-1">{option.address}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Postal Code Auto-filled */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-foreground">Postal Code (Auto-filled)</Label>
        <Input
          value={postalCode}
          readOnly
          disabled={disabled}
          placeholder="Auto-filled from map..."
          className="h-10 text-sm bg-muted/40 font-mono text-muted-foreground cursor-not-allowed"
        />
      </div>

      {/* Map Container */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground">Pin Location on Map</Label>
          <span className="text-[11px] text-muted-foreground">Tap map to adjust marker</span>
        </div>

        <div
          ref={mapContainer}
          className={`relative h-60 w-full rounded-xl overflow-hidden border shadow-sm ${
            error || tokenError ? "border-destructive" : "border-border/80"
          }`}
        >
          {tokenError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center bg-background/90 backdrop-blur-sm">
              <AlertCircle className="w-8 h-8 text-destructive mb-1" />
              <p className="text-sm font-bold text-destructive">
                {tokenError === "Missing Token" ? "Mapbox Token Missing" : "Mapbox API Error"}
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mt-0.5">
                {tokenError === "Missing Token"
                  ? "Check VITE_MAPBOX_ACCESS_TOKEN in .env"
                  : "The token might be restricted or expired."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapboxAddressPicker;
