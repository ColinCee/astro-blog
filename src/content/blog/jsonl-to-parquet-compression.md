---
title: "From 4.5GB to 221MB: Why We Switched to Parquet"
description: "Downloaded a 4.5GB JSONL file from S3, converted it to Parquet, and it shrunk to 221MB. Here's what's actually happening under the hood."
pubDate: "Sep 03 2025"
---

Every so often I need to download our data lake export files from S3 for ad-hoc analysis or debugging production issues. Each daily JSONL file is around 4.5GB with about 1.5 million records.

Downloading takes forever – 10+ minutes on a good day, longer if you're on slow wifi. It got me thinking: what if we used a more efficient storage format?

So I tried converting one to Parquet. Same 1.5 million records, but now it's 221MB. That's a 95% reduction. Downloads that took 10 minutes would take 30 seconds.

### Why JSONL Files Are So Bloated

Here's what a typical record looks like (anonymized):

```json
{"customer_id": "C-12345678", "status": "ACTIVE", "contract_type": "STANDARD", "region": "NORTH", "is_premium": "TRUE", "last_updated": "2025-08-26", "balance": -569.04, ...}
```

Now multiply that structure by 1.5 million. The field names alone (`customer_id`, `status`, `contract_type`, etc.) are repeated for every single record. That's roughly 100 bytes of field names × 1.5M records = 150MB just for the keys.

But it gets worse. Take the `status` field – it only has 6 possible values, but "ACTIVE" appears in 99.8% of records. We're storing that 6-character string 1.5 million times. Same with `contract_type` which only has 3 values ("STANDARD", "PREMIUM", "BASIC") split fairly evenly. That's millions of bytes for data that could be represented with 2 bits.

### The Parquet Difference

I wrote a quick Python script using Polars. The key part is schema inference:

```python
# First 1000 rows to figure out the data types
schema_df = pl.read_ndjson(input_file, n_rows=1000)

# Now Polars knows: customer_id is string, balance is float, 
# is_premium is boolean (not the string "TRUE"!), etc.
```

This is huge. JSONL has no schema, so parsers treat everything as text until proven otherwise. Parquet knows upfront that `balance` is a float, `is_premium` is a boolean, and `region` is a string that probably repeats a lot.

### Where the Magic Happens

Instead of row-by-row storage like JSONL, Parquet groups all values of the same column together. Think of it like transposing a spreadsheet – all customer IDs in one place, all statuses in another. This enables some clever optimizations:

*Dictionary Encoding for Low-Cardinality Fields*  
Fields with few unique values compress incredibly well:

- `status` (6 unique values) → stores each value once + tiny indexes
- `contract_type` (3 values: STANDARD/PREMIUM/BASIC) → 2 bits per record
- `region` (maybe 10-20 values) → small dictionary + references

This is where we see massive wins. That `status` field that was taking ~9MB (6 bytes × 1.5M) now takes about 570KB.

*Boolean Fields Are Just Bits*  
We have about 20 boolean flags (`is_premium`, `has_discount`, `auto_renew`, etc.):

- JSONL: "TRUE"/"FALSE" = 4-5 bytes each
- Parquet: 1 bit each

20 boolean fields × 1.5M records × 4 byte savings = 120MB saved right there.

*Smart Null Handling*  
About 82% of our `termination_date` values are null (most customers are still active). In JSONL that's the string "null" repeated 1.2 million times. In Parquet it's a simple bitmap – one bit per row saying "has value" or "doesn't have value".

*Numeric Types Stay Numeric*  
Customer IDs like "C-12345678" take 10 bytes as text. Store just the numeric part as an integer: 4 bytes.

Timestamps stored as ISO strings ("2025-08-26T14:30:00Z") are 20+ bytes each. As proper timestamps: 8 bytes.

### The Actual Numbers

```
Original:  data_export_20250826.jsonl - 4.5GB
Converted: data_export_20250826.parquet - 221MB
Reduction: 95.1%
```

Where did 4.28GB of savings come from? Here's what I calculated:

- **Field names stored once**: 106 columns × 1.7KB of names per row × 1.5M rows = **2.5GB saved**
- **Boolean compression**: 32 boolean fields from "TRUE"/"FALSE" strings to bits = **325MB saved**
- **Null optimization**: 21% of values are null, eliminating "null" strings = **194MB saved**
- **Everything else**: Dictionary encoding on fields, Zstandard compression = **~1.2GB saved**

The field name deduplication alone accounts for 58% of the savings. We're literally spending more bytes on metadata than data!

### Trade-offs

You lose some things:

- Can't just `tail -f` or `grep` the file
- Need proper tools (though `duckdb -c "SELECT * FROM 'file.parquet'"` works great)
- Schema evolution requires more thought
