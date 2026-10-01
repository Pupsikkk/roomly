# Adobe S3Mock (local object storage)

Lightweight **S3-compatible** mock used instead of MinIO (Docker Hub images removed in 2026).

- Internal URL: `http://s3mock:9090`
- Clients use the gateway: `POST /media`, `GET /media/:key`
- Bucket created on start via `COM_ADOBE_TESTING_S3MOCK_DOMAIN_INITIAL_BUCKETS` / `S3_BUCKET`
# Data persist under `infra/s3mock/data/` (directory is created by Compose mount).
# Do not put `.gitkeep` inside `data/` — S3Mock treats entries there as buckets.

Enable with `s3mock=1` in `infra/docker/services.conf`. Port is **not** published to the host.
