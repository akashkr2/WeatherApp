import React, { useEffect, useState } from "react";

const BATTUTA_KEY = "00000000000000000000000000000000";

const LocationPicker = () => {
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [currentCities, setCurrentCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCityIndex, setSelectedCityIndex] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetch(
      `https://geo-battuta.net/api/country/all/?key=${BATTUTA_KEY}&callback=?`
    )
      .then((res) => res.text())
      .then((data) => {
        const json = JSON.parse(data.replace(/^\?\(/, "").replace(/\);$/, ""));
        setCountries(json);
        if (json.length > 0) {
          setSelectedCountry(json[0].code);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedCountry) return;
    fetch(
      `https://geo-battuta.net/api/region/${selectedCountry}/all/?key=${BATTUTA_KEY}&callback=?`
    )
      .then((res) => res.text())
      .then((data) => {
        const json = JSON.parse(data.replace(/^\?\(/, "").replace(/\);$/, ""));
        setRegions(json);
        if (json.length > 0) {
          setSelectedRegion(json[0].region);
        }
      });
  }, [selectedCountry]);

  useEffect(() => {
    if (!selectedRegion || !selectedCountry) return;
    fetch(
      `https://geo-battuta.net/api/city/${selectedCountry}/search/?region=${selectedRegion}&key=${BATTUTA_KEY}&callback=?`
    )
      .then((res) => res.text())
      .then((data) => {
        const json = JSON.parse(data.replace(/^\?\(/, "").replace(/\);$/, ""));
        setCities(json.map((c, i) => ({ label: c.city, value: i })));
        setCurrentCities(json);
        setSelectedCityIndex(0);
      });
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedCityIndex !== null && currentCities[selectedCityIndex]) {
      const cityData = currentCities[selectedCityIndex];
      setLocation(cityData);
    }
  }, [selectedCityIndex]);

  return (
    <div className="bg-white text-black rounded-2xl shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="country" className="block mb-1 font-medium">
            Country
          </label>
          <select
            id="country"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="region" className="block mb-1 font-medium">
            Region
          </label>
          <select
            id="region"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            {regions.map((region) => (
              <option key={region.region} value={region.region}>
                {region.region}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="city" className="block mb-1 font-medium">
            City
          </label>
          <select
            id="city"
            value={
              selectedCityIndex !== null ? selectedCityIndex.toString() : ""
            }
            onChange={(e) => setSelectedCityIndex(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            {cities.map((city) => (
              <option key={city.value} value={city.value.toString()}>
                {city.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {location && (
        <div className="mt-6 p-4 bg-orange-400 text-black text-center rounded-lg">
          <i className="fa fa-map-marker"></i>{" "}
          <strong>
            {location.city}/{location.region}
          </strong>
          {` (${location.latitude}, ${location.longitude})`}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
