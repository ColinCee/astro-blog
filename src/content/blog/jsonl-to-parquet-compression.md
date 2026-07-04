---
title: "From 4.5GB to 221MB: A Story about Parquet"
description: "A 4.5GB JSONL export became a 221MB Parquet file. Same data, 95% smaller. Here is why."
pubDate: "Sep 03 2025"
---

I pull daily data-lake exports from S3 to debug production. Each JSONL file is 4.5GB, around 1.5 million records, and takes 10+ minutes to download.

I converted one to Parquet:

```text
data_export.jsonl    4.5 GB
data_export.parquet  221 MB   ·  95% smaller
```

Same records. The 10-minute download is now 30 seconds. Here is why JSONL is so wasteful.

**It repeats every field name on every row.** 106 fields, 1.5 million times. That is roughly 1.9GB of nothing but keys.

**It stores everything as text.** `"TRUE"` instead of one bit. A full ISO timestamp instead of 8 bytes. The word `"null"` spelled out millions of times.

Parquet flips the model. It stores columns instead of rows, so every value in a column sits together. That unlocks real compression:

- **Typed:** a boolean becomes a bit, a timestamp becomes 8 bytes.
- **Dictionary-encoded:** a `status` field with 6 values stores each once, then tiny references.
- **Zstandard** compression on top of all of it.

The punchline: the JSONL file was **66% overhead**. Only a third of it was real data. The rest was JSON syntax.

The catch: you cannot `grep` a Parquet file. But `duckdb -c "SELECT * FROM 'file.parquet'"` reads it instantly, so I do not miss the plain text.
