# SeedBridge — Architecture

## 1. High-level architecture

```mermaid
flowchart TD
    subgraph Client["React Client (Vite · TypeScript · Tailwind)"]
        AC["AuthContext\n(JWT in localStorage)"]
        APC["API client\n(Bearer header)"]
        SC["Socket.io client\n(auth.token)"]
        UI["Pages & Components\n(Router, SocketContext)"]
    end

    subgraph Proxy["Vite dev proxy"]
        P1["/api → :5000"]
        P2["/socket.io → :5000 (ws)"]
    end

    subgraph Server["Express Server (:5000)"]
        MW["Middleware\n(helmet · cors · rate-limit · verifyToken · requireRole · zod)"]
        RT["Routes\n(/auth · /listings · /saved · /interest · /notifications)"]
        CT["Controllers"]
        IO["Socket.io server\n(JWT auth · private rooms by userId)"]
    end

    subgraph DB["MongoDB"]
        C1[(users)]
        C2[(listings)]
        C3[(interestrequests)]
        C4[(savedlistings)]
        C5[(notifications)]
    end

    UI --> APC
    UI --> SC
    APC --> P1
    SC --> P2
    P1 --> MW
    P2 --> IO
    MW --> RT
    RT --> CT
    CT --> C1 & C2 & C3 & C4 & C5
    IO --> CT
```

The React client sends all HTTP traffic through the Vite dev proxy to Express; Socket.io uses a separate WebSocket proxy entry on the same target. The server enforces auth and role checks in middleware before requests reach controllers, which are the only layer that touches MongoDB.

---

## 2. Interest request flow

```mermaid
sequenceDiagram
    actor Investor
    participant API as Express API
    participant DB as MongoDB
    participant SIO as Socket.io
    actor Owner

    Investor->>API: POST /api/interest {listingId, message}
    API->>DB: Validate listing exists & isActive
    API->>DB: Check for duplicate (investor+listing) → 409 if exists
    API->>DB: Create InterestRequest {status: pending}
    API->>DB: Create Notification for owner
    API->>SIO: emitToUser(ownerId, "notification", notif)
    SIO-->>Owner: "notification" event (bell updates live)
    API-->>Investor: 201 {interestRequest}

    Owner->>API: PATCH /api/interest/:id {status: accepted|declined}
    API->>DB: Verify owner owns the listing → 403 if not
    API->>DB: Verify current status is pending → 409 if not
    API->>DB: Update InterestRequest status
    API->>DB: Create Notification for investor
    API->>SIO: emitToUser(investorId, "notification", notif)
    SIO-->>Investor: "notification" event (bell updates live)
    API-->>Owner: 200 {interestRequest}

    Investor->>API: GET /api/interest/sent
    Note over API,DB: owner.email added only when status is accepted
    API-->>Investor: 200 [{listing, status, ownerEmail if accepted}]
```

The owner's email is fetched from the User collection and attached to the response only for accepted requests in `GET /api/interest/sent`; it is never present on listing browse or detail responses.

---

## 3. Data model

```mermaid
erDiagram
    User {
        ObjectId _id PK
        string name
        string email
        string passwordHash
        string role
    }

    Listing {
        ObjectId _id PK
        ObjectId owner FK
        string businessName
        string industry
        string stage
        string revenueRange
        number fundingGoal
        boolean isActive
    }

    InterestRequest {
        ObjectId _id PK
        ObjectId listing FK
        ObjectId investor FK
        ObjectId owner FK
        string status
        string message
    }

    SavedListing {
        ObjectId _id PK
        ObjectId investor FK
        ObjectId listing FK
    }

    Notification {
        ObjectId _id PK
        ObjectId user FK
        ObjectId relatedRequest FK
        string type
        string message
        boolean read
    }

    User ||--o{ Listing : "owns"
    User ||--o{ InterestRequest : "sends as investor"
    User ||--o{ InterestRequest : "receives as owner"
    Listing ||--o{ InterestRequest : "receives"
    User ||--o{ SavedListing : "saves"
    Listing ||--o{ SavedListing : "saved by"
    User ||--o{ Notification : "receives"
    InterestRequest ||--o{ Notification : "triggers"
```

`InterestRequest` denormalises `owner` from the listing at creation time so that `GET /received` can query by `{ owner: userId }` directly without joining through `Listing`. `SavedListing` uses a compound unique index on `{investor, listing}` to make saving idempotent at the database level.
