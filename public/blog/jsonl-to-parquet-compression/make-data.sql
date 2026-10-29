-- A fake export for "A Story about Parquet". The real one can't be shared, so
-- this is a guess at its shape: 1.5 million records and 106 fields,
--     1 id that counts up            12 timestamps, in order
--     5 random ids (like UUIDs)      20 small sets of values, like status
--    15 true/false, written "TRUE"   15 numbers
--    10 reference codes              28 mostly empty (95% null)
-- written four ways so the sizes can be compared, plus a 100-line sample.
-- One thread and a fixed seed, so a run gives the same files each time.
--
--   duckdb fake.duckdb -c ".read make-data.sql"   (DuckDB 1.5; about 5 GB of files)

SET threads = 1;
SET memory_limit = '8GB';
SELECT setseed(0.42);

-- n random hex digits, and a random id shaped like a UUID.
CREATE MACRO hex(n) AS lpad(printf('%x', floor(random() * 16 ** n)::BIGINT), n, '0');
CREATE MACRO fake_uuid() AS
  hex(8) || '-' || hex(4) || '-' || hex(4) || '-' || hex(4) || '-' || hex(8) || hex(4);

CREATE TABLE export AS
SELECT
  -- counts up
  i AS id,
  -- random ids
  fake_uuid() AS uuid_ref_1,
  fake_uuid() AS uuid_ref_2,
  fake_uuid() AS uuid_ref_3,
  fake_uuid() AS uuid_ref_4,
  fake_uuid() AS uuid_ref_5,
  -- timestamps, in order
  TIMESTAMP '2025-01-01' + to_seconds(i * 20 + floor(random() * 20)::BIGINT) AS timestamp_01,
  TIMESTAMP '2025-01-01' + to_seconds(i * 20 + floor(random() * 2592000)::BIGINT) AS timestamp_02,
  TIMESTAMP '2025-01-01' + to_seconds(i * 20 + floor(random() * 2592000)::BIGINT) AS timestamp_03,
  TIMESTAMP '2025-01-01' + to_seconds(i * 20 + floor(random() * 2592000)::BIGINT) AS timestamp_04,
  TIMESTAMP '2025-01-01' + to_seconds(i * 20 + floor(random() * 2592000)::BIGINT) AS timestamp_05,
  TIMESTAMP '2025-01-01' + to_seconds(i * 20 + floor(random() * 2592000)::BIGINT) AS timestamp_06,
  TIMESTAMP '2025-01-01' + to_seconds(i * 20 + floor(random() * 2592000)::BIGINT) AS timestamp_07,
  TIMESTAMP '2025-01-01' + to_seconds(i * 20 + floor(random() * 2592000)::BIGINT) AS timestamp_08,
  TIMESTAMP '2025-01-01' + to_seconds(i * 20 + floor(random() * 2592000)::BIGINT) AS timestamp_09,
  TIMESTAMP '2025-01-01' + to_seconds(i * 20 + floor(random() * 2592000)::BIGINT) AS timestamp_10,
  TIMESTAMP '2025-01-01' + to_seconds(i * 20 + floor(random() * 2592000)::BIGINT) AS timestamp_11,
  TIMESTAMP '2025-01-01' + to_seconds(i * 20 + floor(random() * 2592000)::BIGINT) AS timestamp_12,
  -- small sets of values
  ['ACTIVE', 'ACTIVE', 'ACTIVE', 'PENDING', 'CLOSED', 'SUSPENDED', 'FAILED', 'REVIEW'][1 + floor(random() * 8)::BIGINT] AS status,
  CASE WHEN random() < 0.02 THEN 'EUR' ELSE 'GBP' END AS currency,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D', 'CATEGORY_E', 'CATEGORY_F', 'CATEGORY_G', 'CATEGORY_H', 'CATEGORY_I', 'CATEGORY_J'][1 + floor(random() * 10)::BIGINT] AS category_03,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D', 'CATEGORY_E', 'CATEGORY_F', 'CATEGORY_G'][1 + floor(random() * 7)::BIGINT] AS category_04,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D'][1 + floor(random() * 4)::BIGINT] AS category_05,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D', 'CATEGORY_E', 'CATEGORY_F', 'CATEGORY_G', 'CATEGORY_H', 'CATEGORY_I'][1 + floor(random() * 9)::BIGINT] AS category_06,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D', 'CATEGORY_E', 'CATEGORY_F'][1 + floor(random() * 6)::BIGINT] AS category_07,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C'][1 + floor(random() * 3)::BIGINT] AS category_08,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D', 'CATEGORY_E', 'CATEGORY_F', 'CATEGORY_G', 'CATEGORY_H'][1 + floor(random() * 8)::BIGINT] AS category_09,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D', 'CATEGORY_E'][1 + floor(random() * 5)::BIGINT] AS category_10,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D', 'CATEGORY_E', 'CATEGORY_F', 'CATEGORY_G', 'CATEGORY_H', 'CATEGORY_I', 'CATEGORY_J'][1 + floor(random() * 10)::BIGINT] AS category_11,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D', 'CATEGORY_E', 'CATEGORY_F', 'CATEGORY_G'][1 + floor(random() * 7)::BIGINT] AS category_12,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D'][1 + floor(random() * 4)::BIGINT] AS category_13,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D', 'CATEGORY_E', 'CATEGORY_F', 'CATEGORY_G', 'CATEGORY_H', 'CATEGORY_I'][1 + floor(random() * 9)::BIGINT] AS category_14,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D', 'CATEGORY_E', 'CATEGORY_F'][1 + floor(random() * 6)::BIGINT] AS category_15,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C'][1 + floor(random() * 3)::BIGINT] AS category_16,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D', 'CATEGORY_E', 'CATEGORY_F', 'CATEGORY_G', 'CATEGORY_H'][1 + floor(random() * 8)::BIGINT] AS category_17,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D', 'CATEGORY_E'][1 + floor(random() * 5)::BIGINT] AS category_18,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D', 'CATEGORY_E', 'CATEGORY_F', 'CATEGORY_G', 'CATEGORY_H', 'CATEGORY_I', 'CATEGORY_J'][1 + floor(random() * 10)::BIGINT] AS category_19,
  ['CATEGORY_A', 'CATEGORY_B', 'CATEGORY_C', 'CATEGORY_D', 'CATEGORY_E', 'CATEGORY_F', 'CATEGORY_G'][1 + floor(random() * 7)::BIGINT] AS category_20,
  -- true/false
  random() < 0.11 AS is_flag_01,
  random() < 0.17 AS is_flag_02,
  random() < 0.23 AS is_flag_03,
  random() < 0.29 AS is_flag_04,
  random() < 0.35 AS is_flag_05,
  random() < 0.41 AS is_flag_06,
  random() < 0.47 AS is_flag_07,
  random() < 0.53 AS is_flag_08,
  random() < 0.59 AS is_flag_09,
  random() < 0.65 AS is_flag_10,
  random() < 0.71 AS is_flag_11,
  random() < 0.77 AS is_flag_12,
  random() < 0.83 AS is_flag_13,
  random() < 0.89 AS is_flag_14,
  random() < 0.95 AS is_flag_15,
  -- numbers
  round(random() * 1000, 2) AS amount_01,
  round(random() * 1000, 2) AS amount_02,
  round(random() * 1000, 2) AS amount_03,
  round(random() * 1000, 2) AS amount_04,
  round(random() * 1000, 2) AS amount_05,
  round(random() * 1000, 2) AS amount_06,
  round(random() * 1000, 2) AS amount_07,
  round(random() * 1000, 2) AS amount_08,
  round(random() * 1000, 2) AS amount_09,
  round(random() * 1000, 2) AS amount_10,
  floor(random() * 100)::BIGINT AS amount_11,
  floor(random() * 100)::BIGINT AS amount_12,
  floor(random() * 100)::BIGINT AS amount_13,
  floor(random() * 100)::BIGINT AS amount_14,
  floor(random() * 100)::BIGINT AS amount_15,
  -- reference codes
  'REF-' || lpad(floor(random() * 100000000)::BIGINT::VARCHAR, 8, '0') || '-' || ['A', 'B', 'C', 'D'][1 + floor(random() * 4)::BIGINT] || floor(random() * 1000)::BIGINT AS text_ref_01,
  'REF-' || lpad(floor(random() * 100000000)::BIGINT::VARCHAR, 8, '0') || '-' || ['A', 'B', 'C', 'D'][1 + floor(random() * 4)::BIGINT] || floor(random() * 1000)::BIGINT AS text_ref_02,
  'REF-' || lpad(floor(random() * 100000000)::BIGINT::VARCHAR, 8, '0') || '-' || ['A', 'B', 'C', 'D'][1 + floor(random() * 4)::BIGINT] || floor(random() * 1000)::BIGINT AS text_ref_03,
  'REF-' || lpad(floor(random() * 100000000)::BIGINT::VARCHAR, 8, '0') || '-' || ['A', 'B', 'C', 'D'][1 + floor(random() * 4)::BIGINT] || floor(random() * 1000)::BIGINT AS text_ref_04,
  'REF-' || lpad(floor(random() * 100000000)::BIGINT::VARCHAR, 8, '0') || '-' || ['A', 'B', 'C', 'D'][1 + floor(random() * 4)::BIGINT] || floor(random() * 1000)::BIGINT AS text_ref_05,
  'REF-' || lpad(floor(random() * 100000000)::BIGINT::VARCHAR, 8, '0') || '-' || ['A', 'B', 'C', 'D'][1 + floor(random() * 4)::BIGINT] || floor(random() * 1000)::BIGINT AS text_ref_06,
  'REF-' || lpad(floor(random() * 100000000)::BIGINT::VARCHAR, 8, '0') || '-' || ['A', 'B', 'C', 'D'][1 + floor(random() * 4)::BIGINT] || floor(random() * 1000)::BIGINT AS text_ref_07,
  'REF-' || lpad(floor(random() * 100000000)::BIGINT::VARCHAR, 8, '0') || '-' || ['A', 'B', 'C', 'D'][1 + floor(random() * 4)::BIGINT] || floor(random() * 1000)::BIGINT AS text_ref_08,
  'REF-' || lpad(floor(random() * 100000000)::BIGINT::VARCHAR, 8, '0') || '-' || ['A', 'B', 'C', 'D'][1 + floor(random() * 4)::BIGINT] || floor(random() * 1000)::BIGINT AS text_ref_09,
  'REF-' || lpad(floor(random() * 100000000)::BIGINT::VARCHAR, 8, '0') || '-' || ['A', 'B', 'C', 'D'][1 + floor(random() * 4)::BIGINT] || floor(random() * 1000)::BIGINT AS text_ref_10,
  -- mostly empty (95% null)
  CASE WHEN random() < 0.05 THEN 'NOTE-' || floor(random() * 10000)::BIGINT END AS optional_01,
  CASE WHEN random() < 0.05 THEN 'CODE_' || chr(65 + floor(random() * 26)::INTEGER) END AS optional_02,
  CASE WHEN random() < 0.05 THEN round(random() * 1000, 2)::VARCHAR END AS optional_03,
  CASE WHEN random() < 0.05 THEN 'NOTE-' || floor(random() * 10000)::BIGINT END AS optional_04,
  CASE WHEN random() < 0.05 THEN 'CODE_' || chr(65 + floor(random() * 26)::INTEGER) END AS optional_05,
  CASE WHEN random() < 0.05 THEN round(random() * 1000, 2)::VARCHAR END AS optional_06,
  CASE WHEN random() < 0.05 THEN 'NOTE-' || floor(random() * 10000)::BIGINT END AS optional_07,
  CASE WHEN random() < 0.05 THEN 'CODE_' || chr(65 + floor(random() * 26)::INTEGER) END AS optional_08,
  CASE WHEN random() < 0.05 THEN round(random() * 1000, 2)::VARCHAR END AS optional_09,
  CASE WHEN random() < 0.05 THEN 'NOTE-' || floor(random() * 10000)::BIGINT END AS optional_10,
  CASE WHEN random() < 0.05 THEN 'CODE_' || chr(65 + floor(random() * 26)::INTEGER) END AS optional_11,
  CASE WHEN random() < 0.05 THEN round(random() * 1000, 2)::VARCHAR END AS optional_12,
  CASE WHEN random() < 0.05 THEN 'NOTE-' || floor(random() * 10000)::BIGINT END AS optional_13,
  CASE WHEN random() < 0.05 THEN 'CODE_' || chr(65 + floor(random() * 26)::INTEGER) END AS optional_14,
  CASE WHEN random() < 0.05 THEN round(random() * 1000, 2)::VARCHAR END AS optional_15,
  CASE WHEN random() < 0.05 THEN 'NOTE-' || floor(random() * 10000)::BIGINT END AS optional_16,
  CASE WHEN random() < 0.05 THEN 'CODE_' || chr(65 + floor(random() * 26)::INTEGER) END AS optional_17,
  CASE WHEN random() < 0.05 THEN round(random() * 1000, 2)::VARCHAR END AS optional_18,
  CASE WHEN random() < 0.05 THEN 'NOTE-' || floor(random() * 10000)::BIGINT END AS optional_19,
  CASE WHEN random() < 0.05 THEN 'CODE_' || chr(65 + floor(random() * 26)::INTEGER) END AS optional_20,
  CASE WHEN random() < 0.05 THEN round(random() * 1000, 2)::VARCHAR END AS optional_21,
  CASE WHEN random() < 0.05 THEN 'NOTE-' || floor(random() * 10000)::BIGINT END AS optional_22,
  CASE WHEN random() < 0.05 THEN 'CODE_' || chr(65 + floor(random() * 26)::INTEGER) END AS optional_23,
  CASE WHEN random() < 0.05 THEN round(random() * 1000, 2)::VARCHAR END AS optional_24,
  CASE WHEN random() < 0.05 THEN 'NOTE-' || floor(random() * 10000)::BIGINT END AS optional_25,
  CASE WHEN random() < 0.05 THEN 'CODE_' || chr(65 + floor(random() * 26)::INTEGER) END AS optional_26,
  CASE WHEN random() < 0.05 THEN round(random() * 1000, 2)::VARCHAR END AS optional_27,
  CASE WHEN random() < 0.05 THEN 'NOTE-' || floor(random() * 10000)::BIGINT END AS optional_28
