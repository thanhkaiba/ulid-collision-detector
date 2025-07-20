package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/mux"
	"github.com/oklog/ulid/v2"
)

type ULIDMessage struct {
    ID string `json:"id"`
}

type CollisionDetector struct {
    store          sync.Map
    collisionCount uint64
    totalReceived  uint64
    cleanupTTL     time.Duration
}

type ULIDEntry struct {
    timestamp time.Time
}

type Stats struct {
    TotalReceived  uint64    `json:"total_received"`
    TotalCollisions uint64   `json:"total_collisions"`
    CollisionRate  float64   `json:"collision_rate"`
    Timestamp      time.Time `json:"timestamp"`
}

func NewCollisionDetector(ttl time.Duration) *CollisionDetector {
    cd := &CollisionDetector{
        cleanupTTL: ttl,
    }

    // Start cleanup goroutine
    go cd.cleanupOldEntries()

    return cd
}

func (cd *CollisionDetector) cleanupOldEntries() {
    ticker := time.NewTicker(time.Minute)
    defer ticker.Stop()

    for range ticker.C {
        now := time.Now()
        deleteCount := 0

        cd.store.Range(func(key, value interface{}) bool {
            entry := value.(ULIDEntry)
            if now.Sub(entry.timestamp) > cd.cleanupTTL {
                cd.store.Delete(key)
                deleteCount++
            }
            return true
        })

        if deleteCount > 0 {
            log.Printf("Cleaned up %d old ULID entries", deleteCount)
        }
    }
}

func (cd *CollisionDetector) ProcessULID(id string) {
    atomic.AddUint64(&cd.totalReceived, 1)

    entry := ULIDEntry{timestamp: time.Now()}

    // Check if ULID already exists
    if _, loaded := cd.store.LoadOrStore(id, entry); loaded {
        atomic.AddUint64(&cd.collisionCount, 1)
        log.Printf("COLLISION DETECTED: %s", id)
    }
}

func (cd *CollisionDetector) GetStats() Stats {
    total := atomic.LoadUint64(&cd.totalReceived)
    collisions := atomic.LoadUint64(&cd.collisionCount)

    rate := float64(0)
    if total > 0 {
        rate = float64(collisions) / float64(total) * 100
    }

    return Stats{
        TotalReceived:   total,
        TotalCollisions: collisions,
        CollisionRate:   rate,
        Timestamp:       time.Now(),
    }
}

func main() {
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    ttlStr := os.Getenv("ULID_TTL")
    ttl, err := time.ParseDuration(ttlStr)
    if err != nil {
        ttl = 5 * time.Minute
    }

    detector := NewCollisionDetector(ttl)

    router := mux.NewRouter()

    // Health check endpoint
    router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        w.Write([]byte("OK"))
    }).Methods("GET")

    // ULID submission endpoint
    router.HandleFunc("/ulid", func(w http.ResponseWriter, r *http.Request) {
        var msg ULIDMessage
        if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
            http.Error(w, "Invalid request body", http.StatusBadRequest)
            return
        }

        // Validate ULID format
        if _, err := ulid.Parse(msg.ID); err != nil {
            http.Error(w, "Invalid ULID format", http.StatusBadRequest)
            return
        }
        fmt.Println(msg.ID)

        detector.ProcessULID(msg.ID)

        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(map[string]string{"status": "processed"})
    }).Methods("POST")

    // Stats endpoint
    router.HandleFunc("/stats", func(w http.ResponseWriter, r *http.Request) {
        stats := detector.GetStats()
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(stats)
    }).Methods("GET")

    log.Printf("Collision Detection Service starting on port %s", port)
    log.Printf("ULID TTL: %v", ttl)

    if err := http.ListenAndServe(":"+port, router); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}
