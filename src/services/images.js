// Shown when a vehicle's photo link is missing or broken
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">' +
      '<rect width="800" height="500" fill="#151515"/>' +
      '<text x="400" y="250" font-size="120" text-anchor="middle" dominant-baseline="middle">🚗</text>' +
      '<text x="400" y="370" font-size="28" fill="#777" text-anchor="middle" font-family="Arial">Photo coming soon</text>' +
      "</svg>"
  );

export const vehicleImage = (url) => url || PLACEHOLDER;

// onError handler for <img>: swap in the placeholder once
export const handleImageError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = PLACEHOLDER;
};