FROM range(1500000) t(i);

-- The export writes true/false as the strings "TRUE" and "FALSE".
CREATE VIEW as_exported AS
SELECT * REPLACE (
  CASE WHEN is_flag_01 THEN 'TRUE' ELSE 'FALSE' END AS is_flag_01,
  CASE WHEN is_flag_02 THEN 'TRUE' ELSE 'FALSE' END AS is_flag_02,
  CASE WHEN is_flag_03 THEN 'TRUE' ELSE 'FALSE' END AS is_flag_03,
  CASE WHEN is_flag_04 THEN 'TRUE' ELSE 'FALSE' END AS is_flag_04,
  CASE WHEN is_flag_05 THEN 'TRUE' ELSE 'FALSE' END AS is_flag_05,
  CASE WHEN is_flag_06 THEN 'TRUE' ELSE 'FALSE' END AS is_flag_06,
  CASE WHEN is_flag_07 THEN 'TRUE' ELSE 'FALSE' END AS is_flag_07,
  CASE WHEN is_flag_08 THEN 'TRUE' ELSE 'FALSE' END AS is_flag_08,
  CASE WHEN is_flag_09 THEN 'TRUE' ELSE 'FALSE' END AS is_flag_09,
  CASE WHEN is_flag_10 THEN 'TRUE' ELSE 'FALSE' END AS is_flag_10,
  CASE WHEN is_flag_11 THEN 'TRUE' ELSE 'FALSE' END AS is_flag_11,
  CASE WHEN is_flag_12 THEN 'TRUE' ELSE 'FALSE' END AS is_flag_12,
  CASE WHEN is_flag_13 THEN 'TRUE' ELSE 'FALSE' END AS is_flag_13,
  CASE WHEN is_flag_14 THEN 'TRUE' ELSE 'FALSE' END AS is_flag_14,
  CASE WHEN is_flag_15 THEN 'TRUE' ELSE 'FALSE' END AS is_flag_15
) FROM export ORDER BY id;

COPY as_exported TO 'export.jsonl' (FORMAT json);
COPY as_exported TO 'export.jsonl.zst' (FORMAT json, COMPRESSION zstd);
COPY (FROM export ORDER BY id) TO 'export-plain.parquet' (FORMAT parquet, COMPRESSION uncompressed);
COPY (FROM export ORDER BY id) TO 'export.parquet' (FORMAT parquet, COMPRESSION zstd);
-- The first 100 lines, small enough to keep in the repo.
COPY (FROM as_exported LIMIT 100) TO 'sample.jsonl' (FORMAT json);
