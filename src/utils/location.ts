import { LocationData } from '../types';

export const POPULAR_LOCATIONS: LocationData[] = [
  {
    placeName: 'Times Square',
    address: 'Broadway & 7th Ave, New York, NY 10036',
    latitude: 40.758,
    longitude: -73.9855,
  },
  {
    placeName: 'Central Park Terrace',
    address: 'Terrace Dr, New York, NY 10024',
    latitude: 40.7711,
    longitude: -73.9742,
  },
  {
    placeName: 'London Tower Bridge',
    address: 'Tower Bridge Rd, London SE1 2UP, UK',
    latitude: 51.5055,
    longitude: -0.0754,
  },
  {
    placeName: 'Eiffel Tower Esplanade',
    address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris, France',
    latitude: 48.8584,
    longitude: 2.2945,
  },
  {
    placeName: 'Shibuya Crossing',
    address: '2 Chome-2-1 Dogenzaka, Shibuya City, Tokyo 150-0043, Japan',
    latitude: 35.6595,
    longitude: 139.7005,
  },
  {
    placeName: 'Silicon Valley Tech Campus',
    address: '1 Hacker Way, Menlo Park, CA 94025',
    latitude: 37.4848,
    longitude: -122.1484,
  },
];

export async function getCurrentBrowserLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        resolve({
          latitude: lat,
          longitude: lng,
          placeName: 'My Live Location',
          address: `Precise Coordinates: ${lat > 0 ? `${lat}°N` : `${Math.abs(lat)}°S`}, ${lng > 0 ? `${lng}°E` : `${Math.abs(lng)}°W`}`,
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 10000,
      }
    );
  });
}

/**
 * Draws a clean stylized vector map on a canvas for location preview cards
 */
export function drawVectorMap(
  canvas: HTMLCanvasElement,
  lat: number,
  lng: number,
  placeName: string
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // Background landmass
  ctx.fillStyle = '#f0f3f6';
  ctx.fillRect(0, 0, w, h);

  // Deterministic pseudo-random road network based on lat/long
  const seed = Math.abs(Math.sin(lat * 100 + lng * 50));
  
  // River or water feature
  ctx.fillStyle = '#cde2f8';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.7);
  ctx.bezierCurveTo(w * 0.3, h * 0.8 + seed * 20, w * 0.6, h * 0.5, w, h * 0.65);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Green parks
  ctx.fillStyle = '#d2edd7';
  ctx.beginPath();
  ctx.roundRect(w * 0.08, h * 0.15, w * 0.28, h * 0.35, 8);
  ctx.roundRect(w * 0.65, h * 0.2, w * 0.25, h * 0.25, 6);
  ctx.fill();

  // Primary & secondary roads
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';

  // Major Avenue
  ctx.beginPath();
  ctx.moveTo(w * 0.2, 0);
  ctx.lineTo(w * 0.45, h);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, h * 0.45);
  ctx.lineTo(w, h * 0.4);
  ctx.stroke();

  // Grid lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (h / 5) * i);
    ctx.lineTo(w, (h / 5) * i + 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo((w / 5) * i, 0);
    ctx.lineTo((w / 5) * i + 15, h);
    ctx.stroke();
  }

  // Draw Center Marker Pin
  const cx = w / 2;
  const cy = h / 2 - 10;

  // Pin shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 24, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pin body
  ctx.fillStyle = '#ef4444'; // Red WhatsApp map pin
  ctx.beginPath();
  ctx.arc(cx, cy, 14, Math.PI, 0, false);
  ctx.lineTo(cx, cy + 24);
  ctx.closePath();
  ctx.fill();

  // Pin inner white dot
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Place label badge on map
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  const label = placeName.length > 20 ? placeName.slice(0, 20) + '...' : placeName;
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  const textWidth = ctx.measureText(label).width;
  const badgeW = textWidth + 16;
  const badgeH = 22;
  const badgeX = cx - badgeW / 2;
  const badgeY = cy - 36;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 11);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, badgeY + badgeH / 2);
}
