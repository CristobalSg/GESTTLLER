import { useSyncExternalStore } from "react";

import { getRouteByPath } from "./routes";

function subscribe(onStoreChange: () => void) {
  const handleChange = () => onStoreChange();

  window.addEventListener("popstate", handleChange);
  window.addEventListener("routechange", handleChange as EventListener);

  return () => {
    window.removeEventListener("popstate", handleChange);
    window.removeEventListener("routechange", handleChange as EventListener);
  };
}

function getSnapshot() {
  return getRouteByPath(window.location.pathname);
}

function getServerSnapshot() {
  return getRouteByPath("/");
}

export function useCurrentRoute() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
