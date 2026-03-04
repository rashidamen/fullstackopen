import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [countries, setCountries] = useState([])
  const [filter, setFilter] = useState('')
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
  }, [])

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
    setWeather(null)
  }

  const filteredCountries = countries.filter(country =>
    country.name.common.toLowerCase().includes(filter.toLowerCase())
  )

  const handleShow = (name) => {
    setFilter(name)
  }

  return (
    <div className="container">
      <div className="search-section">
        <label>Find countries</label>
        <input
          value={filter}
          onChange={handleFilterChange}
          placeholder="Type to search..."
        />
      </div>

      <div className="results-section">
        <Content
          countries={filteredCountries}
          handleShow={handleShow}
          weather={weather}
          setWeather={setWeather}
        />
      </div>
    </div>
  )
}

const Content = ({ countries, handleShow, weather, setWeather }) => {
  if (countries.length > 10) {
    return <p className="message">Too many matches, specify another filter</p>
  }

  if (countries.length === 1) {
    return <CountryDetail country={countries[0]} weather={weather} setWeather={setWeather} />
  }

  if (countries.length === 0) {
    return <p className="message">No matches found</p>
  }

  return (
    <ul className="country-list">
      {countries.map(country => (
        <li key={country.name.common} className="country-item">
          <span>{country.name.common}</span>
          <button onClick={() => handleShow(country.name.common)}>Show</button>
        </li>
      ))}
    </ul>
  )
}

const CountryDetail = ({ country, weather, setWeather }) => {
  useEffect(() => {
    const api_key = import.meta.env.VITE_WEATHER_API_KEY
    if (country.capital && api_key) {
      axios
        .get(`https://api.openweathermap.org/data/2.5/weather?q=${country.capital[0]}&appid=${api_key}&units=metric`)
        .then(response => {
          setWeather(response.data)
        })
        .catch(err => console.error("Error fetching weather:", err))
    }
  }, [country, setWeather])

  return (
    <div className="country-detail">
      <h1>{country.name.common}</h1>

      <div className="info-grid">
        <p><strong>Capital:</strong> {country.capital ? country.capital[0] : 'N/A'}</p>
        <p><strong>Area:</strong> {country.area} km²</p>
      </div>

      <div className="languages-section">
        <h3>Languages:</h3>
        <ul>
          {Object.values(country.languages || {}).map(lang => (
            <li key={lang}>{lang}</li>
          ))}
        </ul>
      </div>

      <div className="flag-section">
        <img
          src={country.flags.svg}
          alt={`Flag of ${country.name.common}`}
          className="flag-img"
        />
      </div>

      {weather && (
        <div className="weather-section">
          <h2>Weather in {country.capital}</h2>
          <div className="weather-info">
            <p><strong>Temperature:</strong> {weather.main.temp} °C</p>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
            <p><strong>Wind:</strong> {weather.wind.speed} m/s</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
