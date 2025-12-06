// Mock Firebase Implementation with IndexedDB for Better Storage
// This is a client-side only mock that simulates Firebase functionality
// Data is stored in IndexedDB for larger storage capacity (up to several hundred MB)

// Database configuration
const DB_NAME = 'ConsouliumDB';
const DB_VERSION = 1;
const STORE_NAME = 'appData';

// Open IndexedDB connection
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };
    });
}

// Mock database object
export const db = { type: 'mock-firebase-indexeddb' };

// Reference function that creates a path reference
export const ref = (db: any, path: string) => {
    return { path };
};

// Set function that saves data to IndexedDB
export const set = (ref: any, value: any) => {
    return new Promise<void>((resolve, reject) => {
        openDB()
            .then(db => {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.put({ key: ref.path, value: value });
                
                request.onsuccess = () => {
                    console.log(`[Mock Firebase IndexedDB] Data saved to ${ref.path}`);
                    resolve();
                };
                
                request.onerror = () => {
                    console.error('[Mock Firebase IndexedDB] Error saving data:', request.error);
                    reject(request.error);
                };
            })
            .catch(error => {
                console.error('[Mock Firebase IndexedDB] Error opening DB:', error);
                reject(error);
            });
    });
};

// Remove function that deletes data from IndexedDB
export const remove = (ref: any) => {
    return new Promise<void>((resolve, reject) => {
        openDB()
            .then(db => {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.delete(ref.path);
                
                request.onsuccess = () => {
                    console.log(`[Mock Firebase IndexedDB] Data removed from ${ref.path}`);
                    resolve();
                };
                
                request.onerror = () => {
                    console.error('[Mock Firebase IndexedDB] Error removing data:', request.error);
                    reject(request.error);
                };
            })
            .catch(error => {
                console.error('[Mock Firebase IndexedDB] Error opening DB:', error);
                reject(error);
            });
    });
};

// OnValue function that listens for data changes
export const onValue = (ref: any, callback: (snapshot: any) => void) => {
    // Initial data fetch
    const fetchData = () => {
        openDB()
            .then(db => {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(ref.path);
                
                request.onsuccess = () => {
                    const result = request.result ? request.result.value : null;
                    callback({
                        val: () => result
                    });
                };
                
                request.onerror = () => {
                    console.error('[Mock Firebase IndexedDB] Error fetching data:', request.error);
                    callback({
                        val: () => null
                    });
                };
            })
            .catch(error => {
                console.error('[Mock Firebase IndexedDB] Error opening DB:', error);
                callback({
                    val: () => null
                });
            });
    };
    
    // Fetch initial data
    fetchData();
    
    // Set up polling to simulate real-time updates (every 2 seconds)
    const intervalId = setInterval(fetchData, 2000);
    
    // Return unsubscribe function
    return () => {
        clearInterval(intervalId);
    };
};