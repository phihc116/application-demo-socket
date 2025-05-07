# Herond Notification
 
## 1. 📌 System Objective

To build a Websocket Server that maintains real-time connections with clients and expose a gRPC interface to allow other backend services to send real-time messages to connected clients.

## 2. 🏗️ High-Level Architecture

```
[ Backend Service A ]        [ Backend Service B ]
          |                            |
          | gRPC                       | gRPC
          v                            v
          [ WebSocket Server (Node.js + gRPC) ]
                             |
                             | WebSocket (Socket.IO)
                             v
                         [ Client (Browser/App) ]
```

## 3. 🧩 System Components

### 3.1. WebSocket Server
- **Tech stack:** Node.js, TypeScript  
- **Libraries:** `socket.io`, `@grpc/grpc-js`, `protocol buffer compiler`  
- **Responsibilities:**
  - Maintain persistent WebSocket connections with clients.
  - Expose a gRPC interface for backend services.
  - Send real-time messages to clients based on `socketId` or `userId`.

### 3.2. Backend Services
- **Tech stack:** Any (e.g., .NET, Go, Java, etc.)
- **Responsibilities:**
  - Business logic.
  - Call gRPC service to deliver real-time messages to clients.

## 4. 📡 Communication Protocols

### 4.1. WebSocket
- Implemented via [Socket.IO](https://socket.io/).
- Event-based, bi-directional communication.

### 4.2. gRPC
- Uses Protocol Buffers for message serialization.
- Backend services communicate with WebSocket server through gRPC to send real-time messages.

## 5. 📝 gRPC API Definition (`notification.proto`)

```proto
syntax = "proto3";

package herond_notification;

service NotificationService {
  rpc SendMessage (SendMessageRequest) returns (SendMessageResponse);
  rpc BroadcastMessage (BroadcastMessageRequest) returns (BroadcastMessageResponse);
}

message SendMessageRequest {
  string socketId = 1;
  string fromServiceName = 2;  
  string userId = 3;
  string event = 4;
  string payload = 5;  
}

message SendMessageResponse {
  bool success = 1;
  string message = 2;
}

message BroadcastMessageRequest {
  string event = 1;
  string payload = 2;
}

message BroadcastMessageResponse {
  bool success = 1;
  string message = 2;
}
```

## 6. 🧠 Operational Flow

1. **Client** connects to the WebSocket Server via Socket.IO.
2. The server stores `socket.id` and maps it to `userId` (if available).
3. A backend service calls `SendMessage` via gRPC with:
   - `socketId` or `userId`
   - `event` (e.g., `new_message`, `update_status`)
   - `payload` (as a JSON string)
4. The WebSocket Server processes the gRPC request and sends the event to the client via WebSocket.

---

## 7. 📦 State Management

- **In-memory map:** `userId <-> socketId`
- **Optional:** Use Redis pub/sub for distributed WebSocket servers.

---

## 8. 🔒 Security Suggestions

- Authenticate users on WebSocket connection using **JWT** or **access token**.
- Enable **TLS** for gRPC in production environments.
- Restrict gRPC access to **trusted internal services** only.

---

## 9. 📈 Scalability

| Scenario                      | Solution                          |
|------------------------------|-----------------------------------|
| Multiple WebSocket servers   | Use Redis Adapter (`socket.io-redis`), Sticky Session |
| Group-based messaging        | Use Socket.IO `rooms`             |
| High-frequency message sending | Consider gRPC streaming (advanced) |

