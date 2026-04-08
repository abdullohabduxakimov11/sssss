import { v4 as uuidv4 } from 'uuid';

// --- Mock Types ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export type FirebaseUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  tenantId: string | null;
  providerData: any[];
};

// --- LocalStorage Helpers ---
const getCollection = (name: string): any[] => {
  const data = localStorage.getItem(`db_${name}`);
  return data ? JSON.parse(data) : [];
};

const saveCollection = (name: string, data: any[]) => {
  localStorage.setItem(`db_${name}`, JSON.stringify(data));
  // Notify listeners in the same tab
  window.dispatchEvent(new CustomEvent(`db_change_${name}`, { detail: data }));
};

// Listen for changes from other tabs
window.addEventListener('storage', (e) => {
  if (e.key && e.key.startsWith('db_')) {
    const collName = e.key.replace('db_', '');
    window.dispatchEvent(new CustomEvent(`db_change_${collName}`));
  }
});

// --- Mock Auth ---
class MockAuth {
  private _currentUser: FirebaseUser | null = null;
  private _listeners: ((user: FirebaseUser | null) => void)[] = [];

  constructor() {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      this._currentUser = JSON.parse(savedUser);
    }

    // Cleanup: Remove unwanted staff members if they exist
    const unwantedEmails = ['logistmate@gmail.com', 'abdullohabduhakimov009@gmail.com', 'abdullohabdu123hakimov009@gmail.com'];
    const users = getCollection('users');
    const filteredUsers = users.filter(u => !unwantedEmails.includes(u.email));
    if (filteredUsers.length !== users.length) {
      saveCollection('users', filteredUsers);
    }
  }

  get currentUser() {
    return this._currentUser;
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    this._listeners.push(callback);
    callback(this._currentUser);
    return () => {
      this._listeners = this._listeners.filter(l => l !== callback);
    };
  }

  private _notify() {
    this._listeners.forEach(l => l(this._currentUser));
  }

  async signInWithEmailAndPassword(email: string, _pass: string) {
    // Simple mock: find user in 'users' collection or just create a session
    const users = getCollection('users');
    let user = users.find(u => u.email === email);
    
    if (!user) {
      const error: any = new Error('User not found');
      error.code = 'auth/user-not-found';
      throw error;
    }

    this._currentUser = {
      uid: user.uid || user.id,
      email: user.email,
      displayName: user.displayName || user.name || null,
      emailVerified: true,
      isAnonymous: false,
      tenantId: null,
      providerData: []
    };
    localStorage.setItem('auth_user', JSON.stringify(this._currentUser));
    this._notify();
    return { user: this._currentUser };
  }

  async createUserWithEmailAndPassword(email: string, _pass: string, role?: string, displayName?: string) {
    const users = getCollection('users');
    if (users.some(u => u.email === email)) {
      const error: any = new Error('Email already in use');
      error.code = 'auth/email-already-in-use';
      throw error;
    }

    const uid = uuidv4();
    this._currentUser = {
      uid,
      email,
      displayName: displayName || null,
      emailVerified: false,
      isAnonymous: false,
      tenantId: null,
      providerData: []
    };
    
    // Also save to 'users' collection if role is provided
    if (role) {
      users.push({ ...this._currentUser, role, createdAt: serverTimestamp() });
      saveCollection('users', users);
    }

    localStorage.setItem('auth_user', JSON.stringify(this._currentUser));
    this._notify();
    return { user: this._currentUser };
  }

  async signOut() {
    this._currentUser = null;
    localStorage.removeItem('auth_user');
    this._notify();
  }

  async updateProfile(user: any, profile: { displayName?: string; photoURL?: string }) {
    if (this._currentUser && this._currentUser.uid === user.uid) {
      this._currentUser.displayName = profile.displayName || this._currentUser.displayName;
      localStorage.setItem('auth_user', JSON.stringify(this._currentUser));
      this._notify();
    }
  }

  async sendEmailVerification() {
    console.log('Mock: Email verification sent');
  }
}

export const auth = new MockAuth();
export const onAuthStateChanged = (authObj: any, callback: any) => authObj.onAuthStateChanged(callback);
export const signOut = (authObj: any) => authObj.signOut();
export const signInWithEmailAndPassword = (authObj: any, email: string, pass: string) => authObj.signInWithEmailAndPassword(email, pass);
export const createUserWithEmailAndPassword = (authObj: any, email: string, pass: string, ...extra: any[]) => authObj.createUserWithEmailAndPassword(email, pass, ...extra);
export const sendEmailVerification = (user: any) => auth.sendEmailVerification();
export const updateProfile = (user: any, profile: any) => auth.updateProfile(user, profile);

// --- Mock Firestore ---
export const db = { type: 'mock_db' };

export const collection = (_db: any, ...path: string[]) => ({ type: 'collection', name: path.join('/') });

export const doc = (_dbOrColl: any, ...path: string[]) => {
  if (typeof _dbOrColl === 'string') {
    // Handle doc(db, "coll", "id")
    return { type: 'doc', collection: _dbOrColl, id: path[0] };
  }
  if (_dbOrColl.type === 'collection') {
    // Handle doc(collection(db, "coll"), "id")
    return { type: 'doc', collection: _dbOrColl.name, id: path[0] };
  }
  // Handle doc(db, "path/to/doc")
  const fullPath = path.join('/');
  const parts = fullPath.split('/');
  return { type: 'doc', collection: parts.slice(0, -1).join('/'), id: parts[parts.length - 1] };
};

export const query = (coll: any, ...constraints: any[]) => ({ type: 'query', collection: coll.name, constraints });

