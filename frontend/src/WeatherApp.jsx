import axios from "axios";
import React, { useState, useEffect } from "react";

const WeatherApp = () => {
  // const [countries, setCountries] = useState([]);
  // const [states, setStates] = useState([]);
  // const [cities, setCities] = useState([]);
  // const [countryCode, setCountryCode] = useState("IN");
  // const [countryName, setCountryName] = useState("India");
  // const [stateName, setStateName] = useState("Bihar");
  // const [cityName, setCityName] = useState("Jamalpur");

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Store codes and names separately for better mapping
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState(""); // we'll get this from states list
  const [cityName, setCityName] = useState("");

  //
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

  const countryStateCity_API_KEY = import.meta.env
    .VITE_COUNTRYSTATECITY_API_KEY;

  const getCountries = async () => {
    try {
      const res = await fetch("https://api.countrystatecity.in/v1/countries", {
        headers: { "X-CSCAPI-KEY": countryStateCity_API_KEY },
      });
      const data = await res.json();
      const countriesData = data
        .map(({ iso2, name }) => ({
          code: iso2,
          name,
          flagURL: `https://flagsapi.com/${iso2}/flat/64.png`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setCountries(countriesData);

      // Set default country code if empty
      if (!countryCode && countriesData.length) {
        setCountryCode("IN");
      }
    } catch (error) {
      console.error("Failed to load countries:", error);
    }
  };

  // Get states by country code
  const getStates = async (countryCode) => {
    try {
      if (!countryCode) return;
      const res = await fetch(
        `https://api.countrystatecity.in/v1/countries/${countryCode}/states`,
        {
          headers: { "X-CSCAPI-KEY": countryStateCity_API_KEY },
        }
      );
      const data = await res.json();

      setStates(data);

      // Reset state and city on country change
      setStateCode("");
      setCityName("");

      if (!stateCode && data.length && countryCode === "IN") {
        setStateCode("BR");
      }
    } catch (error) {
      console.error("Failed to load states:", error);
    }
  };

  // Get cities by countryCode and stateCode
  const getCities = async (countryCode, stateCode) => {
    try {
      if (!countryCode || !stateCode) return;
      const res = await fetch(
        `https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`,
        {
          headers: { "X-CSCAPI-KEY": countryStateCity_API_KEY },
        }
      );
      const data = await res.json();

      setCities(data);

      // Reset city on state change
      setCityName("");

      if (!cityName && data.length && stateCode === "BR") {
        setCityName("Jamalpur");
      }
    } catch (error) {
      console.error("Failed to load cities:", error);
    }
  };

  useEffect(() => {
    getCountries();
  }, []);

  useEffect(() => {
    if (countryCode) {
      getStates(countryCode);
    }
  }, [countryCode]);

  useEffect(() => {
    if (countryCode && stateCode) {
      getCities(countryCode, stateCode);
    }
  }, [countryCode, stateCode]);

  const toPlusSeparated = (str) => {
    return str.trim().split(/\s+/).join("+");
  };

  const getCoord = async (cityName, stateName, countryCode) => {
    const city = toPlusSeparated(cityName);
    const state = toPlusSeparated(stateName);
    const res = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${city},+${state},+${countryCode}&key=${
        import.meta.env.VITE_OPENCAGE_GEO_API_KEY
      }`
    );
    const data = await res.json();
    if (data.results.length) {
      const { lat, lng } = data.results[0].geometry;
      // console.log(lat, lng);
      return { lat, lon: lng };
    } else {
      console.log("No coordinates found");
    }
  };

  const getWeatherData = async ({ lat, lon }) => {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${
        import.meta.env.VITE_OPENWEATHER_WEATHER_API_KEY
      }`
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
      const stateObj = states.find((s) => s.iso2 === stateCode);
      const stateName = stateObj ? stateObj.name : "";

      const coords = await getCoord(cityName, stateName, countryCode);
      const weatherData = await getWeatherData(coords);
      setFields(weatherData);
    } catch (error) {
      console.log(error);
      // alert(error.message);
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
        <div className="flex gap-3 items-center">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Country</option>
            {countries.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          {countryCode && (
            <img
              src={countries.find((c) => c.code === countryCode)?.flagURL}
              alt="Country flag"
              className="h-10 object-cover rounded"
            />
          )}
        </div>
        <div className="flex gap-3">
          <select
            value={stateCode}
            onChange={(e) => setStateCode(e.target.value)}
            disabled={!states.length}
            className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select State</option>
            {states.map(({ iso2, name }) => (
              <option key={iso2} value={iso2}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            disabled={!cities.length}
            className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select City</option>
            {cities.map(({ name }) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

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
