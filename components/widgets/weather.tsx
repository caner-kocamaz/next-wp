"use client";

import { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: ForecastDay[];
}

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
}

const weatherIcons: Record<string, React.ElementType> = {
  clear: Sun,
  clouds: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  default: Cloud,
};

function getWeatherIcon(condition: string) {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes("clear") || lowerCondition.includes("sun")) {
    return weatherIcons.clear;
  }
  if (lowerCondition.includes("rain") || lowerCondition.includes("drizzle")) {
    return weatherIcons.rain;
  }
  if (lowerCondition.includes("snow")) {
    return weatherIcons.snow;
  }
  if (lowerCondition.includes("cloud")) {
    return weatherIcons.clouds;
  }
  return weatherIcons.default;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch("/api/weather");
        if (!response.ok) {
          throw new Error("Failed to fetch weather");
        }
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError("Unable to load weather");
        // Set fallback data
        setWeather({
          location: "San Francisco",
          temperature: 62,
          condition: "Partly Cloudy",
          humidity: 65,
          windSpeed: 12,
          forecast: [
            { day: "Fri", high: 65, low: 52, condition: "sunny" },
            { day: "Sat", high: 68, low: 54, condition: "cloudy" },
            { day: "Sun", high: 63, low: 51, condition: "rain" },
            { day: "Mon", high: 60, low: 48, condition: "cloudy" },
            { day: "Tue", high: 62, low: 50, condition: "sunny" },
          ],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border animate-pulse">
        <div className="h-6 bg-muted rounded w-24 mb-4" />
        <div className="h-12 bg-muted rounded w-32 mb-4" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted rounded flex-1" />
          ))}
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const WeatherIcon = getWeatherIcon(weather.condition);

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      {/* Location and current temp */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">{weather.location}</p>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-light">{weather.temperature}°</span>
            <span className="text-sm text-muted-foreground">F</span>
          </div>
          <p className="text-sm text-muted-foreground">{weather.condition}</p>
        </div>
        <WeatherIcon className="h-10 w-10 text-muted-foreground" />
      </div>

      {/* Quick stats */}
      <div className="flex gap-4 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Droplets className="h-3 w-3" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="h-3 w-3" />
          <span>{weather.windSpeed} mph</span>
        </div>
      </div>

      {/* 5-day forecast */}
      <div className="flex gap-1 pt-3 border-t border-border">
        {weather.forecast.map((day, index) => {
          const DayIcon = getWeatherIcon(day.condition);
          return (
            <div
              key={index}
              className={cn(
                "flex-1 text-center py-2 rounded-lg",
                index === 0 && "bg-muted"
              )}
            >
              <p className="text-xs text-muted-foreground mb-1">{day.day}</p>
              <DayIcon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs">
                <span className="font-medium">{day.high}°</span>
                <span className="text-muted-foreground ml-1">{day.low}°</span>
              </p>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
