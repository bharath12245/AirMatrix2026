// Comprehensive worldwide airport database with coordinates
export interface Airport {
  city: string;
  code: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
}

// Major worldwide airports
export const worldAirports: Airport[] = [
  // North America
  { city: 'New York', code: 'JFK', name: 'John F. Kennedy International', country: 'USA', lat: 40.6413, lng: -73.7781 },
  { city: 'New York', code: 'LGA', name: 'LaGuardia Airport', country: 'USA', lat: 40.7769, lng: -73.8740 },
  { city: 'New York', code: 'EWR', name: 'Newark Liberty International', country: 'USA', lat: 40.6895, lng: -74.1745 },
  { city: 'Los Angeles', code: 'LAX', name: 'Los Angeles International', country: 'USA', lat: 33.9425, lng: -118.4081 },
  { city: 'Chicago', code: 'ORD', name: "O'Hare International", country: 'USA', lat: 41.9742, lng: -87.9073 },
  { city: 'Chicago', code: 'MDW', name: 'Midway International', country: 'USA', lat: 41.7868, lng: -87.7522 },
  { city: 'Dallas', code: 'DFW', name: 'Dallas/Fort Worth International', country: 'USA', lat: 32.8998, lng: -97.0403 },
  { city: 'Denver', code: 'DEN', name: 'Denver International', country: 'USA', lat: 39.8561, lng: -104.6737 },
  { city: 'San Francisco', code: 'SFO', name: 'San Francisco International', country: 'USA', lat: 37.6213, lng: -122.3790 },
  { city: 'Seattle', code: 'SEA', name: 'Seattle-Tacoma International', country: 'USA', lat: 47.4502, lng: -122.3088 },
  { city: 'Miami', code: 'MIA', name: 'Miami International', country: 'USA', lat: 25.7959, lng: -80.2870 },
  { city: 'Atlanta', code: 'ATL', name: 'Hartsfield-Jackson Atlanta International', country: 'USA', lat: 33.6407, lng: -84.4277 },
  { city: 'Boston', code: 'BOS', name: 'Boston Logan International', country: 'USA', lat: 42.3656, lng: -71.0096 },
  { city: 'Las Vegas', code: 'LAS', name: 'Harry Reid International', country: 'USA', lat: 36.0840, lng: -115.1537 },
  { city: 'Phoenix', code: 'PHX', name: 'Phoenix Sky Harbor International', country: 'USA', lat: 33.4373, lng: -112.0078 },
  { city: 'Houston', code: 'IAH', name: 'George Bush Intercontinental', country: 'USA', lat: 29.9902, lng: -95.3368 },
  { city: 'Philadelphia', code: 'PHL', name: 'Philadelphia International', country: 'USA', lat: 39.8744, lng: -75.2424 },
  { city: 'San Diego', code: 'SAN', name: 'San Diego International', country: 'USA', lat: 32.7336, lng: -117.1897 },
  { city: 'Detroit', code: 'DTW', name: 'Detroit Metropolitan Wayne County', country: 'USA', lat: 42.2162, lng: -83.3554 },
  { city: 'Orlando', code: 'MCO', name: 'Orlando International', country: 'USA', lat: 28.4312, lng: -81.3081 },
  { city: 'Minneapolis', code: 'MSP', name: 'Minneapolis-Saint Paul International', country: 'USA', lat: 44.8848, lng: -93.2223 },
  { city: 'Toronto', code: 'YYZ', name: 'Toronto Pearson International', country: 'Canada', lat: 43.6777, lng: -79.6248 },
  { city: 'Vancouver', code: 'YVR', name: 'Vancouver International', country: 'Canada', lat: 49.1967, lng: -123.1815 },
  { city: 'Montreal', code: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International', country: 'Canada', lat: 45.4706, lng: -73.7408 },
  { city: 'Mexico City', code: 'MEX', name: 'Mexico City International', country: 'Mexico', lat: 19.4363, lng: -99.0721 },
  { city: 'Cancun', code: 'CUN', name: 'Cancún International', country: 'Mexico', lat: 21.0365, lng: -86.8771 },

  // Europe
  { city: 'London', code: 'LHR', name: 'Heathrow Airport', country: 'UK', lat: 51.4700, lng: -0.4543 },
  { city: 'London', code: 'LGW', name: 'Gatwick Airport', country: 'UK', lat: 51.1537, lng: -0.1821 },
  { city: 'London', code: 'STN', name: 'Stansted Airport', country: 'UK', lat: 51.8860, lng: 0.2389 },
  { city: 'Paris', code: 'CDG', name: 'Charles de Gaulle Airport', country: 'France', lat: 49.0097, lng: 2.5479 },
  { city: 'Paris', code: 'ORY', name: 'Orly Airport', country: 'France', lat: 48.7262, lng: 2.3652 },
  { city: 'Frankfurt', code: 'FRA', name: 'Frankfurt Airport', country: 'Germany', lat: 50.0379, lng: 8.5622 },
  { city: 'Munich', code: 'MUC', name: 'Munich Airport', country: 'Germany', lat: 48.3537, lng: 11.7750 },
  { city: 'Berlin', code: 'BER', name: 'Berlin Brandenburg Airport', country: 'Germany', lat: 52.3667, lng: 13.5033 },
  { city: 'Amsterdam', code: 'AMS', name: 'Amsterdam Airport Schiphol', country: 'Netherlands', lat: 52.3105, lng: 4.7683 },
  { city: 'Madrid', code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', country: 'Spain', lat: 40.4983, lng: -3.5676 },
  { city: 'Barcelona', code: 'BCN', name: 'Barcelona–El Prat Airport', country: 'Spain', lat: 41.2974, lng: 2.0833 },
  { city: 'Rome', code: 'FCO', name: 'Leonardo da Vinci–Fiumicino', country: 'Italy', lat: 41.8003, lng: 12.2389 },
  { city: 'Milan', code: 'MXP', name: 'Milan Malpensa Airport', country: 'Italy', lat: 45.6306, lng: 8.7281 },
  { city: 'Zurich', code: 'ZRH', name: 'Zurich Airport', country: 'Switzerland', lat: 47.4647, lng: 8.5492 },
  { city: 'Vienna', code: 'VIE', name: 'Vienna International Airport', country: 'Austria', lat: 48.1103, lng: 16.5697 },
  { city: 'Brussels', code: 'BRU', name: 'Brussels Airport', country: 'Belgium', lat: 50.9014, lng: 4.4844 },
  { city: 'Copenhagen', code: 'CPH', name: 'Copenhagen Airport', country: 'Denmark', lat: 55.6180, lng: 12.6508 },
  { city: 'Stockholm', code: 'ARN', name: 'Stockholm Arlanda Airport', country: 'Sweden', lat: 59.6519, lng: 17.9186 },
  { city: 'Oslo', code: 'OSL', name: 'Oslo Gardermoen Airport', country: 'Norway', lat: 60.1976, lng: 11.1004 },
  { city: 'Helsinki', code: 'HEL', name: 'Helsinki-Vantaa Airport', country: 'Finland', lat: 60.3172, lng: 24.9633 },
  { city: 'Dublin', code: 'DUB', name: 'Dublin Airport', country: 'Ireland', lat: 53.4264, lng: -6.2499 },
  { city: 'Lisbon', code: 'LIS', name: 'Lisbon Humberto Delgado Airport', country: 'Portugal', lat: 38.7756, lng: -9.1354 },
  { city: 'Athens', code: 'ATH', name: 'Athens International Airport', country: 'Greece', lat: 37.9364, lng: 23.9445 },
  { city: 'Istanbul', code: 'IST', name: 'Istanbul Airport', country: 'Turkey', lat: 41.2753, lng: 28.7519 },
  { city: 'Moscow', code: 'SVO', name: 'Sheremetyevo International', country: 'Russia', lat: 55.9736, lng: 37.4125 },
  { city: 'Warsaw', code: 'WAW', name: 'Warsaw Chopin Airport', country: 'Poland', lat: 52.1672, lng: 20.9679 },
  { city: 'Prague', code: 'PRG', name: 'Václav Havel Airport Prague', country: 'Czech Republic', lat: 50.1008, lng: 14.2600 },
  { city: 'Budapest', code: 'BUD', name: 'Budapest Ferenc Liszt International', country: 'Hungary', lat: 47.4298, lng: 19.2611 },

  // Asia
  { city: 'Tokyo', code: 'NRT', name: 'Narita International', country: 'Japan', lat: 35.7720, lng: 140.3929 },
  { city: 'Tokyo', code: 'HND', name: 'Tokyo Haneda', country: 'Japan', lat: 35.5494, lng: 139.7798 },
  { city: 'Osaka', code: 'KIX', name: 'Kansai International', country: 'Japan', lat: 34.4347, lng: 135.2441 },
  { city: 'Beijing', code: 'PEK', name: 'Beijing Capital International', country: 'China', lat: 40.0799, lng: 116.6031 },
  { city: 'Beijing', code: 'PKX', name: 'Beijing Daxing International', country: 'China', lat: 39.5098, lng: 116.4105 },
  { city: 'Shanghai', code: 'PVG', name: 'Shanghai Pudong International', country: 'China', lat: 31.1443, lng: 121.8083 },
  { city: 'Hong Kong', code: 'HKG', name: 'Hong Kong International', country: 'Hong Kong', lat: 22.3080, lng: 113.9185 },
  { city: 'Singapore', code: 'SIN', name: 'Singapore Changi', country: 'Singapore', lat: 1.3644, lng: 103.9915 },
  { city: 'Seoul', code: 'ICN', name: 'Incheon International', country: 'South Korea', lat: 37.4602, lng: 126.4407 },
  { city: 'Bangkok', code: 'BKK', name: 'Suvarnabhumi Airport', country: 'Thailand', lat: 13.6900, lng: 100.7501 },
  { city: 'Kuala Lumpur', code: 'KUL', name: 'Kuala Lumpur International', country: 'Malaysia', lat: 2.7456, lng: 101.7099 },
  { city: 'Jakarta', code: 'CGK', name: 'Soekarno–Hatta International', country: 'Indonesia', lat: -6.1256, lng: 106.6558 },
  { city: 'Manila', code: 'MNL', name: 'Ninoy Aquino International', country: 'Philippines', lat: 14.5086, lng: 121.0194 },
  { city: 'Ho Chi Minh City', code: 'SGN', name: 'Tan Son Nhat International', country: 'Vietnam', lat: 10.8188, lng: 106.6519 },
  { city: 'Hanoi', code: 'HAN', name: 'Noi Bai International', country: 'Vietnam', lat: 21.2187, lng: 105.8056 },
  { city: 'Taipei', code: 'TPE', name: 'Taiwan Taoyuan International', country: 'Taiwan', lat: 25.0797, lng: 121.2342 },

  // Middle East
  { city: 'Dubai', code: 'DXB', name: 'Dubai International', country: 'UAE', lat: 25.2532, lng: 55.3657 },
  { city: 'Abu Dhabi', code: 'AUH', name: 'Abu Dhabi International', country: 'UAE', lat: 24.4330, lng: 54.6511 },
  { city: 'Doha', code: 'DOH', name: 'Hamad International', country: 'Qatar', lat: 25.2731, lng: 51.6080 },
  { city: 'Riyadh', code: 'RUH', name: 'King Khalid International', country: 'Saudi Arabia', lat: 24.9576, lng: 46.6988 },
  { city: 'Jeddah', code: 'JED', name: 'King Abdulaziz International', country: 'Saudi Arabia', lat: 21.6796, lng: 39.1565 },
  { city: 'Tel Aviv', code: 'TLV', name: 'Ben Gurion Airport', country: 'Israel', lat: 32.0055, lng: 34.8854 },
  { city: 'Kuwait City', code: 'KWI', name: 'Kuwait International', country: 'Kuwait', lat: 29.2266, lng: 47.9689 },
  { city: 'Bahrain', code: 'BAH', name: 'Bahrain International', country: 'Bahrain', lat: 26.2708, lng: 50.6336 },
  { city: 'Muscat', code: 'MCT', name: 'Muscat International', country: 'Oman', lat: 23.5933, lng: 58.2844 },

  // South Asia
  { city: 'Mumbai', code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', country: 'India', lat: 19.0896, lng: 72.8656 },
  { city: 'Delhi', code: 'DEL', name: 'Indira Gandhi International', country: 'India', lat: 28.5562, lng: 77.1000 },
  { city: 'Bangalore', code: 'BLR', name: 'Kempegowda International', country: 'India', lat: 13.1986, lng: 77.7066 },
  { city: 'Chennai', code: 'MAA', name: 'Chennai International', country: 'India', lat: 12.9941, lng: 80.1709 },
  { city: 'Hyderabad', code: 'HYD', name: 'Rajiv Gandhi International', country: 'India', lat: 17.2403, lng: 78.4294 },
  { city: 'Kolkata', code: 'CCU', name: 'Netaji Subhas Chandra Bose International', country: 'India', lat: 22.6520, lng: 88.4463 },
  { city: 'Ahmedabad', code: 'AMD', name: 'Sardar Vallabhbhai Patel International', country: 'India', lat: 23.0772, lng: 72.6347 },
  { city: 'Pune', code: 'PNQ', name: 'Pune Airport', country: 'India', lat: 18.5822, lng: 73.9197 },
  { city: 'Kochi', code: 'COK', name: 'Cochin International', country: 'India', lat: 10.1520, lng: 76.4019 },
  { city: 'Goa', code: 'GOI', name: 'Goa International', country: 'India', lat: 15.3808, lng: 73.8314 },
  { city: 'Jaipur', code: 'JAI', name: 'Jaipur International', country: 'India', lat: 26.8242, lng: 75.8122 },
  { city: 'Lucknow', code: 'LKO', name: 'Chaudhary Charan Singh International', country: 'India', lat: 26.7606, lng: 80.8893 },
  { city: 'Karachi', code: 'KHI', name: 'Jinnah International', country: 'Pakistan', lat: 24.9065, lng: 67.1609 },
  { city: 'Lahore', code: 'LHE', name: 'Allama Iqbal International', country: 'Pakistan', lat: 31.5216, lng: 74.4036 },
  { city: 'Islamabad', code: 'ISB', name: 'Islamabad International', country: 'Pakistan', lat: 33.5491, lng: 72.8256 },
  { city: 'Dhaka', code: 'DAC', name: 'Hazrat Shahjalal International', country: 'Bangladesh', lat: 23.8433, lng: 90.3978 },
  { city: 'Colombo', code: 'CMB', name: 'Bandaranaike International', country: 'Sri Lanka', lat: 7.1808, lng: 79.8841 },
  { city: 'Kathmandu', code: 'KTM', name: 'Tribhuvan International', country: 'Nepal', lat: 27.6966, lng: 85.3591 },

  // Africa
  { city: 'Cairo', code: 'CAI', name: 'Cairo International', country: 'Egypt', lat: 30.1219, lng: 31.4056 },
  { city: 'Johannesburg', code: 'JNB', name: 'O.R. Tambo International', country: 'South Africa', lat: -26.1367, lng: 28.2411 },
  { city: 'Cape Town', code: 'CPT', name: 'Cape Town International', country: 'South Africa', lat: -33.9715, lng: 18.6021 },
  { city: 'Lagos', code: 'LOS', name: 'Murtala Muhammed International', country: 'Nigeria', lat: 6.5774, lng: 3.3212 },
  { city: 'Nairobi', code: 'NBO', name: 'Jomo Kenyatta International', country: 'Kenya', lat: -1.3192, lng: 36.9278 },
  { city: 'Casablanca', code: 'CMN', name: 'Mohammed V International', country: 'Morocco', lat: 33.3675, lng: -7.5898 },
  { city: 'Addis Ababa', code: 'ADD', name: 'Bole International', country: 'Ethiopia', lat: 8.9779, lng: 38.7993 },
  { city: 'Accra', code: 'ACC', name: 'Kotoka International', country: 'Ghana', lat: 5.6052, lng: -0.1668 },

  // Oceania
  { city: 'Sydney', code: 'SYD', name: 'Sydney Kingsford Smith', country: 'Australia', lat: -33.9399, lng: 151.1753 },
  { city: 'Melbourne', code: 'MEL', name: 'Melbourne Airport', country: 'Australia', lat: -37.6690, lng: 144.8410 },
  { city: 'Brisbane', code: 'BNE', name: 'Brisbane Airport', country: 'Australia', lat: -27.3942, lng: 153.1218 },
  { city: 'Perth', code: 'PER', name: 'Perth Airport', country: 'Australia', lat: -31.9385, lng: 115.9672 },
  { city: 'Auckland', code: 'AKL', name: 'Auckland Airport', country: 'New Zealand', lat: -37.0082, lng: 174.7850 },
  { city: 'Wellington', code: 'WLG', name: 'Wellington International', country: 'New Zealand', lat: -41.3272, lng: 174.8053 },

  // South America
  { city: 'Sao Paulo', code: 'GRU', name: 'São Paulo–Guarulhos International', country: 'Brazil', lat: -23.4356, lng: -46.4731 },
  { city: 'Rio de Janeiro', code: 'GIG', name: 'Rio de Janeiro–Galeão International', country: 'Brazil', lat: -22.8099, lng: -43.2506 },
  { city: 'Buenos Aires', code: 'EZE', name: 'Ministro Pistarini International', country: 'Argentina', lat: -34.8222, lng: -58.5358 },
  { city: 'Lima', code: 'LIM', name: 'Jorge Chávez International', country: 'Peru', lat: -12.0219, lng: -77.1143 },
  { city: 'Bogota', code: 'BOG', name: 'El Dorado International', country: 'Colombia', lat: 4.7016, lng: -74.1469 },
  { city: 'Santiago', code: 'SCL', name: 'Arturo Merino Benítez International', country: 'Chile', lat: -33.3930, lng: -70.7858 },
  { city: 'Caracas', code: 'CCS', name: 'Simón Bolívar International', country: 'Venezuela', lat: 10.6012, lng: -66.9912 },

  // Caribbean
  { city: 'Havana', code: 'HAV', name: 'José Martí International', country: 'Cuba', lat: 22.9892, lng: -82.4091 },
  { city: 'San Juan', code: 'SJU', name: 'Luis Muñoz Marín International', country: 'Puerto Rico', lat: 18.4394, lng: -66.0018 },
  { city: 'Montego Bay', code: 'MBJ', name: 'Sangster International', country: 'Jamaica', lat: 18.5037, lng: -77.9134 },
  { city: 'Nassau', code: 'NAS', name: 'Lynden Pindling International', country: 'Bahamas', lat: 25.0390, lng: -77.4662 },
];

// City database with coordinates (for cities without airports)
export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

// This helps match user input to actual locations
export const majorCities: City[] = [
  // Cities that might not have their own airports or have different names
  { name: 'Manhattan', country: 'USA', lat: 40.7831, lng: -73.9712 },
  { name: 'Brooklyn', country: 'USA', lat: 40.6782, lng: -73.9442 },
  { name: 'Jersey City', country: 'USA', lat: 40.7178, lng: -74.0431 },
  { name: 'Long Beach', country: 'USA', lat: 33.7701, lng: -118.1937 },
  { name: 'Pasadena', country: 'USA', lat: 34.1478, lng: -118.1445 },
  { name: 'Oakland', country: 'USA', lat: 37.8044, lng: -122.2712 },
  { name: 'San Jose', country: 'USA', lat: 37.3382, lng: -121.8863 },
  { name: 'Tacoma', country: 'USA', lat: 47.2529, lng: -122.4443 },
  { name: 'Fort Lauderdale', country: 'USA', lat: 26.1224, lng: -80.1373 },
  { name: 'Hollywood', country: 'USA', lat: 34.0928, lng: -118.3287 },
  { name: 'Nice', country: 'France', lat: 43.7102, lng: 7.2620 },
  { name: 'Monaco', country: 'Monaco', lat: 43.7384, lng: 7.4246 },
  { name: 'Florence', country: 'Italy', lat: 43.7696, lng: 11.2558 },
  { name: 'Venice', country: 'Italy', lat: 45.4408, lng: 12.3155 },
  { name: 'Naples', country: 'Italy', lat: 40.8518, lng: 14.2681 },
  { name: 'Edinburgh', country: 'UK', lat: 55.9533, lng: -3.1883 },
  { name: 'Manchester', country: 'UK', lat: 53.4808, lng: -2.2426 },
  { name: 'Birmingham', country: 'UK', lat: 52.4862, lng: -1.8904 },
  { name: 'Kyoto', country: 'Japan', lat: 35.0116, lng: 135.7681 },
  { name: 'Yokohama', country: 'Japan', lat: 35.4437, lng: 139.6380 },
  { name: 'Shenzhen', country: 'China', lat: 22.5431, lng: 114.0579 },
  { name: 'Guangzhou', country: 'China', lat: 23.1291, lng: 113.2644 },
  { name: 'Phuket', country: 'Thailand', lat: 7.8804, lng: 98.3923 },
  { name: 'Bali', country: 'Indonesia', lat: -8.3405, lng: 115.0920 },
  { name: 'Maldives', country: 'Maldives', lat: 3.2028, lng: 73.2207 },
  { name: 'Agra', country: 'India', lat: 27.1767, lng: 78.0081 },
  { name: 'Varanasi', country: 'India', lat: 25.3176, lng: 82.9739 },
  { name: 'Udaipur', country: 'India', lat: 24.5854, lng: 73.7125 },
  { name: 'Shimla', country: 'India', lat: 31.1048, lng: 77.1734 },
  { name: 'Manali', country: 'India', lat: 32.2396, lng: 77.1887 },
  { name: 'Coimbatore', country: 'India', lat: 11.0168, lng: 76.9558 },
  { name: 'Mysore', country: 'India', lat: 12.2958, lng: 76.6394 },
  { name: 'Ooty', country: 'India', lat: 11.4102, lng: 76.6950 },
  { name: 'Pondicherry', country: 'India', lat: 11.9416, lng: 79.8083 },
  { name: 'Madurai', country: 'India', lat: 9.9252, lng: 78.1198 },
  { name: 'Vizag', country: 'India', lat: 17.6868, lng: 83.2185 },
  { name: 'Indore', country: 'India', lat: 22.7196, lng: 75.8577 },
  { name: 'Bhopal', country: 'India', lat: 23.2599, lng: 77.4126 },
  { name: 'Nagpur', country: 'India', lat: 21.1458, lng: 79.0882 },
  { name: 'Surat', country: 'India', lat: 21.1702, lng: 72.8311 },
  { name: 'Chandigarh', country: 'India', lat: 30.7333, lng: 76.7794 },
  { name: 'Amritsar', country: 'India', lat: 31.6340, lng: 74.8723 },
];

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Find the nearest airport to a given city/location
export const findNearestAirport = (cityInput: string): { airport: Airport; distance: number; isExactMatch: boolean } | null => {
  const input = cityInput.toLowerCase().trim();
  
  // First, check for exact airport match (by code or city name)
  const exactAirportMatch = worldAirports.find(a => 
    a.code.toLowerCase() === input || 
    a.city.toLowerCase() === input ||
    a.city.toLowerCase().includes(input) ||
    input.includes(a.city.toLowerCase())
  );
  
  if (exactAirportMatch) {
    return { airport: exactAirportMatch, distance: 0, isExactMatch: true };
  }
  
  // Check in major cities database
  const cityMatch = majorCities.find(c => 
    c.name.toLowerCase() === input ||
    c.name.toLowerCase().includes(input) ||
    input.includes(c.name.toLowerCase())
  );
  
  if (cityMatch) {
    // Find nearest airport to this city
    let nearestAirport: Airport | null = null;
    let minDistance = Infinity;
    
    for (const airport of worldAirports) {
      const distance = calculateDistance(cityMatch.lat, cityMatch.lng, airport.lat, airport.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestAirport = airport;
      }
    }
    
    if (nearestAirport) {
      return { airport: nearestAirport, distance: Math.round(minDistance), isExactMatch: false };
    }
  }
  
  // Try fuzzy matching with airports
  const fuzzyMatch = worldAirports.find(a => {
    const cityWords = a.city.toLowerCase().split(' ');
    const inputWords = input.split(' ');
    return cityWords.some(w => inputWords.some(iw => w.includes(iw) || iw.includes(w)));
  });
  
  if (fuzzyMatch) {
    return { airport: fuzzyMatch, distance: 0, isExactMatch: true };
  }
  
  return null;
};

// Get airport suggestions based on partial input
export const getAirportSuggestions = (query: string): Airport[] => {
  if (!query || query.length < 2) return [];
  
  const input = query.toLowerCase().trim();
  
  return worldAirports.filter(airport => 
    airport.city.toLowerCase().includes(input) ||
    airport.code.toLowerCase().includes(input) ||
    airport.name.toLowerCase().includes(input) ||
    airport.country.toLowerCase().includes(input)
  ).slice(0, 10);
};

// Get all airports for a specific city
export const getAirportsForCity = (city: string): Airport[] => {
  const input = city.toLowerCase().trim();
  return worldAirports.filter(a => 
    a.city.toLowerCase() === input ||
    a.city.toLowerCase().includes(input)
  );
};
