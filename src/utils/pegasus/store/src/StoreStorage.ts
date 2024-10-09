import { definePegasusBrowserAPI } from "@utils/pegasus/transport";
import { DeserializerFn, PegasusStoreAction, PegasusStoreAnyAction, SerializerFn } from "./types";

export type StoreStorageStrategy = "indexedDb" | undefined;

export class StoreStorage<S, A extends PegasusStoreAction = PegasusStoreAnyAction> {
  private readonly dbName = "PegasusStore";

  private readonly objectStoreName = "state";

  private db: IDBDatabase | null = null;

  constructor(
    private readonly storeName: string,
    private readonly storageStrategy: StoreStorageStrategy,
    private readonly serializer: SerializerFn<S | A>,
    private readonly deserializer: DeserializerFn<S | A>
  ) {
    if (storageStrategy === "indexedDb") {
      this.initIndexedDB();
    }
  }

  private initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(new Error("Error opening IndexedDB"));
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(this.objectStoreName);
      };
    });
  }

  async getState(): Promise<S | undefined> {
    if (this.storageStrategy === undefined) {
      return undefined;
    }

    await this.initIndexedDB();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"));
        return;
      }

      const transaction = this.db.transaction(this.objectStoreName, "readonly");
      const objectStore = transaction.objectStore(this.objectStoreName);
      const request = objectStore.get(this.storeName);

      request.onerror = () => reject(new Error("Error reading from IndexedDB"));
      request.onsuccess = () => {
        const stateStr = request.result;
        if (typeof stateStr === "string") {
          try {
            resolve(this.deserializer(stateStr) as S);
          } catch (err) {
            console.warn("Error deserializing preloaded state:", err, stateStr);
            resolve(undefined);
          }
        } else {
          resolve(undefined);
        }
      };
    });
  }

  async setState(state: S): Promise<void> {
    if (this.storageStrategy === undefined) {
      return;
    }

    await this.initIndexedDB();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("IndexedDB not initialized"));
        return;
      }

      const transaction = this.db.transaction(this.objectStoreName, "readwrite");
      const objectStore = transaction.objectStore(this.objectStoreName);
      const request = objectStore.put(this.serializer(state), this.storeName);

      request.onerror = () => reject(new Error("Error writing to IndexedDB"));
      request.onsuccess = () => resolve();
    });
  }
}
