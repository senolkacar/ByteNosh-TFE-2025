export enum DayOfWeek {
    Monday = "Monday",
    Tuesday = "Tuesday",
    Wednesday = "Wednesday",
    Thursday = "Thursday",
    Friday = "Friday",
    Saturday = "Saturday",
    Sunday = "Sunday",
}

export default interface Timeslot {
    day: DayOfWeek;
    openHour: Date;
    closeHour: Date;
    isOpen: boolean;
}