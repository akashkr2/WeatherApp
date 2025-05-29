import React, { useState, useEffect } from "react";

const WeatherApp = () => {
  const [city, setCity] = useState("Bhopal");
  const [stateCode, setStateCode] = useState("Madhya Pradesh");
  const [countryCode, setCountryCode] = useState("IN");
  const [countries, setCountries] = useState([]);
  const [fields, setFields] = useState({
    name: "",
    country: "",
    weatherMain: "",
    weatherDescription: "",
    weatherIconCode: "",
    temp: 0,
    feels_like: 0,
    temp_min: 0,
    temp_max: 0,
    pressure: 0,
    humidity: 0,
    windSpeed: 0,
    windDeg: 0,
    cloudiness: 0,
    rain1h: 0,
  });

  const API_KEY = import.meta.env.VITE_LOCATION_API_KEY; // Replace with your actual OpenWeatherMap API key

  const getCountries = async () => {
    try {
      const headers = new Headers();
      headers.append("X-CSCAPI-KEY", `${API_KEY}`);

      const requestOptions = {
        method: "GET",
        headers: headers,
        redirect: "follow",
      };

      const res = await fetch(
        "https://api.first.org/data/v1/countries",
        requestOptions
      );

      console.log(res);
      
      const data = await res.json();
      const countryList = Object.entries(data.data).map(([code, value]) => ({
        code,
        name: value.country,
      }));
      setCountries(countryList);
    } catch (error) {
      console.error("Failed to load countries:", error);
    }
  };

  useEffect(() => {
    getCountries();
  }, []);

  const getCoord = async (cityName, state, country) => {
    const res = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${cityName},${state},${country}&limit=1&appid=${API_KEY}`
    );
    const data = await res.json();
    if (data.length === 0) throw new Error("City not found");
    return { lat: data[0].lat, lon: data[0].lon };
  };

  const getWeatherData = async ({ lat, lon }) => {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    const data = await res.json();
    return {
      name: data.name,
      country: data.sys.country,
      weatherMain: data.weather[0].main,
      weatherDescription: data.weather[0].description,
      weatherIconCode: data.weather[0].icon,
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      temp_min: data.main.temp_min,
      temp_max: data.main.temp_max,
      pressure: data.main.pressure,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      windDeg: data.wind.deg,
      cloudiness: data.clouds.all,
      rain1h: data.rain?.["1h"] || 0,
    };
  };

  const handleSearch = async () => {
    try {
      const coords = await getCoord(city, stateCode, countryCode);
      const weatherData = await getWeatherData(coords);
      setFields(weatherData);
    } catch (error) {
      alert(error.message);
    }
  };

  const {
    name,
    country,
    weatherMain,
    weatherDescription,
    weatherIconCode,
    temp,
    feels_like,
    humidity,
    windSpeed,
    cloudiness,
    rain1h,
  } = fields;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 to-blue-300 p-4 text-gray-900">
      <div className="mb-4 space-y-2 w-full max-w-md">
        {/* <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        /> */}
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
        <select
          value={stateCode}
          onChange={(e) => setStateCode(e.target.value)}
          className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select State</option>
          <option value="Madhya Pradesh">Madhya Pradesh</option>
          <option value="CA">California</option>
          <option value="NY">New York</option>
          <option value="TX">Texas</option>
        </select>
        
        <button
          onClick={handleSearch}
          className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </div>
      <div className="w-full max-w-md shadow-xl rounded-2xl p-6 bg-white/60 backdrop-blur-md">
        <div className="flex flex-col items-center text-center space-y-4">
          <h2 className="text-2xl font-semibold">
            Weather in {name}, {country}
          </h2>
          {weatherIconCode && (
            <div className="flex items-center gap-2 text-xl text-blue-700">
              <img
                src={`http://openweathermap.org/img/w/${weatherIconCode}.png`}
                alt={weatherDescription}
                className="w-10 h-10"
              />
              <span>
                {weatherMain} - {weatherDescription}
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 w-full mt-4">
            <div>
              <p className="font-medium">Temperature</p>
              <p>{(temp - 273.15).toFixed(1)}°C</p>
            </div>
            <div>
              <p className="font-medium">Feels Like</p>
              <p>{(feels_like - 273.15).toFixed(1)}°C</p>
            </div>
            <div>
              <p className="font-medium">Humidity</p>
              <p>{humidity}%</p>
            </div>
            <div>
              <p className="font-medium">Wind Speed</p>
              <p>{windSpeed} m/s</p>
            </div>
            <div>
              <p className="font-medium">Cloudiness</p>
              <p>{cloudiness}%</p>
            </div>
            <div>
              <p className="font-medium">Rain (1h)</p>
              <p>{rain1h} mm</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
