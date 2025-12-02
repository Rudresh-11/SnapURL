// convert utc time to local time
export function convertToLocalTime(utcTime) {
    const date = new Date(utcTime);
    return date.toLocaleString();
}
