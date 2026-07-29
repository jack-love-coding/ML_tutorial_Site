# UCI SMS sparse matrix, CSR, and matvec

This silent 75-second animation uses the complete 5,574-row local snapshot of the UCI SMS Spam Collection. A fixed token and TF–IDF contract produces a `5574 × 1881` matrix with 69,798 nonzero entries, a density of 0.66571%.

The lesson follows one displayed message row into the three CSR arrays. For one-based row 17, adjacent row pointers are 283 and 299, so the row occupies the half-open slice `[283, 299)` and contains 16 stored values. A direct loop over `data[k] * w[indices[k]]` and the library CSR operation both produce `−0.497805956`; their difference is zero.

The final comparison reports 79.992 MiB for a dense float64 representation and 0.820 MiB for the actual CSR arrays, about 97.55 times smaller for this matrix. This is a storage comparison, not a runtime claim. The lesson trains no classifier and retains both original row order and 403 duplicate messages.
