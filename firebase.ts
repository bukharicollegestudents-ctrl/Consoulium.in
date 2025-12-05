// Mock Firebase Implementation
// This replaces the actual Firebase SDK to allow the application to run 
// without valid credentials and resolves import errors.

const STORAGE_KEY = 'consoulium_data';

// Helper to get data from localStorage
const getStore = (): any => {
    try {
        const val = localStorage.getItem(STORAGE_KEY);
        return val ? JSON.parse(val) : {};
    } catch {
        return {};
    }
};

// Helper to save data to localStorage
const setStore = (data: any) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Event listeners for realtime updates
const listeners: Record<string, Function[]> = {};

// Trigger updates for a path
const emit = (path: string) => {
    // For simplicity in this mock, we trigger all listeners
    // In a real app, you would filter by path
    Object.values(listeners).flat().forEach(cb => cb());
};

export const db = { type: 'mock-db' };

export const ref = (db: any, path: string) => {
    return { path };
};

export const set = (ref: any, value: any) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            const store = getStore();
            const parts = ref.path.split('/');
            
            if (parts.length === 1) {
                // e.g. 'teams'
                store[parts[0]] = value;
            } else if (parts.length === 2) {
                // e.g. 'news/id'
                if (!store[parts[0]]) store[parts[0]] = {};
                store[parts[0]][parts[1]] = value;
            }
            
            setStore(store);
            emit(ref.path);
            resolve();
        }, 100);
    });
};

export const remove = (ref: any) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            const store = getStore();
            const parts = ref.path.split('/');
            
            if (parts.length === 2) {
                // e.g. delete 'news/id'
                if (store[parts[0]]) {
                    delete store[parts[0]][parts[1]];
                }
            } else if (parts.length === 1) {
                delete store[parts[0]];
            }
            
            setStore(store);
            emit(ref.path);
            resolve();
        }, 100);
    });
};

export const onValue = (ref: any, callback: (snapshot: any) => void) => {
    const listener = () => {
        const store = getStore();
        const parts = ref.path.split('/');
        let data = store;
        
        for (const part of parts) {
            if (data === undefined || data === null) break;
            data = data[part];
        }

        callback({
            val: () => data
        });
    };

    if (!listeners[ref.path]) listeners[ref.path] = [];
    listeners[ref.path].push(listener);

    // Initial call
    setTimeout(listener, 0);

    return () => {
        if (listeners[ref.path]) {
            listeners[ref.path] = listeners[ref.path].filter(l => l !== listener);
        }
    };
};
