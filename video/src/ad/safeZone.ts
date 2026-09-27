/**
 * safeZone.ts — whether to draw the Meta safe-zone overlay.
 *
 * A context rather than a prop so the precheck composition can turn it on for
 * every shot without threading it through eight scene signatures.
 */

import { createContext, useContext } from "react";

export const SafeZoneContext = createContext(false);
export const useSafeZone = () => useContext(SafeZoneContext);
