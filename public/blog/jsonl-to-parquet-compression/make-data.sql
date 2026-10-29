-- Mock data for "A Story about Parquet": 1.5 million made-up records shaped
-- like a data-lake export (ids, a status, booleans written as "TRUE",
-- timestamps in order, amounts, and mostly empty fields), written four ways
-- so the sizes can be compared. One thread and a fixed seed, so a run gives
-- the same data each time.
--
--   duckdb -c ".read make-data.sql"     (DuckDB 1.5; writes into this folder)

SET threads = 1;
SELECT setseed(0.42);

CREATE TABLE export AS
SELECT
  i AS id,
  'ACC-' || lpad(floor(random() * 200000)::BIGINT::VARCHAR, 6, '0') AS account_id,
  ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'PENDING', 'CLOSED', 'SUSPENDED', 'FAILED', 'REVIEW'][1 + floor(random() * 9)::BIGINT] AS status,
  random() < 0.8 AS active,
  random() < 0.03 AS flagged,
  -- About 20 seconds apart across the year, in order, as an export would be.
  TIMESTAMP '2025-01-01' + to_seconds(i * 21 + floor(random() * 20)::BIGINT) AS created_at,
  round(random() * 500, 2)::DECIMAL(10, 2) AS amount,
  CASE WHEN random() < 0.02 THEN 'EUR' ELSE 'GBP' END AS currency,
  ['North', 'South', 'East', 'West', 'Midlands', 'Scotland', 'Wales', 'London'][1 + floor(random() * 8)::BIGINT] AS region,
  ['web', 'app', 'phone', 'post'][1 + floor(random() * 4)::BIGINT] AS channel,
  CASE WHEN random() < 0.05 THEN 'manual check ' || floor(random() * 1000)::BIGINT END AS note,
  CASE WHEN random() < 0.1 THEN 'REF-' || floor(random() * 100000)::BIGINT END AS external_ref
FROM range(1500000) t(i);

-- The export writes booleans as the strings "TRUE" and "FALSE".
CREATE VIEW as_exported AS
SELECT * REPLACE (
  CASE WHEN active THEN 'TRUE' ELSE 'FALSE' END AS active,
  CASE WHEN flagged THEN 'TRUE' ELSE 'FALSE' END AS flagged
) FROM export ORDER BY id;

COPY as_exported TO 'export.jsonl' (FORMAT json);
COPY as_exported TO 'export.jsonl.zst' (FORMAT json, COMPRESSION zstd);
COPY (FROM export ORDER BY id) TO 'export-plain.parquet' (FORMAT parquet, COMPRESSION uncompressed);
COPY (FROM export ORDER BY id) TO 'export.parquet' (FORMAT parquet, COMPRESSION zstd);
-- The first 1,000 lines, small enough to keep in the repo.
COPY (FROM as_exported LIMIT 1000) TO 'sample.jsonl' (FORMAT json);
