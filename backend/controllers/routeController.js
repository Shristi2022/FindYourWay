const fetch = require('node-fetch');

const geocodeCity = async (city) => {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        const data = await response.json();
        if (data && data.results && data.results.length > 0) {
            return { lat: data.results[0].latitude, lon: data.results[0].longitude };
        }
        return null;
    } catch (error) {
        console.error(`Geocoding error for ${city}:`, error);
        return null;
    }
};

const stateToCityMap = {
    "arunachal pradesh": "Itanagar",
    "assam": "Guwahati", // Dispur is capital, but Guwahati is more common for routing
    "bihar": "Patna",
    "chhattisgarh": "Raipur",
    "goa": "Panaji",
    "gujarat": "Ahmedabad",
    "haryana": "Chandigarh",
    "himachal pradesh": "Shimla",
    "jharkhand": "Ranchi",
    "karnataka": "Bengaluru",
    "kerala": "Thiruvananthapuram",
    "madhya pradesh": "Bhopal",
    "maharashtra": "Mumbai",
    "manipur": "Imphal",
    "meghalaya": "Shillong",
    "mizoram": "Aizawl",
    "nagaland": "Kohima",
    "odisha": "Bhubaneswar",
    "punjab": "Chandigarh",
    "rajasthan": "Jaipur",
    "sikkim": "Gangtok",
    "tamil nadu": "Chennai",
    "telangana": "Hyderabad",
    "tripura": "Agartala",
    "uttar pradesh": "Lucknow",
    "uttarakhand": "Dehradun",
    "west bengal": "Kolkata",
    "andaman and nicobar islands": "Port Blair",
    "chandigarh": "Chandigarh",
    "dadra and nagar haveli": "Daman",
    "daman and diu": "Daman",
    "lakshadweep": "Kavaratti",
    "delhi": "New Delhi",
    "puducherry": "Pondicherry",
    "ladakh": "Leh",
    "jammu and kashmir": "Srinagar"
};

// Calculate cost based on distance and mode
const calculateRoutes = (distanceKm, durationHrs) => {
    return [
        {
            summary: "Flight",
            timeHours: Math.max(1, distanceKm / 800) + 0.5,
            priceNum: Math.round(distanceKm * 6),
            type: "flight"
        },
        {
            summary: "Train",
            timeHours: distanceKm / 70,
            priceNum: Math.round(distanceKm * 2.5),
            type: "train"
        },
        {
            summary: "Bus",
            timeHours: durationHrs * 1.2,
            priceNum: Math.round(distanceKm * 1.5),
            type: "bus"
        },
        {
            summary: "Car (Self-Drive)",
            timeHours: durationHrs,
            priceNum: Math.round(distanceKm * 8),
            type: "car"
        }
    ].map((r, index) => ({
        ...r,
        time: `${Math.floor(r.timeHours)}h ${Math.round((r.timeHours % 1) * 60)}m`,
        price: `₹${r.priceNum}`,
        rank: index + 1
    }));
};

// Apply weighted AI scoring to rank routes
const scoreRoutes = (routes, preference) => {
    let maxTime = 0;
    let maxPrice = 0;
    
    routes.forEach(r => {
        if (r.timeHours > maxTime) maxTime = r.timeHours;
        if (r.priceNum > maxPrice) maxPrice = r.priceNum;
    });

    let wTime = 0.5, wPrice = 0.5;
    if (preference === 'fastest') {
        wTime = 0.8; wPrice = 0.2;
    } else if (preference === 'cheapest') {
        wTime = 0.2; wPrice = 0.8;
    }

    routes.forEach(r => {
        const nTime = r.timeHours / maxTime;
        const nPrice = r.priceNum / maxPrice;
        r.score = (wTime * nTime) + (wPrice * nPrice);
    });

    routes.sort((a, b) => a.score - b.score);
    
    if (routes.length > 0) {
        routes[0].isRecommended = true;
        if (preference === 'fastest') {
            routes[0].aiReason = "Recommended: Fastest travel time available.";
        } else if (preference === 'cheapest') {
            routes[0].aiReason = "Recommended: Most budget-friendly option.";
        } else {
            routes[0].aiReason = "Recommended: Best balance of time and cost.";
        }
    }

    return routes;
};

exports.getRoutes = async (req, res) => {
    let { origin, destination, preference = 'balanced' } = req.query;

    if (!origin || !destination) {
        return res.status(400).json({ message: "Origin and destination are required" });
    }

    try {
        // Smart mapping: States to major cities
        const cleanOrigin = origin.toLowerCase().trim();
        const cleanDest = destination.toLowerCase().trim();

        if (stateToCityMap[cleanOrigin]) origin = stateToCityMap[cleanOrigin];
        if (stateToCityMap[cleanDest]) destination = stateToCityMap[cleanDest];

        // 1. Geocode cities
        const originCoords = await geocodeCity(origin);
        const destCoords = await geocodeCity(destination);

        if (!originCoords || !destCoords) {
            return res.status(404).json({ message: "Could not find coordinates for one or both cities" });
        }

        // 2. Fetch driving distance from OSRM
        // Note: OSRM expects coordinates in "longitude,latitude" format
        const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${originCoords.lon},${originCoords.lat};${destCoords.lon},${destCoords.lat}?overview=false`;
        
        const routeResponse = await fetch(osrmUrl);
        const routeData = await routeResponse.json();

        if (routeData.code !== 'Ok' || !routeData.routes || routeData.routes.length === 0) {
            return res.status(404).json({ message: "No driving route found between these cities" });
        }

        const distanceMeters = routeData.routes[0].distance;
        const durationSeconds = routeData.routes[0].duration;

        const distanceKm = distanceMeters / 1000;
        const durationHrs = durationSeconds / 3600;

        // 3. Generate route options based on base distance
        let routes = calculateRoutes(distanceKm, durationHrs);

        // 4. Score and sort routes using AI weighted logic
        routes = scoreRoutes(routes, preference);

        res.status(200).json(routes);
    } catch (error) {
        console.error("Route calculation error:", error);
        res.status(500).json({ message: "Server error calculating routes" });
    }
};
