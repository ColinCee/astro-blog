import type { Page } from "@playwright/test";

// A fixed answer for the home window's live weather (open-meteo), so the
// Glasgow panel is the same each run: 10°C and overcast at 13:00, and the 24
// hours its line is drawn from. Used by every spec that loads the home page
// and cares what the panel shows.
export const weather = {
  current: {
    time: `${new Date().toISOString().slice(0, 10)}T13:00`,
    temperature_2m: 10,
    weather_code: 3,
  },
  hourly: {
    temperature_2m: [
      6, 6, 5, 5, 5, 4, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 10, 9, 8, 8, 7, 7, 6,
      6,
    ],
  },
};

export const fixWeather = (page: Page) =>
  page.route("https://api.open-meteo.com/**", (route) =>
    route.fulfill({ json: weather }),
  );
