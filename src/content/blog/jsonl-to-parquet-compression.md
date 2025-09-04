---
title: "From 4.5GB to 221MB: A Story about Parquet"
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

Now multiply that structure by 1.5 million. The field names alone (`customer_id`, `status`, `contract_type`, etc.) are repeated for every single record. With 106 fields taking up 1.3KB per record, that's 1.3KB × 1.5M records = 1.9GB just for the keys!

But it gets worse. Take the `status` field – it only has 6 possible values, but "ACTIVE" appears in 99.8% of records. We're storing that 6-character string 1.5 million times. Or `contract_type` with just 3 values (split ~37%/33%/28%) – that could be represented with 2 bits instead of string literals.

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
We have 32 boolean flags (`is_premium`, `has_discount`, `auto_renew`, etc.):

- JSONL: "TRUE"/"FALSE" = 4-5 bytes each
- Parquet: 1 bit each

32 boolean fields × 1.5M records × ~5 byte savings = 230MB saved right there.

*Smart Null Handling*  
About 21% of all field values are null. In JSONL that's the string "null" repeated millions of times. In Parquet it's a simple bitmap – one bit per row saying "has value" or "doesn't have value".

*Numeric Types Stay Numeric*  
Customer IDs like "C-12345678" take 10 bytes as text. Store just the numeric part as an integer: 4 bytes.

Timestamps stored as ISO strings ("2025-08-26T14:30:00Z") are 20+ bytes each. As proper timestamps: 8 bytes.

### The Actual Numbers

```
Original:  data_export_20250826.jsonl - 4.5GB
Converted: data_export_20250826.parquet - 221MB
Reduction: 95.1%
```

Where did 4.28GB of savings come from? I dug deeper and found something surprising - the JSONL file is 66% overhead! Only 33% is actual data values, the rest is JSON structure.

- **Field names stored once**: 106 columns, 1.3KB of names per row × 1.5M rows = **1.9GB saved**
- **Dictionary encoding**: 20+ categorical fields (status, payment_type, meter locations, etc.) = **~800MB saved**
- **Zstandard compression**: Final compression on the columnar data = **~340MB saved**
- **Boolean compression**: 32 boolean fields from "TRUE"/"FALSE" strings to bits = **230MB saved**
- **Null optimization**: 21% of values are null, eliminating "null" strings = **130MB saved**
- **Other optimizations**: Numeric type efficiency, run-length encoding, etc. = **~880MB saved**

The shocking realization: In JSONL, we're literally spending twice as much space on JSON syntax as on actual data!

### Trade-offs

You lose some things:

- Can't just `tail -f` or `grep` the file
- Need proper tools (though `duckdb -c "SELECT * FROM 'file.parquet'"` works great)
- Schema evolution requires more thought
