// Drone name generator - "ALPHA-MUMBAI-07" format
const GREEK_ALPHABET = ["ALPHA", "BRAVO", "CHARLIE", "DELTA", "ECHO", "FOXTROT", "GOLF", "HOTEL"];
const INDIAN_CITIES = ["MUMBAI", "DELHI", "CHENNAI", "KOLKATA", "PUNE", "HYDERABAD", "JAIPUR", "SURAT"];

export function generateDroneName(): string {
  const greekLetter = GREEK_ALPHABET[Math.floor(Math.random() * GREEK_ALPHABET.length)];
  const city = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];
  const number = String(Math.floor(Math.random() * 90) + 10).padStart(2, "0");
  
  return `${greekLetter}-${city}-${number}`;
}
