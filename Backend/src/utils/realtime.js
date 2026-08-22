import { EventEmitter } from "events";

// Single app-wide emitter used to push real-time updates
// (new uploads, channel changes) to SSE clients.
export const realtimeEmitter = new EventEmitter();

// Allow many concurrent SSE connections
realtimeEmitter.setMaxListeners(0);
