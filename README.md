## How to use
1. **Start the system**:
```bash
# From the root directory
docker-compose up --build
```

2. **Monitor the system**:
- RabbitMQ Management: http://localhost:15672 (admin/admin123)
- Collision Stats: http://localhost:8080/stats
- Health Check: http://localhost:8080/health

## API Endpoints

### Collision Detection Service

1. **POST /ulid**
   - Submit a ULID for collision detection
   - Body: `{"id": "01ARZ3NDEKTSV4RRFFQ69G5FAV"}`

2. **GET /stats**
   - Get collision statistics
   - Response:
   ```json
   {
     "total_received": 100000,
     "total_collisions": 5,
     "collision_rate": 0.005,
     "timestamp": "2024-01-15T10:30:00Z"
   }
   ```

## Configuration Options

### Environment Variables

**Worker Service:**
- `RABBITMQ_URL`: RabbitMQ connection URL
- `WORKER_COUNT`: Number of goroutines per worker (default: 5)
- `ULID_RATE`: ULIDs generated per second (default: 1000)

**Collision Service:**
- `PORT`: HTTP server port (default: 8080)
- `CLEANUP_INTERVAL`: Cleanup interval for old entries (default: 60s)
- `ULID_TTL`: Time to keep ULIDs in memory (default: 300s)

## Performance Tuning

1. **RabbitMQ:**
   - Adjust `prefetch_count` in gogstash.yml for better throughput
   - Monitor queue depth and consumer rate

2. **Collision Service:**
   - Adjust `ULID_TTL` based on expected collision window
   - Monitor memory usage and adjust cleanup interval

3. **Workers:**
   - Scale worker replicas for higher ULID generation rate
   - Adjust `ULID_RATE` per worker instance

## Monitoring

The system provides several monitoring points:
- RabbitMQ Management UI for queue metrics
- Collision service `/stats` endpoint for collision metrics
- Docker logs for all services
- Health checks for service availability
