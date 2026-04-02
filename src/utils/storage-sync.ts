export const CLIENTS_STORAGE_KEY = "gesttller:clients:v1";
export const VEHICLES_STORAGE_KEY = "gesttller:vehicles:v1";
export const APPOINTMENTS_STORAGE_KEY = "gesttller:appointments:v1";

const STORAGE_SYNC_EVENT = "gesttller:storage-sync";

type StorageSyncDetail = {
  key: string;
};

export function notifyStorageSync(key: string) {
  window.dispatchEvent(new CustomEvent<StorageSyncDetail>(STORAGE_SYNC_EVENT, { detail: { key } }));
}

export function subscribeToStorageKey(key: string, onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === key) {
      onChange();
    }
  };

  const handleCustomSync = (event: Event) => {
    const customEvent = event as CustomEvent<StorageSyncDetail>;

    if (customEvent.detail?.key === key) {
      onChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(STORAGE_SYNC_EVENT, handleCustomSync as EventListener);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(STORAGE_SYNC_EVENT, handleCustomSync as EventListener);
  };
}
