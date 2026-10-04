---
title: "From 4.5GB to 221MB: A Story about Parquet"
shortTitle: "From 4.5GB to 221MB: a Parquet story"
description: "I converted a 4.5GB JSONL export to Parquet and it came out at 221MB. Same data. This is where the other 95% went."
stat: "221MB"
pubDate: "Sep 03 2025"
---
At work I pull data-lake exports down from S3 most days to debug production issues. Each one is a JSONL file of about 4.5GB, around 1.5 million records, and it takes over ten minutes to download.

I tried converting one to Parquet:

<figure class="fig">
<div class="cmp"><span>data_export.jsonl</span><i style="--w:1"></i><b>4.5 GB</b></div>
<div class="cmp cmp--after"><span>data_export.parquet</span><i style="--w:0.049"></i><b>221 MB</b></div>
<figcaption>Same 1.5 million records, drawn to scale. 95% smaller.</figcaption>
</figure>

It's the same records, and the download went from ten minutes to about 30 seconds. So I had a look at why the difference is so big.

It turns out JSONL wastes space in two ways.

The first is that it writes out every field name on every single row. We have 106 fields, so that's 106 keys repeated 1.5 million times, which comes to roughly 1.9GB of nothing but keys.

The second is that everything is stored as text. A boolean is the string `"TRUE"` when it could be one bit. A timestamp is a full ISO string when it could be 8 bytes. And `"null"` gets spelled out millions of times.

Parquet does it the other way round. It stores data by column instead of by row, so all the values for one field sit next to each other.

<figure class="fig">
<div class="split">
<div><p class="fig__k">JSONL: one row at a time</p><div class="rows"><span>{<u>"id"</u>: 1, <u>"status"</u>: "OPEN", <u>"active"</u>: "TRUE"}</span><span>{<u>"id"</u>: 2, <u>"status"</u>: "OPEN", <u>"active"</u>: "TRUE"}</span><span>{<u>"id"</u>: 3, <u>"status"</u>: "DONE", <u>"active"</u>: "FALSE"}</span></div></div>
<div><p class="fig__k">Parquet: one column at a time</p><div class="cols"><div><b>id</b><span>1</span><span>2</span><span>3</span></div><div><b>status</b><span>OPEN</span><span>OPEN</span><span>DONE</span></div><div><b>active</b><span>1</span><span>1</span><span>0</span></div></div></div>
</div>
<figcaption>A made-up three-row example. In JSONL the field names (highlighted) repeat on every row; in Parquet each appears once.</figcaption>
</figure>

That lets it do a few things:

- It knows the types, so a boolean really is a bit and a timestamp really is 8 bytes.
- It dictionary-encodes repeated values. Our `status` field only has 6 possible values, so it stores each one once and then points at them.
- It runs Zstandard compression over the whole lot.

Put together, about **66% of the JSONL file was overhead**. Only a third of it was actual data and the rest was JSON syntax.

<figure class="fig">
<div class="stack"><span style="--w:42"></span><span style="--w:24"></span><span class="is-data" style="--w:34"></span></div>
<ul class="legend"><li><b>~1.9 GB</b> field names</li><li><b>~1.1 GB</b> other JSON overhead</li><li class="is-data"><b>~1.5 GB</b> actual data</li></ul>
<figcaption>Where the 4.5 GB went. The overhead split is approximate: 66% of the file, less the 1.9 GB of keys.</figcaption>
</figure>

The one downside is that you can't `grep` a Parquet file. But `duckdb -c "SELECT * FROM 'file.parquet'"` opens it instantly, so I haven't really missed that.
