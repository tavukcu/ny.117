declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: MapTypeId;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
      zoomControlOptions?: ZoomControlOptions;
      gestureHandling?: string;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      animation?: Animation;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface ZoomControlOptions {
      position?: ControlPosition;
    }

    enum MapTypeId {
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      HYBRID = 'hybrid',
      TERRAIN = 'terrain'
    }

    enum ControlPosition {
      TOP_CENTER = 1,
      TOP_LEFT = 2,
      TOP_RIGHT = 3,
      LEFT_CENTER = 4,
      RIGHT_CENTER = 5,
      BOTTOM_LEFT = 6,
      BOTTOM_CENTER = 7,
      BOTTOM_RIGHT = 8
    }

    enum Animation {
      BOUNCE = 1,
      DROP = 2
    }

    interface MapsEventListener {
      remove(): void;
    }
  }
}

export {}; 