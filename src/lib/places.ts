// Curated list of common cities with coords + tz offset (hours)
export interface PlaceData {
  name: string;
  lat: number;
  lon: number;
  tz: number;
}

export const PLACES: PlaceData[] = [
  // Tamil Nadu major
  { name: "Chennai, Tamil Nadu, India", lat: 13.0827, lon: 80.2707, tz: 5.5 },
  { name: "Coimbatore, Tamil Nadu, India", lat: 11.0168, lon: 76.9558, tz: 5.5 },
  { name: "Madurai, Tamil Nadu, India", lat: 9.9252, lon: 78.1198, tz: 5.5 },
  { name: "Tiruchirappalli, Tamil Nadu, India", lat: 10.7905, lon: 78.7047, tz: 5.5 },
  { name: "Salem, Tamil Nadu, India", lat: 11.6643, lon: 78.146, tz: 5.5 },
  { name: "Tirunelveli, Tamil Nadu, India", lat: 8.7139, lon: 77.7567, tz: 5.5 },
  { name: "Erode, Tamil Nadu, India", lat: 11.341, lon: 77.7172, tz: 5.5 },
  { name: "Vellore, Tamil Nadu, India", lat: 12.9165, lon: 79.1325, tz: 5.5 },
  { name: "Thoothukudi, Tamil Nadu, India", lat: 8.7642, lon: 78.1348, tz: 5.5 },
  { name: "Thanjavur, Tamil Nadu, India", lat: 10.787, lon: 79.1378, tz: 5.5 },
  { name: "Dindigul, Tamil Nadu, India", lat: 10.3673, lon: 77.9803, tz: 5.5 },
  { name: "Kanchipuram, Tamil Nadu, India", lat: 12.8342, lon: 79.7036, tz: 5.5 },
  { name: "Kanyakumari, Tamil Nadu, India", lat: 8.0883, lon: 77.5385, tz: 5.5 },
  { name: "Cuddalore, Tamil Nadu, India", lat: 11.748, lon: 79.7714, tz: 5.5 },
  { name: "Karur, Tamil Nadu, India", lat: 10.9601, lon: 78.0766, tz: 5.5 },
  { name: "Nagercoil, Tamil Nadu, India", lat: 8.1833, lon: 77.4119, tz: 5.5 },
  { name: "Hosur, Tamil Nadu, India", lat: 12.7409, lon: 77.8253, tz: 5.5 },
  { name: "Pondicherry, India", lat: 11.9416, lon: 79.8083, tz: 5.5 },
  // Other India
  { name: "Bengaluru, Karnataka, India", lat: 12.9716, lon: 77.5946, tz: 5.5 },
  { name: "Mumbai, Maharashtra, India", lat: 19.076, lon: 72.8777, tz: 5.5 },
  { name: "Delhi, India", lat: 28.6139, lon: 77.209, tz: 5.5 },
  { name: "Hyderabad, Telangana, India", lat: 17.385, lon: 78.4867, tz: 5.5 },
  { name: "Kolkata, West Bengal, India", lat: 22.5726, lon: 88.3639, tz: 5.5 },
  { name: "Kochi, Kerala, India", lat: 9.9312, lon: 76.2673, tz: 5.5 },
  { name: "Thiruvananthapuram, Kerala, India", lat: 8.5241, lon: 76.9366, tz: 5.5 },
  // Sri Lanka & SE Asia
  { name: "Colombo, Sri Lanka", lat: 6.9271, lon: 79.8612, tz: 5.5 },
  { name: "Jaffna, Sri Lanka", lat: 9.6615, lon: 80.0255, tz: 5.5 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, tz: 8 },
  { name: "Kuala Lumpur, Malaysia", lat: 3.139, lon: 101.6869, tz: 8 },
  // Middle East
  { name: "Dubai, UAE", lat: 25.2048, lon: 55.2708, tz: 4 },
  { name: "Abu Dhabi, UAE", lat: 24.4539, lon: 54.3773, tz: 4 },
  { name: "Doha, Qatar", lat: 25.2854, lon: 51.531, tz: 3 },
  { name: "Riyadh, Saudi Arabia", lat: 24.7136, lon: 46.6753, tz: 3 },
  // West
  { name: "London, UK", lat: 51.5074, lon: -0.1278, tz: 0 },
  { name: "New York, USA", lat: 40.7128, lon: -74.006, tz: -5 },
  { name: "San Francisco, USA", lat: 37.7749, lon: -122.4194, tz: -8 },
  { name: "Toronto, Canada", lat: 43.6532, lon: -79.3832, tz: -5 },
  { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093, tz: 10 },
  { name: "Melbourne, Australia", lat: -37.8136, lon: 144.9631, tz: 10 },
];
