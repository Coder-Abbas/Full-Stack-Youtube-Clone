import { asyncHandler } from "../utils/asyncHandler.js";
import { realtimeEmitter } from "../utils/realtime.js";

const SSE_HEADERS = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
};

// Server-Sent Events stream. Clients connect once and receive
// push events (video-published / channel-updated) in real time.
export const streamEvents = asyncHandler(async (req, res) => {
    res.writeHead(200, SSE_HEADERS);
    res.write("retry: 3000\n\n");

    const send = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Initial keep-alive comment so the stream opens immediately
    send("ready", { ok: true });

    const onVideoPublished = (payload) => send("video-published", payload);
    const onChannelUpdated = (payload) => send("channel-updated", payload);

    realtimeEmitter.on("video-published", onVideoPublished);
    realtimeEmitter.on("channel-updated", onChannelUpdated);

    // Heartbeat so proxies don't close an idle connection
    const heartbeat = setInterval(() => res.write(": ping\n\n"), 25000);

    req.on("close", () => {
        clearInterval(heartbeat);
        realtimeEmitter.off("video-published", onVideoPublished);
        realtimeEmitter.off("channel-updated", onChannelUpdated);
    });
});
