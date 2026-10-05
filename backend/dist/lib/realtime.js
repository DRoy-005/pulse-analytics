// ============================================================
// PulseAnalytics Realtime Broadcaster
// ============================================================
//
// Keeps track of connected Server-Sent Events clients.
//
// When a new event is created, the event controller calls
// broadcastEvent() and every connected browser receives it.
//
// This is an in-memory broadcaster for the current MVP.
//
// Later, when we scale to multiple backend instances, this
// can be replaced with Redis Pub/Sub or Kafka.
//
// ============================================================
// ============================================================
// Connected SSE clients
// ============================================================
const clients = new Map();
// ============================================================
// Add a realtime client
// ============================================================
export function addRealtimeClient(clientId, workspaceId, response) {
    clients.set(clientId, {
        workspaceId,
        response,
    });
}
// ============================================================
// Remove a realtime client
// ============================================================
export function removeRealtimeClient(clientId) {
    clients.delete(clientId);
}
// ============================================================
// Broadcast a new event
// ============================================================
//
// Only clients connected to the same workspace receive
// the event.
//
// ============================================================
export function broadcastEvent(workspaceId, event) {
    const message = `data: ${JSON.stringify(event)}\n\n`;
    for (const [clientId, client,] of clients.entries()) {
        if (client.workspaceId !== workspaceId) {
            continue;
        }
        try {
            client.response.write(message);
        }
        catch (error) {
            console.error(`Failed to send realtime event to client ${clientId}:`, error);
            clients.delete(clientId);
        }
    }
}
// ============================================================
// Send heartbeat
// ============================================================
//
// Keeps idle SSE connections alive.
//
// ============================================================
export function sendHeartbeat() {
    for (const [clientId, client,] of clients.entries()) {
        try {
            client.response.write(": heartbeat\n\n");
        }
        catch (error) {
            console.error(`Failed to send heartbeat to client ${clientId}:`, error);
            clients.delete(clientId);
        }
    }
}
// ============================================================
// Connected client count
// ============================================================
export function getRealtimeClientCount() {
    return clients.size;
}
