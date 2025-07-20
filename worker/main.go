package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/oklog/ulid/v2"
	amqp "github.com/rabbitmq/amqp091-go"
	"golang.org/x/exp/rand"
)

type ULIDMessage struct {
    ID string `json:"id"`
}

type Worker struct {
    conn    *amqp.Connection
    channel *amqp.Channel
    mu      sync.Mutex
}

func NewWorker(url string) (*Worker, error) {
    conn, err := amqp.Dial(url)
    if err != nil {
        return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
    }

    ch, err := conn.Channel()
    if err != nil {
        conn.Close()
        return nil, fmt.Errorf("failed to open channel: %w", err)
    }

    // Declare exchange
    err = ch.ExchangeDeclare(
        "ulid_exchange",
        "direct",
        true,
        false,
        false,
        false,
        nil,
    )
    if err != nil {
        ch.Close()
        conn.Close()
        return nil, fmt.Errorf("failed to declare exchange: %w", err)
    }

    // Declare queue
    _, err = ch.QueueDeclare(
        "ulid_queue",
        true,
        false,
        false,
        false,
        nil,
    )
    if err != nil {
        ch.Close()
        conn.Close()
        return nil, fmt.Errorf("failed to declare queue: %w", err)
    }

    // Bind queue to exchange
    err = ch.QueueBind(
        "ulid_queue",
        "ulid",
        "ulid_exchange",
        false,
        nil,
    )
    if err != nil {
        ch.Close()
        conn.Close()
        return nil, fmt.Errorf("failed to bind queue: %w", err)
    }

    return &Worker{
        conn:    conn,
        channel: ch,
    }, nil
}

func (w *Worker) Close() {
    if w.channel != nil {
        w.channel.Close()
    }
    if w.conn != nil {
        w.conn.Close()
    }
}
var (
	entropy     io.Reader
	entropyOnce sync.Once
)
func DefaultEntropy() io.Reader {
    entropyOnce.Do(func() {
		rng := rand.New(rand.NewSource(uint64(time.Now().UnixNano())))
        fmt.Println(uint64(time.Now().UnixNano()))
		entropy = &ulid.LockedMonotonicReader{
        MonotonicReader: ulid.Monotonic(rng, 0),
    }
	})
	return entropy
}

func NextID() ulid.ULID {
	return ulid.MustNew(ulid.Now(), DefaultEntropy())
}

func (w *Worker) generateAndSendULID(ctx context.Context, workerID int, rate int) {
    ticker := time.NewTicker(time.Second / time.Duration(rate))
    defer ticker.Stop()

    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            id := NextID()
            msg := ULIDMessage{ID: id.String()}

            body, err := json.Marshal(msg)
            if err != nil {
                log.Printf("Worker %d: Failed to marshal message: %v", workerID, err)
                continue
            }

            w.mu.Lock()
            err = w.channel.PublishWithContext(
                ctx,
                "ulid_exchange",
                "ulid",
                false,
                false,
                amqp.Publishing{
                    ContentType: "application/json",
                    Body:        body,
                },
            )
            w.mu.Unlock()

            if err != nil {
                log.Printf("Worker %d: Failed to publish message: %v", workerID, err)
            }
        }
    }
}

func main() {
    rabbitmqURL := os.Getenv("RABBITMQ_URL")
    if rabbitmqURL == "" {
        rabbitmqURL = "amqp://admin:admin123@localhost:5672/"
    }

    workerCount, _ := strconv.Atoi(os.Getenv("WORKER_COUNT"))
    if workerCount <= 0 {
        workerCount = 5
    }

    ulidRate, _ := strconv.Atoi(os.Getenv("ULID_RATE"))
    if ulidRate <= 0 {
        ulidRate = 1000
    }

    // Wait for RabbitMQ to be ready
    time.Sleep(10 * time.Second)

    worker, err := NewWorker(rabbitmqURL)
    if err != nil {
        log.Fatalf("Failed to create worker: %v", err)
    }
    defer worker.Close()

    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    var wg sync.WaitGroup
    for i := 0; i < workerCount; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            worker.generateAndSendULID(ctx, id, ulidRate/workerCount)
        }(i)
    }

    log.Printf("Started %d workers, generating %d ULIDs/second", workerCount, ulidRate)
    wg.Wait()
}
