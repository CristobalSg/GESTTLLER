import { useSyncExternalStore } from "react";

import { getAppPin, isPinFormatValid } from "./app-pin";

const AUTH_STORAGE_KEY = "gesttller.auth.session";
const AUTH_CHANGE_EVENT = "gesttller-auth-change";

type AuthSession = {
  isAuthenticated: true;
  loginAt: string;
};

type LoginResult =
  | { success: true }
  | { success: false; error: string };

function emitAuthChange() {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function readAuthSession() {
  const savedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!savedSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(savedSession) as Partial<AuthSession>;

    if (parsedSession.isAuthenticated !== true || typeof parsedSession.loginAt !== "string") {
      return null;
    }

    return parsedSession as AuthSession;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  return readAuthSession()?.isAuthenticated === true;
}

export function loginWithPin(pin: string): LoginResult {
  if (typeof window === "undefined") {
    return { success: false, error: "El acceso no esta disponible en este entorno." };
  }

  if (!isPinFormatValid(pin)) {
    return { success: false, error: "El PIN debe tener exactamente 6 digitos." };
  }

  const configuredPin = getAppPin();

  if (!configuredPin) {
    return { success: false, error: "El PIN de acceso no esta configurado correctamente." };
  }

  if (pin !== configuredPin) {
    return { success: false, error: "El PIN ingresado no coincide." };
  }

  const session: AuthSession = {
    isAuthenticated: true,
    loginAt: new Date().toISOString(),
  };

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  emitAuthChange();

  return { success: true };
}

export function logout() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  emitAuthChange();
}

function subscribe(onStoreChange: () => void) {
  const handleAuthChange = () => onStoreChange();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === AUTH_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange as EventListener);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange as EventListener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getSnapshot() {
  return isAuthenticated();
}

function getServerSnapshot() {
  return false;
}

export function useIsAuthenticated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
