-- The numbers in "JSONL is a waste of space", from the files make-data.sql wrote.
--
--   duckdb fake.duckdb -c ".read measure.sql"

-- Where the JSONL's bytes go. Field names are every name in quotes on every
-- line; data is each value's text without quotes; everything else (braces,
-- colons, commas, quotes around strings, "null", newlines) is syntax. The
-- first query checks that the JSON tokens plus the syntax around them add up
-- to the file's size exactly.
CREATE TEMP TABLE per_field AS
UNPIVOT (
  SELECT
    sum(coalesce(length(to_json(COLUMNS(*))), 4)) AS "tok_\0",
    sum(length(COLUMNS(*)::VARCHAR)) AS "dat_\0"
  FROM as_exported
) ON COLUMNS(*) INTO NAME k VALUE bytes;

CREATE TEMP TABLE jsonl AS
SELECT
  (SELECT count(*) FROM export) AS rows,
  (SELECT count(*) FROM duckdb_columns() WHERE table_name = 'export') AS fields,
  (SELECT sum(length(column_name)) FROM duckdb_columns() WHERE table_name = 'export') AS name_chars,
  (SELECT sum(bytes) FROM per_field WHERE k LIKE 'tok_%') AS tokens,
  (SELECT sum(bytes) FROM per_field WHERE k LIKE 'dat_%') AS data,
  (SELECT size FROM read_blob('export.jsonl')) AS file;

SELECT
  file,
  rows * (3 + fields - 1) + rows * (name_chars + 3 * fields) + tokens AS rebuilt,
  rows * (name_chars + 2 * fields) AS field_names,
  data,
  file - rows * (name_chars + 2 * fields) - data AS other_syntax,
  rows * (3 + fields - 1) + rows * (name_chars + 3 * fields) + tokens = file AS adds_up
FROM jsonl;

-- The four files.
SELECT filename, size FROM read_blob('export*') ORDER BY size DESC;

-- One field: status as text, and as Parquet stores it before Zstandard.
SELECT
  (SELECT sum(length(status)) FROM export) AS status_text,
  (SELECT count(DISTINCT status) FROM export) AS status_values,
  (SELECT sum(total_compressed_size) FROM parquet_metadata('export-plain.parquet') WHERE path_in_schema = 'status') AS status_in_parquet;

-- How much Zstandard shrank each kind of field.
WITH plain AS (
  SELECT path_in_schema AS f, sum(total_compressed_size) AS b FROM parquet_metadata('export-plain.parquet') GROUP BY 1
), zstd AS (
  SELECT path_in_schema AS f, sum(total_compressed_size) AS b FROM parquet_metadata('export.parquet') GROUP BY 1
)
SELECT
  CASE
    WHEN f = 'id' THEN 'id, counts up'
    WHEN f = 'currency' THEN 'currency, nearly all GBP'
    ELSE regexp_replace(f, '_?\d+$', '')
  END AS kind,
  count(*) AS fields,
  sum(plain.b) AS plain,
  sum(zstd.b) AS zstd,
  round(sum(plain.b) / sum(zstd.b), 1) AS shrank
FROM plain JOIN zstd USING (f)
GROUP BY 1
ORDER BY shrank DESC;
