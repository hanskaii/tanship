import { Hono } from "hono";
import { ApiResponse } from "@/helpers/response.helper";
import { ApiError } from "@/helpers/errors.helper";
import type { HonoEnv } from "@/types/hono.types";

const handler = new Hono<HonoEnv>();

const CACHE_TTL_S = 600; // 10 min — weather is fine-grained, not minute-level

interface GeoData {
	ip: string;
	city: string;
	country: string;
	countryCode: string;
	latitude: number;
	longitude: number;
	timezone: string;
}

interface WeatherData {
	ip: string;
	location: {
		city: string;
		country: string;
		latitude: number;
		longitude: number;
	};
	temperature: number;
	feelsLike: number;
	humidity: number;
	windSpeed: number;
	windDirection: number;
	condition: string;
	code: number;
	isDay: boolean;
	precipitation: number;
	timestamp: string;
	cached: boolean;
}

const CONDITION_CODES: Record<number, string> = {
	0: "Clear",
	1: "Mainly clear",
	2: "Partly cloudy",
	3: "Overcast",
	45: "Fog",
	48: "Depositing rime fog",
	51: "Light drizzle",
	53: "Moderate drizzle",
	55: "Dense drizzle",
	61: "Light rain",
	63: "Moderate rain",
	65: "Heavy rain",
	71: "Light snow",
	73: "Moderate snow",
	75: "Heavy snow",
	77: "Snow grains",
	80: "Light rain showers",
	81: "Moderate rain showers",
	82: "Violent rain showers",
	85: "Light snow showers",
	86: "Heavy snow showers",
	95: "Thunderstorm",
	96: "Thunderstorm with light hail",
	99: "Thunderstorm with heavy hail"
};

async function fetchGeo(ip: string): Promise<GeoData> {
	const url = `https://ipapi.co/${ip}/json/`;
	const res = await fetch(url, {
		headers: { Accept: "application/json" },
		// ipapi.co sometimes takes a sec; cap at 4s
		signal: AbortSignal.timeout(4_000)
	});
	if (!res.ok) {
		throw ApiError.badGateway(`Geolocation lookup failed (${res.status})`);
	}
	const json = (await res.json()) as Record<string, unknown>;
	if (json.error) {
		throw ApiError.badGateway(
			`Geolocation rejected IP: ${String(json.reason ?? "unknown")}`
		);
	}
	const lat = Number(json.latitude);
	const lon = Number(json.longitude);
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
		throw ApiError.badGateway("Geolocation returned no coordinates");
	}
	return {
		ip,
		city: String(json.city ?? "Unknown"),
		country: String(json.country_name ?? "Unknown"),
		countryCode: String(json.country_code ?? ""),
		latitude: lat,
		longitude: lon,
		timezone: String(json.timezone ?? "UTC")
	};
}

async function fetchWeather(geo: GeoData): Promise<WeatherData> {
	const params = new URLSearchParams({
		latitude: geo.latitude.toString(),
		longitude: geo.longitude.toString(),
		current: [
			"temperature_2m",
			"apparent_temperature",
			"relative_humidity_2m",
			"is_day",
			"precipitation",
			"weather_code",
			"wind_speed_10m",
			"wind_direction_10m"
		].join(","),
		temperature_unit: "celsius",
		wind_speed_unit: "kmh",
		timezone: geo.timezone || "auto"
	});
	const res = await fetch(
		`https://api.open-meteo.com/v1/forecast?${params}`,
		{
			signal: AbortSignal.timeout(4_000)
		}
	);
	if (!res.ok) {
		throw ApiError.badGateway(`Weather API failed (${res.status})`);
	}
	const json = (await res.json()) as {
		current?: {
			temperature_2m?: number;
			apparent_temperature?: number;
			relative_humidity_2m?: number;
			is_day?: number;
			precipitation?: number;
			weather_code?: number;
			wind_speed_10m?: number;
			wind_direction_10m?: number;
		};
	};
	const cur = json.current;
	if (!cur) {
		throw ApiError.badGateway("Weather API returned no current data");
	}
	const code = cur.weather_code ?? 0;
	return {
		ip: geo.ip,
		location: {
			city: geo.city,
			country: geo.country,
			latitude: geo.latitude,
			longitude: geo.longitude
		},
		temperature: cur.temperature_2m ?? 0,
		feelsLike: cur.apparent_temperature ?? cur.temperature_2m ?? 0,
		humidity: cur.relative_humidity_2m ?? 0,
		windSpeed: cur.wind_speed_10m ?? 0,
		windDirection: cur.wind_direction_10m ?? 0,
		condition: CONDITION_CODES[code] ?? "Unknown",
		code,
		isDay: (cur.is_day ?? 1) === 1,
		precipitation: cur.precipitation ?? 0,
		timestamp: new Date().toISOString(),
		cached: false
	};
}

/**
 * GET /v1/weather?ip=<ip>
 * Returns current weather for the IP (defaults to request IP). KV-cached for
 * 10 minutes per IP+location bucket.
 */
handler.get("/", async (c) => {
	const ipParam = new URL(c.req.url).searchParams.get("ip");
	const ip =
		ipParam ||
		c.req.header("cf-connecting-ip") ||
		c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
		"0.0.0.0";

	if (ip === "0.0.0.0") {
		throw ApiError.badRequest(
			"Could not determine request IP — pass ?ip=<address>"
		);
	}

	// Cache key bucketed by /24 to share cache across a /24 subnet without
	// over-fitting to a single host.
	const bucket = ip.includes(":")
		? ip
		: ip.split(".").slice(0, 3).join(".") + ".0";
	const cacheKey = `weather:${bucket}`;

	const cached = await c.env.KV.get<WeatherData>(cacheKey, "json");
	if (cached) {
		const fresh: WeatherData = { ...cached, cached: true };
		c.header("Cache-Control", `public, max-age=${CACHE_TTL_S}`);
		return ApiResponse.ok(c, "Weather data served from cache", fresh);
	}

	const geo = await fetchGeo(ip);
	const weather = await fetchWeather(geo);

	c.env.KV.put(cacheKey, JSON.stringify(weather), {
		expirationTtl: CACHE_TTL_S
	});

	c.header("Cache-Control", `public, max-age=${CACHE_TTL_S}`);
	return ApiResponse.ok(c, "Weather data", weather);
});

export default handler;
