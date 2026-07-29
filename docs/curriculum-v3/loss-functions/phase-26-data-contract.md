# Phase 26 Loss Functions Data Contract

**Contract version:** `loss-functions-phase-26-v1`

**Transformation version:** `phase-26-normalization-v1`

**Authorization decision:** `approve-lade`

**Decision date:** 2026-07-28

**Source retrieval date:** 2026-07-28

This contract is the fail-closed boundary for every real-data operation in Phase 26.
It authorizes two exact upstream sources for the loss-functions teaching corridor. It
does not publish either dataset; public publication is deferred to Plan 26-05 after
the complete candidate package has passed its atomic publication checks.

## Authorization preflight

The canonical authorization record is
`.planning/phases/26-loss-functions-rebuild/26-RESEARCH.md`, section
`Open Questions (RESOLVED)`. Work may proceed only when that record contains all of
the following exact facts:

- the product-owner response dated 2026-07-28 is `approve-lade`;
- the approved source is LaDe-D Jilin revision
  `be2cec02775cafc8d52230303f32134382bcc50b`;
- the approved source SHA-256 is
  `12e2cf4664dd5b4475d39dddee8872f5a03b3082f08f0eece7f103baee6c6e73`;
- the derivative carries complete attribution and license evidence; and
- the derivative removes `courier_id`, GPS coordinates, and precise stop fields.

If the decision is absent, changes from `approve-lade`, or differs on any source,
license, attribution, privacy, or use boundary, generation must stop. The approval
does not transfer to another LaDe revision, another LaDe field set, another delivery
dataset, synthetic delivery records, or another use.

## LaDe-D Jilin source identity

| Field | Required value |
| --- | --- |
| Dataset | LaDe-D Jilin delivery file |
| Publisher | Cainiao-AI |
| Repository | `Cainiao-AI/LaDe` |
| File | `delivery/delivery_jl.csv` |
| Revision | `be2cec02775cafc8d52230303f32134382bcc50b` |
| Official download URL | `https://huggingface.co/datasets/Cainiao-AI/LaDe/resolve/be2cec02775cafc8d52230303f32134382bcc50b/delivery/delivery_jl.csv` |
| Expected source bytes | `4,736,342` |
| SHA-256 | `12e2cf4664dd5b4475d39dddee8872f5a03b3082f08f0eece7f103baee6c6e73` |
| Expected rows | 31,415 data rows plus one header |
| License evidence | Apache-2.0 declaration on the official Cainiao-AI dataset card |
| Attribution evidence | Cainiao-AI LaDe dataset card and the LaDe paper, arXiv:2306.10675 |

The validated source header is exactly:

`order_id, region_id, city, courier_id, lng, lat, aoi_id, aoi_type, accept_time, accept_gps_time, accept_gps_lng, accept_gps_lat, delivery_time, delivery_gps_time, delivery_gps_lng, delivery_gps_lat, ds`.

Validation of all 31,415 rows observes finite delivery durations from 0 to 3,573
minutes, a median of 175 minutes, 50 zero-duration rows, and 8 rows above 24
hours. Month/day timestamp rollover is handled before duration calculation.

Required attribution links:

- Official dataset card: <https://huggingface.co/datasets/Cainiao-AI/LaDe>
- Original paper: <https://arxiv.org/abs/2306.10675>

The official card's Apache-2.0 declaration and its “research purposes” prose must
remain visible together in the audit trail. If a later policy review interprets the
prose as an additional restriction, the source is blocked pending written
clarification. Neither a new LaDe version nor a synthetic substitute may be used.

## LaDe-D privacy-minimized derivative

The normalized candidate may contain only these fields, in this order:

1. `course_row_id`
2. `source_row_number`
3. `city`
4. `aoi_type`
5. `accept_time`
6. `delivery_time`
7. `ds`
8. `delivery_duration_minutes`

`delivery_duration_minutes` is derived from the accept and delivery timestamps with
calendar rollover handling. It must be finite and non-negative. The candidate must
have one unique deterministic `course_row_id` per source row.

