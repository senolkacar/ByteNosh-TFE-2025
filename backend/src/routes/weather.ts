import express, { Request, Response } from 'express';

const router = express.Router();
const LATITUDE = 50.851561;
const LONGITUDE = 4.369546;

router.get('/', async (req: Request, res: Response): Promise<void> => {
    const { date } = req.query;
    if (!date) {
        res.status(400).json({ error: "Date parameter is required" });
        return;
    }

    // Check if date received is within the next 7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const selectedDate = new Date(date as string);
    if (selectedDate < today || selectedDate > nextWeek) {
        res.status(400).json({ error: "Forecast only available for reservation within 1 week" });
        return;
    }

    try {
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=temperature_2m_max,temperature_2m_min&timezone=Europe/Brussels`;
        const response = await fetch(apiUrl);
        const weatherData = await response.json();

        const dateStr = (date as string).split('T')[0];
        const forecastIndex = weatherData.daily.time.findIndex((day: string) => day === dateStr);

        if (forecastIndex === -1) {
            res.status(404).json({ message: "No forecast available for this date" });
            return;
        }

        const maxTemp = weatherData.daily.temperature_2m_max[forecastIndex];
        const minTemp = weatherData.daily.temperature_2m_min[forecastIndex];

        const recommendation = maxTemp >= 15 ? "outdoor" : "indoor";

        res.json({
            date: dateStr,
            maxTemp,
            minTemp,
            recommendation,
            message: `The forecasted temperature is between ${minTemp}°C and ${maxTemp}°C. We recommend choosing ${recommendation} seating for this reservation.`
        });
    } catch (error) {
        console.error("Failed to fetch weather data:", error);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

export default router;