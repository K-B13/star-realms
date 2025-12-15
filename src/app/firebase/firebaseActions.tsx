import { get, ref, remove, set, update } from "@firebase/database";
import { db } from "./firebaseConfig";


export const writeValue = (path: string, value: unknown) => set(ref(db, path), value)

export const updateValue = (path: string, value: object) => update(ref(db, path), value)

export const removeValue = (path: string) => remove(ref(db, path))

export const getValue = (path: string) => get(ref(db, path))