The publication denylist includes, at minimum:

- `order_id`, `region_id`, `courier_id`, and any other order, region, courier, or
  person identifier;
- `lng`, `lat`, `accept_gps_time`, `accept_gps_lng`, `accept_gps_lat`,
  `delivery_gps_time`, `delivery_gps_lng`, and `delivery_gps_lat`;
- `aoi_id` and other precise stop, address, route, trajectory, coordinate,
  geohash, or stop-identifier fields; and
- every source field not present in the eight-field allowlist above.

A candidate containing a denylisted or unexpected field is a publication error. A
future plan may narrow the field set further, but no plan may broaden it under this
authorization.

## UCI SECOM source identity

| Field | Required value |
| --- | --- |
| Dataset | SECOM |
| Publisher | UCI Machine Learning Repository |
| DOI | `10.24432/C54305` |
| Official archive URL | `https://archive.ics.uci.edu/static/public/179/secom.zip` |
| ZIP SHA-256 | `eea568baf3c2229096d7d294cf0b096b5502bd96d92c0b80a65b84714059be8e` |
| Required members | `secom.data`, `secom_labels.data`, `secom.names` |
| Expected rows | 1,567 |
| Expected labels | 1,463 pass (`-1`) and 104 fail (`1`) |
| Declared feature count | 591 |
| Observed raw feature values per row | 590 |
| License | CC BY 4.0 |

Validation observes exactly the three archive members `secom.data`,
`secom_labels.data`, and `secom.names`; 41,951 raw `NaN` measurement tokens are
preserved as missing values.

Required attribution link:

- Official dataset record: <https://archive.ics.uci.edu/dataset/179/secom>

The canonical normalized label mapping is `-1 -> 0` (pass) and `1 -> 1` (fail).
Raw missing measurement values must remain missing. The 591 declared versus 590
observed discrepancy is an upstream fact; padding, truncation, imputation, or an
invented 591st measurement is forbidden.

## Network, cache, and publication modes

- `--bootstrap-sources` is the only mode allowed to access the network. It may
  request only the two exact official download URLs recorded above.
- `--generate`, `--verify-source-cache`, and `--check` are offline and mutually
  exclusive with source bootstrap. They must fail
  when required local source bytes are unavailable or drift from the pinned hashes.
- `--check` is read-only and may not modify repository files or the source cache.
- Source-cache files live only under `.cache/loss-functions/phase-26-sources/` and
  are ignored by Git.
- Candidate output is staged in a temporary directory and is not public output.
  Plan 26-05 owns the only atomic publication into `public/`.

No mode may silently download a substitute, synthesize records, change the delivery
or manufacturing domain, or reuse the earlier `MSE=2.5` fixture.

## Strict output rules

Generated JSON must be standards-compliant. Non-finite teaching probes use an
explicit status with a JSON `null` value, for example
`{"status": "inf", "value": null}`. Bare `NaN`, `Infinity`, and `-Infinity` are
forbidden. Synthetic `-1000` and `1000` logit probes never carry a LaDe or SECOM row
ID.

Every generated manifest records the exact keys `contractVersion`, `license`, and
`removedFields`. Their required values come from this contract rather than from
downloaded metadata or caller input.

## Fail-closed validation matrix

Generation and cache verification must reject:

- a changed approval decision, revision, DOI, official URL, source byte length, or
  SHA-256;
- missing or changed license and attribution evidence;
- unexpected archive members, fields, rows, labels, or source schema;
- duplicate course IDs, invalid timestamps, or non-finite derived durations;
- a LaDe candidate containing `courier_id`, GPS, precise stop, or any field outside
  the publication allowlist;
- a SECOM row containing other than 590 raw measurement values, or a manifest that
  hides the declared 591/observed 590 discrepancy;
- SECOM label remapping, missing-value imputation, padding, or truncation; and
- any network attempt outside explicit source bootstrap or any public write before
  Plan 26-05.