export const where = (field: string, op: string, value: any) => ({ type: 'where', field, op, value });
export const orderBy = (field: string, direction: string = 'asc') => ({ type: 'orderBy', field, direction });
export const limit = (n: number) => ({ type: 'limit', n });

export const serverTimestamp = () => new Date().toISOString();

export const addDoc = async (coll: any, data: any) => {
  const items = getCollection(coll.name);
  const id = uuidv4();
  const newItem = { ...data, id, createdAt: data.createdAt || serverTimestamp() };
  items.push(newItem);
  saveCollection(coll.name, items);
  return { id, ...newItem };
};

export const setDoc = async (docRef: any, data: any, options?: { merge?: boolean }) => {
  const items = getCollection(docRef.collection);
  const index = items.findIndex(i => (i.id === docRef.id || i.uid === docRef.id));
  
  if (index > -1) {
    if (options?.merge) {
      items[index] = { ...items[index], ...data, updatedAt: serverTimestamp() };
    } else {
      items[index] = { ...data, id: docRef.id, updatedAt: serverTimestamp() };
    }
  } else {
    items.push({ ...data, id: docRef.id, createdAt: serverTimestamp() });
  }
  saveCollection(docRef.collection, items);
};

export const updateDoc = async (docRef: any, data: any) => {
  const items = getCollection(docRef.collection);
  const index = items.findIndex(i => (i.id === docRef.id || i.uid === docRef.id));
  if (index > -1) {
    items[index] = { ...items[index], ...data, updatedAt: serverTimestamp() };
    saveCollection(docRef.collection, items);
  } else {
    throw new Error('Document not found');
  }
};

export const deleteDoc = async (docRef: any) => {
  const items = getCollection(docRef.collection);
  const newItems = items.filter(i => (i.id !== docRef.id && i.uid !== docRef.id));
  saveCollection(docRef.collection, newItems);
};

export const getDoc = async (docRef: any) => {
  const items = getCollection(docRef.collection);
  const item = items.find(i => (i.id === docRef.id || i.uid === docRef.id));
  return {
    exists: () => !!item,
    data: () => item ? { ...item } : undefined,
    id: docRef.id,
    metadata: { hasPendingWrites: false }
  };
};

export const getDocs = async (q: any) => {
  let items = getCollection(q.collection || q.name);
  
  // Apply constraints (very basic implementation)
  if (q.constraints) {
    q.constraints.forEach((c: any) => {
      if (c.type === 'where') {
        items = items.filter(i => {
          const val = i[c.field];
          if (c.op === '==') return val === c.value;
          if (c.op === '!=') return val !== c.value;
          if (c.op === '>') return val > c.value;
          if (c.op === '<') return val < c.value;
          return true;
        });
      }
      if (c.type === 'orderBy') {
        items.sort((a, b) => {
          const valA = a[c.field];
          const valB = b[c.field];
          if (valA < valB) return c.direction === 'asc' ? -1 : 1;
          if (valA > valB) return c.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
      if (c.type === 'limit') {
        items = items.slice(0, c.n);
      }
    });
  }

  return {
    docs: items.map(i => ({
      id: i.id,
      data: () => ({ ...i }),
      metadata: { hasPendingWrites: false }
    })),
    empty: items.length === 0,
    size: items.length,
    docChanges: () => []
  };
};

export const onSnapshot = (qOrDoc: any, callback: any, errorCallback?: any) => {
  const collName = qOrDoc.collection || qOrDoc.name;
  let previousDocs: any[] = [];
  
  const handler = async () => {
    try {
      if (qOrDoc.type === 'doc') {
        const snap = await getDoc(qOrDoc);
        callback(snap);
      } else {
        const snap = await getDocs(qOrDoc);
        const currentDocs = snap.docs;
        
        // Mock docChanges
        const docChanges = () => {
          const changes: any[] = [];
          
          if (previousDocs.length === 0) {
            // Initial load: all are "added"
            return currentDocs.map(doc => ({
              type: 'added',
              doc
            }));
          }
          
          currentDocs.forEach(doc => {
            const prev = previousDocs.find(p => p.id === doc.id);
            if (!prev) {
              changes.push({
                type: 'added',
                doc
              });
            } else if (JSON.stringify(prev.data()) !== JSON.stringify(doc.data())) {
              changes.push({
                type: 'modified',
                doc
              });
            }
          });
          
          previousDocs.forEach(prev => {
            if (!currentDocs.find(d => d.id === prev.id)) {
              changes.push({
                type: 'removed',
                doc: prev
              });
            }
          });
          
          return changes;
        };

        const enrichedSnap = {
          ...snap,
          docChanges
        };
        
        callback(enrichedSnap);
        previousDocs = currentDocs;
      }
    } catch (err) {
      if (errorCallback) errorCallback(err);
    }
  };

  window.addEventListener(`db_change_${collName}`, handler);
  handler(); // Initial call

  return () => {
    window.removeEventListener(`db_change_${collName}`, handler);
  };
};

export const writeBatch = (_db: any) => {
  const operations: (() => Promise<void>)[] = [];
  return {
    update: (docRef: any, data: any) => {
      operations.push(() => updateDoc(docRef, data));
    },
    set: (docRef: any, data: any, options?: any) => {
      operations.push(() => setDoc(docRef, data, options));
    },
    delete: (docRef: any) => {
      operations.push(() => deleteDoc(docRef));
    },
    commit: async () => {
      for (const op of operations) {
        await op();
      }
    }
  };
};

export const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  console.error(`Mock Firestore Error [${operationType}] at [${path}]:`, error);
};

export const isFirebaseConfigured = true;
