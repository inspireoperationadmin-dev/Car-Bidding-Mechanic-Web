export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ReverseGeocodeResult {
  address: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

export interface Suggestion {
  id: string;
  address: string;
  coordinates: Coordinates;
}

const getMapboxToken = () => import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

const geoApi = {
  /**
   * Search for address suggestions using Mapbox
   */
  searchAddress: async (query: string): Promise<Suggestion[]> => {
    const token = getMapboxToken();
    if (!query || query.length < 3 || !token) {
      if (!token) console.warn("[geoApi] Token missing for search");
      return [];
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${token}&autocomplete=true&limit=5`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errData = await response.json();
        console.error("[geoApi] Search Failed:", response.status, errData);
        return [];
      }

      const data = await response.json();
      if (data.features) {
        return data.features.map((feature: any) => ({
          id: feature.id,
          address: feature.place_name,
          coordinates: {
            lng: feature.center[0],
            lat: feature.center[1],
          },
        }));
      }
      return [];
    } catch (error) {
      console.error("[geoApi] Search Error:", error);
      return [];
    }
  },

  /**
   * Reverse geocode coordinates to get address
   */
  reverseGeocode: async (lat: number, lng: number): Promise<ReverseGeocodeResult> => {
    const token = getMapboxToken();
    if (!token) throw new Error("Mapbox token missing");

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errData = await response.json();
        console.error("[geoApi] Geocode Failed:", response.status, errData);
        throw new Error(`Mapbox error: ${response.status}`);
      }

      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const context = feature.context || [];

        let postalCode = "";
        let city = "";
        let country = "";

        for (const ctx of context) {
          if (ctx.id.startsWith("postcode")) {
            postalCode = ctx.text;
          } else if (ctx.id.startsWith("place")) {
            city = ctx.text;
          } else if (ctx.id.startsWith("country")) {
            country = ctx.text;
          }
        }

        return {
          address: feature.place_name,
          postalCode,
          city,
          country,
        };
      }
      throw new Error("No address found");
    } catch (error) {
      console.error("[geoApi] Geocode Error:", error);
      throw error;
    }
  },
};

export default geoApi;
