import { useState, useEffect } from 'react';
import { fetchWeather, type WeatherData } from '../lib/weather-api';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData>({
    temp: -18,
    iceRisk: 'high',
    description: '',
  });

  useEffect(() => {
    fetchWeather().then(setWeather);
    const interval = setInterval(() => {
      fetchWeather().then(setWeather);
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return weather;
}
