'use client';

import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { CloudRain, CloudSnow, Cloud, Sun, CloudFog, Wind } from 'react-bootstrap-icons';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Get user's location
        if (!navigator.geolocation) {
          throw new Error('Geolocation not supported');
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            // Using Open-Meteo API (free, no API key required)
            const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}`
              + '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code'
              + '&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto';
            const weatherResponse = await fetch(apiUrl);

            if (!weatherResponse.ok) {
              throw new Error('Failed to fetch weather');
            }

            const weatherData = await weatherResponse.json();

            // Map weather codes to conditions
            const weatherCode = weatherData.current.weather_code;
            let condition = 'Clear';
            if (weatherCode === 0) condition = 'Clear';
            else if (weatherCode <= 3) condition = 'Partly Cloudy';
            else if (weatherCode <= 48) condition = 'Foggy';
            else if (weatherCode <= 67) condition = 'Rainy';
            else if (weatherCode <= 77) condition = 'Snowy';
            else if (weatherCode <= 99) condition = 'Stormy';

            setWeather({
              temperature: Math.round(weatherData.current.temperature_2m),
              condition,
              humidity: weatherData.current.relative_humidity_2m,
              windSpeed: Math.round(weatherData.current.wind_speed_10m),
              location: 'Honolulu, HI', // Default to Honolulu for UH Manoa
            });
            setLoading(false);
          },
          () => {
            // If location permission denied, use Honolulu coordinates
            const defaultUrl = 'https://api.open-meteo.com/v1/forecast?latitude=21.2969&longitude=-157.8170'
              + '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code'
              + '&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto';
            fetch(defaultUrl)
              .then((res) => res.json())
              .then((data) => {
                const weatherCode = data.current.weather_code;
                let condition = 'Clear';
                if (weatherCode === 0) condition = 'Clear';
                else if (weatherCode <= 3) condition = 'Partly Cloudy';
                else if (weatherCode <= 48) condition = 'Foggy';
                else if (weatherCode <= 67) condition = 'Rainy';
                else if (weatherCode <= 77) condition = 'Snowy';
                else if (weatherCode <= 99) condition = 'Stormy';

                setWeather({
                  temperature: Math.round(data.current.temperature_2m),
                  condition,
                  humidity: data.current.relative_humidity_2m,
                  windSpeed: Math.round(data.current.wind_speed_10m),
                  location: 'Honolulu, HI',
                });
                setLoading(false);
              })
              .catch(() => {
                setError('Unable to fetch weather');
                setLoading(false);
              });
          },
        );
      } catch (err) {
        setError('Unable to fetch weather');
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition: string) => {
    const iconProps = { size: 32, className: 'text-white' };
    switch (condition) {
      case 'Rainy':
      case 'Stormy':
        return <CloudRain {...iconProps} />;
      case 'Snowy':
        return <CloudSnow {...iconProps} />;
      case 'Partly Cloudy':
        return <Cloud {...iconProps} />;
      case 'Foggy':
        return <CloudFog {...iconProps} />;
      case 'Clear':
        return <Sun {...iconProps} />;
      default:
        return <Cloud {...iconProps} />;
    }
  };

  const getWeatherBackground = (condition: string) => {
    switch (condition) {
      case 'Clear':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'Partly Cloudy':
        return 'linear-gradient(135deg, #78a9d1 0%, #5a7fa1 100%)';
      case 'Rainy':
        return 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)';
      case 'Stormy':
        return 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)';
      case 'Snowy':
        return 'linear-gradient(135deg, #d8e8f0 0%, #a8c8d8 100%)';
      case 'Foggy':
        return 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  if (loading) {
    return (
      <Card
        className="shadow-sm"
        style={{
          border: 'none',
          borderRadius: '12px',
          background: getWeatherBackground('Clear'),
          color: 'white',
          minHeight: '120px',
        }}
      >
        <Card.Body className="d-flex align-items-center justify-content-center">
          <small className="text-white">Loading weather...</small>
        </Card.Body>
      </Card>
    );
  }

  if (error || !weather) {
    return null; // Silently fail to not disrupt the page
  }

  return (
    <Card
      className="shadow-sm"
      style={{
        border: 'none',
        borderRadius: '12px',
        background: getWeatherBackground(weather.condition),
        color: 'white',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Decorative overlay elements */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          zIndex: 0,
        }}
      />
      <Card.Body className="p-3" style={{ position: 'relative', zIndex: 1 }}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              {getWeatherIcon(weather.condition)}
              <h2 className="mb-0" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {weather.temperature}
                °F
              </h2>
            </div>
            <p className="mb-0" style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              {weather.condition}
            </p>
          </div>
        </div>
        <div className="d-flex gap-3 mt-2" style={{ fontSize: '0.8rem', opacity: 0.9 }}>
          <div className="d-flex align-items-center gap-1">
            <Wind size={14} />
            <span>
              {weather.windSpeed}
              {' '}
              mph
            </span>
          </div>
          <div>
            Humidity:
            {' '}
            {weather.humidity}
            %
          </div>
        </div>
        <small style={{ fontSize: '0.75rem', opacity: 0.8 }} className="d-block mt-2">
          {weather.location}
        </small>
      </Card.Body>
    </Card>
  );
};

export default WeatherWidget;
