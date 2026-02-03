const DEVICE_ID_KEY = "jarvis_device_id";

/**
 * Generates a unique device ID using crypto.randomUUID
 */
function generateDeviceId(): string {
  return crypto.randomUUID();
}

/**
 * Gets or creates a persistent device ID stored in localStorage.
 * This ID is used to identify the user across sessions without requiring authentication.
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
    console.log("[JARVIS] Created new device ID:", deviceId);
  }
  
  return deviceId;
}

/**
 * Clears the device ID from localStorage.
 * This effectively creates a "new user" for the assistant.
 */
export function clearDeviceId(): void {
  localStorage.removeItem(DEVICE_ID_KEY);
  console.log("[JARVIS] Device ID cleared");
}
