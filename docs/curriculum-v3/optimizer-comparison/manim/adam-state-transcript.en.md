# Adam state animation: English transcript

The video is language-neutral. This timed text, markers, and poster are the complete fallback.

## 0:00–0:09

The diamond is the current parameter position. Adam maintains a first moment `m_t`, a second moment `v_t`, and time step `t`.

## 0:09–0:18

Bias correction yields `\hat m_t` and `\hat v_t`, then `\theta_{t+1}=\theta_t-\eta\hat m_t/(\sqrt{\hat v_t}+\epsilon)` updates parameters. The card comes from the shared engine.

## 0:18–0:27

The diamond moves downhill. The time step corrects early moment estimates. This animation explains optimizer state only; it does not conflate Adam, L2, and AdamW.

## 0:27–0:36

The star marks lower loss. State changes the next step; any stronger claim needs stated data, budget, and comparison settings.
