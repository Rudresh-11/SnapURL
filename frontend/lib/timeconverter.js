export function formatIST(dateString) {
  if (!dateString) return "";
// console.log(dateString)
  return new Date(dateString).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).replace(",", ""); // "Dec 9 2025 08:38 PM"
}