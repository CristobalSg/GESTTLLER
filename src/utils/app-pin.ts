const PIN_LENGTH = 6;
const PIN_PATTERN = /^\d{6}$/;

export function sanitizePinInput(value: string) {
  return value.replace(/\D/g, "").slice(0, PIN_LENGTH);
}

export function isPinFormatValid(pin: string) {
  return PIN_PATTERN.test(pin);
}

export function getAppPin() {
  const configuredPin = sanitizePinInput(import.meta.env.VITE_APP_PIN ?? "");

  if (!isPinFormatValid(configuredPin)) {
    return undefined;
  }

  return configuredPin;
}

export { PIN_LENGTH };
