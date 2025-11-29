import { NextResponse } from "next/server";

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const DEFAULT_CITY = "San Francisco";

interface OpenWeatherResponse {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
}

interface ForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp_max: number;
      temp_min: number;
    };
    weather: Array<{
      main: string;
    }>;
  }>;
}

// Cache the response for 30 minutes
export const revalidate = 1800;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || DEFAULT_CITY;

  // If no API key, return mock data
  if (!OPENWEATHERMAP_API_KEY) {
    return NextResponse.json({
      location: city,
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
  }

  try {
    // Fetch current weather
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHERMAP_API_KEY}&units=imperial`,
      { next: { revalidate: 1800 } }
    );

    if (!weatherResponse.ok) {
      throw new Error("Weather API request failed");
    }

    const weatherData: OpenWeatherResponse = await weatherResponse.json();

    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${OPENWEATHERMAP_API_KEY}&units=imperial`,
      { next: { revalidate: 1800 } }
    );

    let forecast = [];
    if (forecastResponse.ok) {
      const forecastData: ForecastResponse = await forecastResponse.json();

      // Group by day and get daily highs/lows
      const dailyData = new Map<
        string,
        { high: number; low: number; condition: string }
      >();

      forecastData.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString("en-US", { weekday: "short" });

        const existing = dailyData.get(dayKey);
        if (existing) {
          existing.high = Math.max(existing.high, Math.round(item.main.temp_max));
          existing.low = Math.min(existing.low, Math.round(item.main.temp_min));
        } else {
          dailyData.set(dayKey, {
            high: Math.round(item.main.temp_max),
            low: Math.round(item.main.temp_min),
            condition: item.weather[0]?.main.toLowerCase() || "cloudy",
          });
        }
      });

      forecast = Array.from(dailyData.entries())
        .slice(0, 5)
        .map(([day, data]) => ({
          day,
          high: data.high,
          low: data.low,
          condition: data.condition,
        }));
    }

    return NextResponse.json({
      location: weatherData.name,
      temperature: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0]?.description || "Unknown",
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed),
      forecast,
    });
  } catch (error) {
    console.error("Weather API error:", error);

    // Return fallback data on error
    return NextResponse.json({
      location: city,
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
  }
}
