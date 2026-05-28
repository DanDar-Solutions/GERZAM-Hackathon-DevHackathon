import { OWM_API_URL, ICE_RISK_THRESHOLDS } from '../config/constants';

const CACHE_KEY = 'accessub-weather';
const CACHE_TTL = 10 * 60 * 1000;

export interface WeatherData {
  temp: number;
  iceRisk: 'high' | 'medium' | 'low';
  description: string;
}

function getIceRisk(temp: number): 'high' | 'medium' | 'low' {
  if (temp <= ICE_RISK_THRESHOLDS.high) return 'high';
  if (temp <= ICE_RISK_THRESHOLDS.medium) return 'medium';
  return 'low';
}

function getCached(): WeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache(data: WeatherData) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
}

export async function fetchWeather(): Promise<WeatherData> {
  const cached = getCached();
  if (cached) return cached;

  const key = import.meta.env.VITE_OWM_API_KEY;
  if (!key || key === 'your_openweathermap_key_here') {
    return { temp: -18, iceRisk: 'high', description: 'цас' };
  }

  try {
    const res = await fetch(
      `${OWM_API_URL}?lat=47.9184&lon=106.9177&appid=${key}&units=metric&lang=mn`
    );
    if (!res.ok) throw new Error(`OWM ${res.status}`);
    const json = await res.json();
    const temp = Math.round(json.main.temp);
    const data: WeatherData = {
      temp,
      iceRisk: getIceRisk(temp),
      description: json.weather?.[0]?.description ?? '',
    };
    setCache(data);
    return data;
  } catch {
    const cached = getCached();
    if (cached) return cached;
    return { temp: -18, iceRisk: 'high', description: 'цас' };
  }
}
