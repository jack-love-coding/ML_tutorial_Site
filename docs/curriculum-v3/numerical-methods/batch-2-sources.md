# Numerical Methods Batch 2 Sources

## UCI SMS Spam Collection

- Dataset page: <https://archive.ics.uci.edu/dataset/228/sms+spam+collection>
- DOI: <https://doi.org/10.24432/C5CC84>
- Creators: Tiago Almeida and José María Gómez Hidalgo
- License: CC BY 4.0
- Retrieved: 2026-07-20
- Reviewed archive SHA-256: `1587ea43e58e82b14ff1f5425c88e17f8496bfcdb67a583dbff9eefaf9963ce3`
- Reviewed source-text SHA-256: `7d039a24a6083ed9ef0f806ebad56bbb976e3aeb8de05669173bfdc4996c239d`
- Published CSV SHA-256: `d43a9b9fe1530f4cc58a1e01ad23ee466283c9abce4a83be17b199899bd584f8`

The local CSV adds a stable one-based row id and converts the leading tab-separated label/text pair to UTF-8 CSV. It does not rewrite messages, remove duplicates, sample rows, or normalize text. Labels describe corpus composition only; this lesson does not train a classifier.

## Ames Housing

- Reuses the reviewed Batch 1 snapshot and provenance in `sources.md`.
- Published CSV SHA-256: `763867f46c9a8616d7e7ea7599f4ab1cf408609c8aea06e496e65f9330df20fc`
- PCA uses eight numeric features plus one derived `house_age_at_sale` column; sale price is excluded from the direction calculation.

## Numerical implementation

- NumPy SVD and array operations follow the versions pinned in `public/notebooks/numerical-methods/requirements.txt`.
- SciPy CSR storage includes `data`, `indices`, and `indptr` byte counts.
- All web-runtime values are copied from committed Notebook output JSON, not recomputed independently in Vue.
