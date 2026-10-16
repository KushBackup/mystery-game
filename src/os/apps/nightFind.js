import { createContext } from 'react';

/** The Night header's search button and the lounge's find field (NightApp.jsx → NightRoom.jsx). */
export const NightFind = createContext({ finding: false, done: () => {} });
