from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCENE_FILE = ROOT / "scripts" / "manim" / "scenes" / "math_lab_basics.py"
PUBLIC_DIR = ROOT / "public" / "manim" / "math-lab"

SCENES = {
    "VectorDotProductScene": "vector-dot-product.mp4",
    "MatrixTransformScene": "matrix-transform.mp4",
    "VectorDistanceNormScene": "vector-distance-norm.mp4",
    "CosineSimilarityAngleScene": "cosine-similarity-angle.mp4",
    "MatrixColumnCombinationScene": "matrix-column-combination.mp4",
    "RankFlatteningScene": "rank-flattening.mp4",
    "NullSpaceCollapseScene": "null-space-collapse.mp4",
    "SvdLowRankReconstructionScene": "svd-low-rank-reconstruction.mp4",
    "PcaCenteringProjectionScene": "pca-centering-projection.mp4",
    "VectorSpanNormScene": "vector-span-norm.mp4",
    "GradientDescentScene": "gradient-descent.mp4",
    "BeginnerDerivativeWindowScene": "beginner-derivative-window.mp4",
    "BeginnerChainRuleBackpropScene": "beginner-chain-rule-backprop.mp4",
    "BeginnerLearningRateBehaviorScene": "beginner-learning-rate-behavior.mp4",
    "BeginnerProbabilityFrequencyScene": "beginner-probability-frequency.mp4",
    "BeginnerConditionalBayesScene": "beginner-conditional-bayes.mp4",
    "BeginnerCalibrationCrossEntropyScene": "beginner-calibration-cross-entropy.mp4",
    "TaylorPolynomialScene": "taylor-polynomial.mp4",
    "MonteCarloSamplingScene": "monte-carlo-sampling.mp4",
}


def linear_algebra_poster(title: str, caption: str, mode: str) -> str:
    drawings = {
        "distance": """
  <path d="M100 410H860M160 92V440" stroke="#7b8497" stroke-width="3"/>
  <path d="M160 410L520 150" stroke="#3868ff" stroke-width="10" stroke-linecap="round"/>
  <path d="M500 146L552 127L526 177Z" fill="#3868ff"/>
  <circle cx="520" cy="150" r="14" fill="#ffd84d" stroke="#10162f" stroke-width="4"/>
  <circle cx="700" cy="230" r="14" fill="#ef6f6c" stroke="#10162f" stroke-width="4"/>
  <path d="M520 150L700 230" stroke="#d9463f" stroke-width="8" stroke-linecap="round" stroke-dasharray="14 12"/>
  <text x="300" y="238" fill="#3868ff" font-family="Arial, sans-serif" font-size="27" font-weight="700">||x||</text>
  <text x="594" y="184" fill="#d9463f" font-family="Arial, sans-serif" font-size="27" font-weight="700">||y - x||</text>
""",
        "cosine": """
  <path d="M480 282L700 184" stroke="#3868ff" stroke-width="10" stroke-linecap="round"/>
  <path d="M480 282L795 140" stroke="#0f9f7a" stroke-width="10" stroke-linecap="round"/>
  <path d="M480 282L430 108" stroke="#d9463f" stroke-width="10" stroke-linecap="round"/>
  <path d="M685 165L730 170L700 202Z" fill="#3868ff"/>
  <path d="M780 120L826 124L796 158Z" fill="#0f9f7a"/>
  <path d="M410 116L419 70L449 108Z" fill="#d9463f"/>
  <path d="M558 247C594 234 622 218 648 196" fill="none" stroke="#f2b84b" stroke-width="8" stroke-linecap="round"/>
  <path d="M438 225C455 178 455 146 437 109" fill="none" stroke="#ef6f6c" stroke-width="8" stroke-linecap="round"/>
  <text x="590" y="330" fill="#475467" font-family="Arial, sans-serif" font-size="25">length changes, direction can stay similar</text>
""",
        "combination": """
  <path d="M160 410L400 290" stroke="#3868ff" stroke-width="10" stroke-linecap="round"/>
  <path d="M400 290L520 122" stroke="#0f9f7a" stroke-width="10" stroke-linecap="round"/>
  <path d="M160 410L520 122" stroke="#e26d3d" stroke-width="10" stroke-linecap="round"/>
  <path d="M384 270L432 274L400 309Z" fill="#3868ff"/>
  <path d="M499 112L544 88L523 139Z" fill="#0f9f7a"/>
  <path d="M500 106L548 84L524 134Z" fill="#e26d3d"/>
  <text x="210" y="290" fill="#3868ff" font-family="Arial, sans-serif" font-size="27" font-weight="700">x1 a1</text>
  <text x="430" y="214" fill="#0f9f7a" font-family="Arial, sans-serif" font-size="27" font-weight="700">x2 a2</text>
  <text x="570" y="158" fill="#e26d3d" font-family="Arial, sans-serif" font-size="29" font-weight="700">Ax</text>
  <text x="570" y="222" fill="#10162f" font-family="Arial, sans-serif" font-size="27">Ax = x1 a1 + x2 a2</text>
""",
        "rank": """
  <path d="M170 370L360 302" stroke="#3868ff" stroke-width="10" stroke-linecap="round"/>
  <path d="M170 370L92 182" stroke="#0f9f7a" stroke-width="10" stroke-linecap="round"/>
  <path d="M360 302L282 114M92 182L282 114" stroke="#8a96a8" stroke-width="5" stroke-dasharray="12 12"/>
  <text x="116" y="96" fill="#10162f" font-family="Arial, sans-serif" font-size="27" font-weight="700">rank 2: plane</text>
  <path d="M530 338L848 222" stroke="#f2b84b" stroke-width="11" stroke-linecap="round"/>
  <path d="M604 310L742 260" stroke="#3868ff" stroke-width="10" stroke-linecap="round"/>
  <path d="M604 310L715 270" stroke="#0f9f7a" stroke-width="10" stroke-linecap="round"/>
  <text x="585" y="178" fill="#10162f" font-family="Arial, sans-serif" font-size="27" font-weight="700">rank 1: line</text>
""",
        "null": """
  <path d="M178 386L380 278" stroke="#3868ff" stroke-width="10" stroke-linecap="round"/>
  <path d="M178 386L74 208" stroke="#d9463f" stroke-width="10" stroke-linecap="round"/>
  <rect x="430" y="230" width="116" height="96" rx="18" fill="#ffffff" stroke="#10162f" stroke-width="4"/>
  <text x="488" y="288" fill="#10162f" font-family="Arial, sans-serif" font-size="36" font-weight="700" text-anchor="middle">A</text>
  <path d="M565 278L760 218" stroke="#3868ff" stroke-width="10" stroke-linecap="round"/>
  <circle cx="650" cy="354" r="18" fill="#d9463f" stroke="#10162f" stroke-width="4"/>
  <text x="680" y="362" fill="#d9463f" font-family="Arial, sans-serif" font-size="28" font-weight="700">A v = 0</text>
  <text x="246" y="206" fill="#d9463f" font-family="Arial, sans-serif" font-size="27" font-weight="700">erased direction</text>
""",
        "svd": """
  <g transform="translate(120 126)">
    <rect x="0" y="136" width="48" height="190" rx="8" fill="#3868ff" stroke="#10162f" stroke-width="3"/>
    <rect x="70" y="194" width="48" height="132" rx="8" fill="#3868ff" stroke="#10162f" stroke-width="3"/>
    <rect x="140" y="238" width="48" height="88" rx="8" fill="#3868ff" stroke="#10162f" stroke-width="3"/>
    <rect x="210" y="282" width="48" height="44" rx="8" fill="#6f42c1" opacity="0.38" stroke="#10162f" stroke-width="3"/>
    <rect x="280" y="302" width="48" height="24" rx="8" fill="#6f42c1" opacity="0.26" stroke="#10162f" stroke-width="3"/>
    <text x="0" y="360" fill="#475467" font-family="Arial, sans-serif" font-size="24">keep large singular values</text>
  </g>
  <g transform="translate(562 146)">
    <rect x="0" y="0" width="42" height="42" rx="6" fill="#0f9f7a" stroke="#10162f" stroke-width="3"/>
    <rect x="52" y="0" width="42" height="42" rx="6" fill="#3868ff" opacity="0.26" stroke="#10162f" stroke-width="3"/>
    <rect x="104" y="0" width="42" height="42" rx="6" fill="#0f9f7a" stroke="#10162f" stroke-width="3"/>
    <rect x="0" y="52" width="42" height="42" rx="6" fill="#3868ff" opacity="0.24" stroke="#10162f" stroke-width="3"/>
    <rect x="52" y="52" width="42" height="42" rx="6" fill="#0f9f7a" stroke="#10162f" stroke-width="3"/>
    <rect x="104" y="52" width="42" height="42" rx="6" fill="#3868ff" opacity="0.18" stroke="#10162f" stroke-width="3"/>
    <rect x="0" y="104" width="42" height="42" rx="6" fill="#0f9f7a" stroke="#10162f" stroke-width="3"/>
    <rect x="52" y="104" width="42" height="42" rx="6" fill="#3868ff" opacity="0.2" stroke="#10162f" stroke-width="3"/>
    <rect x="104" y="104" width="42" height="42" rx="6" fill="#0f9f7a" stroke="#10162f" stroke-width="3"/>
    <path d="M188 74H274" stroke="#d65a31" stroke-width="9" stroke-linecap="round"/>
    <path d="M258 54L298 74L258 94Z" fill="#d65a31"/>
    <rect x="328" y="26" width="42" height="42" rx="6" fill="#0f9f7a" stroke="#10162f" stroke-width="3"/>
    <rect x="380" y="26" width="42" height="42" rx="6" fill="#3868ff" opacity="0.12" stroke="#10162f" stroke-width="3"/>
    <rect x="328" y="78" width="42" height="42" rx="6" fill="#3868ff" opacity="0.12" stroke="#10162f" stroke-width="3"/>
    <rect x="380" y="78" width="42" height="42" rx="6" fill="#0f9f7a" stroke="#10162f" stroke-width="3"/>
    <text x="-8" y="198" fill="#475467" font-family="Arial, sans-serif" font-size="24">structure first, detail later</text>
  </g>
  <text x="116" y="110" fill="#10162f" font-family="Arial, sans-serif" font-size="28" font-weight="700">A_k = first k singular layers</text>
""",
        "pca": """
  <path d="M118 392H548M170 120V426" stroke="#7b8497" stroke-width="3"/>
  <g fill="#3868ff" stroke="#10162f" stroke-width="3">
    <circle cx="216" cy="312" r="12"/><circle cx="258" cy="282" r="12"/><circle cx="306" cy="260" r="12"/>
    <circle cx="348" cy="236" r="12"/><circle cx="400" cy="214" r="12"/><circle cx="452" cy="186" r="12"/>
  </g>
  <circle cx="330" cy="248" r="15" fill="#ffd84d" stroke="#10162f" stroke-width="4"/>
  <path d="M330 248L220 328" stroke="#d65a31" stroke-width="7" stroke-linecap="round" stroke-dasharray="12 10"/>
  <path d="M220 328L500 170" stroke="#f2b84b" stroke-width="10" stroke-linecap="round"/>
  <g fill="#f2b84b" stroke="#10162f" stroke-width="3">
    <circle cx="252" cy="310" r="10"/><circle cx="296" cy="286" r="10"/><circle cx="336" cy="263" r="10"/>
    <circle cx="374" cy="242" r="10"/><circle cx="420" cy="216" r="10"/><circle cx="468" cy="190" r="10"/>
  </g>
  <text x="596" y="190" fill="#10162f" font-family="Arial, sans-serif" font-size="28" font-weight="700">1. subtract the mean</text>
  <text x="596" y="250" fill="#10162f" font-family="Arial, sans-serif" font-size="28" font-weight="700">2. find max variance</text>
  <text x="596" y="310" fill="#10162f" font-family="Arial, sans-serif" font-size="28" font-weight="700">3. project onto it</text>
""",
    }
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="{title}">
  <rect width="960" height="540" fill="#fffaf1"/>
  <g stroke="#dbe4f2" stroke-width="1">
    <path d="M90 120H870M90 190H870M90 260H870M90 330H870M90 400H870"/>
    <path d="M130 90V450M240 90V450M350 90V450M460 90V450M570 90V450M680 90V450M790 90V450"/>
  </g>
  <text x="82" y="70" fill="#10162f" font-family="Arial, sans-serif" font-size="34" font-weight="700">{title}</text>
{drawings[mode]}
  <text x="82" y="502" fill="#475467" font-family="Arial, sans-serif" font-size="24">{caption}</text>
</svg>
"""


POSTER_SVGS = {
    "VectorDistanceNormScene": linear_algebra_poster(
        "Norm and distance use the same ruler",
        "A norm measures one vector; distance measures the difference between two vectors.",
        "distance",
    ),
    "CosineSimilarityAngleScene": linear_algebra_poster(
        "Cosine similarity reads direction",
        "Euclidean distance can change when length changes; cosine follows the angle.",
        "cosine",
    ),
    "MatrixColumnCombinationScene": linear_algebra_poster(
        "Matrix-vector multiplication mixes columns",
        "The input coordinates choose how much of each matrix column to add.",
        "combination",
    ),
    "RankFlatteningScene": linear_algebra_poster(
        "Rank counts effective output directions",
        "Independent columns open a plane; dependent columns flatten outputs to a line.",
        "rank",
    ),
    "NullSpaceCollapseScene": linear_algebra_poster(
        "Null space is what the matrix erases",
        "A null-space direction is a real input change that becomes zero output.",
        "null",
    ),
    "SvdLowRankReconstructionScene": linear_algebra_poster(
        "SVD keeps the strongest matrix directions",
        "Low-rank reconstruction keeps the large singular layers before weaker details.",
        "svd",
    ),
    "PcaCenteringProjectionScene": linear_algebra_poster(
        "PCA centers before projecting variance",
        "Center the cloud, then keep the direction with the largest projection variance.",
        "pca",
    ),
    "BeginnerDerivativeWindowScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Derivative window shrinking to tangent slope">
  <rect width="960" height="540" fill="#fffaf1"/>
  <g stroke="#dbe4f2" stroke-width="1">
    <path d="M90 120H870M90 190H870M90 260H870M90 330H870M90 400H870"/>
    <path d="M130 90V450M240 90V450M350 90V450M460 90V450M570 90V450M680 90V450M790 90V450"/>
  </g>
  <path d="M110 418H840M160 90V440" stroke="#7b8497" stroke-width="3"/>
  <path d="M180 134 C305 384 492 486 768 182" fill="none" stroke="#3868ff" stroke-width="9" stroke-linecap="round"/>
  <path d="M500 360L725 235" stroke="#ef6f6c" stroke-width="7" stroke-linecap="round"/>
  <path d="M500 360L628 304" stroke="#d65a31" stroke-width="7" stroke-linecap="round"/>
  <path d="M500 360L580 332" stroke="#0f9f7a" stroke-width="7" stroke-linecap="round"/>
  <path d="M394 385L650 292" stroke="#0f9f7a" stroke-width="7" stroke-linecap="round"/>
  <circle cx="500" cy="360" r="15" fill="#ffd84d" stroke="#10162f" stroke-width="4"/>
  <text x="82" y="70" fill="#10162f" font-family="Arial, sans-serif" font-size="34" font-weight="700">Derivative window shrinks to the tangent</text>
  <text x="82" y="502" fill="#475467" font-family="Arial, sans-serif" font-size="24">Average change approaches local slope as h gets smaller.</text>
</svg>
""",
    "BeginnerChainRuleBackpropScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Chain rule backpropagation computation graph">
  <rect width="960" height="540" fill="#fffaf1"/>
  <text x="82" y="70" fill="#10162f" font-family="Arial, sans-serif" font-size="34" font-weight="700">Chain rule sends gradients backward</text>
  <g font-family="Arial, sans-serif" font-size="24" text-anchor="middle">
    <rect x="92" y="204" width="130" height="78" rx="14" fill="#ffffff" stroke="#10162f" stroke-width="3"/><text x="157" y="253" fill="#10162f">x</text>
    <rect x="292" y="204" width="150" height="78" rx="14" fill="#ffffff" stroke="#10162f" stroke-width="3"/><text x="367" y="253" fill="#10162f">z = w·x + b</text>
    <rect x="516" y="204" width="150" height="78" rx="14" fill="#ffffff" stroke="#10162f" stroke-width="3"/><text x="591" y="253" fill="#10162f">ŷ = σ(z)</text>
    <rect x="736" y="204" width="130" height="78" rx="14" fill="#ffffff" stroke="#10162f" stroke-width="3"/><text x="801" y="253" fill="#10162f">L</text>
  </g>
  <path d="M222 243H292M442 243H516M666 243H736" stroke="#3868ff" stroke-width="8"/>
  <path d="M736 342H666M516 342H442M292 342H222" stroke="#d65a31" stroke-width="8"/>
  <text x="482" y="174" fill="#3868ff" font-family="Arial, sans-serif" font-size="25">forward values</text>
  <text x="466" y="390" fill="#d65a31" font-family="Arial, sans-serif" font-size="25">upstream gradient × local derivative</text>
  <text x="82" y="502" fill="#475467" font-family="Arial, sans-serif" font-size="24">Backpropagation is chain rule bookkeeping on a graph.</text>
</svg>
""",
    "BeginnerLearningRateBehaviorScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Learning rate paths comparing small steady and too large steps">
  <rect width="960" height="540" fill="#fffaf1"/>
  <text x="82" y="70" fill="#10162f" font-family="Arial, sans-serif" font-size="34" font-weight="700">Same slope, different step size</text>
  <g fill="none" stroke="#3868ff" stroke-width="7" stroke-linecap="round">
    <path d="M92 380 C150 120 248 120 306 380"/>
    <path d="M378 380 C436 120 534 120 592 380"/>
    <path d="M664 380 C722 120 820 120 878 380"/>
  </g>
  <path d="M120 190L150 250L176 292L202 324L224 346" stroke="#f2b84b" stroke-width="7" fill="none"/>
  <path d="M404 190L470 318L486 352" stroke="#0f9f7a" stroke-width="7" fill="none"/>
  <path d="M692 190L850 250L704 302L826 326" stroke="#d9463f" stroke-width="7" fill="none"/>
  <g font-family="Arial, sans-serif" font-size="24" font-weight="700">
    <text x="108" y="148" fill="#f2b84b">small η</text>
    <text x="396" y="148" fill="#0f9f7a">steady η</text>
    <text x="684" y="148" fill="#d9463f">large η</text>
  </g>
  <text x="82" y="502" fill="#475467" font-family="Arial, sans-serif" font-size="24">A large step can reuse local slope information too far away.</text>
</svg>
""",
    "BeginnerProbabilityFrequencyScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Repeated trials form a probability distribution">
  <rect width="960" height="540" fill="#fffaf1"/>
  <text x="82" y="70" fill="#10162f" font-family="Arial, sans-serif" font-size="34" font-weight="700">Probability needs repeated trials</text>
  <g transform="translate(120 140)">
    <g fill="#d8f6ff" stroke="#10162f" stroke-width="3">
      <rect x="0" y="252" width="80" height="48" rx="10"/>
      <rect x="104" y="212" width="80" height="88" rx="10"/>
      <rect x="208" y="132" width="80" height="168" rx="10"/>
      <rect x="312" y="92" width="80" height="208" rx="10"/>
      <rect x="416" y="172" width="80" height="128" rx="10"/>
      <rect x="520" y="236" width="80" height="64" rx="10"/>
    </g>
    <path d="M40 238L144 200L248 122L352 82L456 162L560 228" fill="none" stroke="#0f9f7a" stroke-width="8" stroke-linecap="round"/>
    <g fill="#ffd84d" stroke="#10162f" stroke-width="3">
      <circle cx="42" cy="236" r="12"/><circle cx="146" cy="196" r="12"/><circle cx="250" cy="118" r="12"/>
      <circle cx="354" cy="78" r="12"/><circle cx="458" cy="158" r="12"/><circle cx="562" cy="224" r="12"/>
    </g>
  </g>
  <text x="82" y="502" fill="#475467" font-family="Arial, sans-serif" font-size="24">One result is noisy; many trials reveal the long-run shape.</text>
</svg>
""",
    "BeginnerConditionalBayesScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Conditional probability and Bayes update">
  <rect width="960" height="540" fill="#fffaf1"/>
  <text x="82" y="70" fill="#10162f" font-family="Arial, sans-serif" font-size="34" font-weight="700">Evidence filters the sample space</text>
  <rect x="112" y="170" width="90" height="62" rx="12" fill="#ef6f6c" stroke="#10162f" stroke-width="3"/>
  <rect x="202" y="170" width="610" height="62" rx="12" fill="#9ee6ff" stroke="#10162f" stroke-width="3"/>
  <text x="144" y="150" fill="#d9463f" font-family="Arial, sans-serif" font-size="24">prior spam</text>
  <text x="510" y="150" fill="#3868ff" font-family="Arial, sans-serif" font-size="24">normal mail</text>
  <path d="M480 256V326" stroke="#d65a31" stroke-width="8" stroke-linecap="round"/>
  <text x="480" y="304" fill="#d65a31" font-family="Arial, sans-serif" font-size="24" text-anchor="middle">signal</text>
  <rect x="250" y="360" width="190" height="62" rx="12" fill="#ef6f6c" stroke="#10162f" stroke-width="3"/>
  <rect x="440" y="360" width="270" height="62" rx="12" fill="#9ee6ff" stroke="#10162f" stroke-width="3"/>
  <text x="480" y="462" fill="#475467" font-family="Arial, sans-serif" font-size="24" text-anchor="middle">posterior counts true signal and false alarms</text>
  <text x="82" y="502" fill="#475467" font-family="Arial, sans-serif" font-size="24">Bayes update keeps the base rate in the calculation.</text>
</svg>
""",
    "BeginnerCalibrationCrossEntropyScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Calibration and cross entropy">
  <rect width="960" height="540" fill="#fffaf1"/>
  <text x="82" y="70" fill="#10162f" font-family="Arial, sans-serif" font-size="34" font-weight="700">Probability bars must be checked</text>
  <g font-family="Arial, sans-serif" font-size="24">
    <text x="90" y="166" fill="#10162f">cat</text><rect x="160" y="142" width="250" height="34" rx="8" fill="#0f9f7a" stroke="#10162f" stroke-width="3"/>
    <text x="90" y="226" fill="#10162f">dog</text><rect x="160" y="202" width="120" height="34" rx="8" fill="#3868ff" stroke="#10162f" stroke-width="3"/>
    <text x="90" y="286" fill="#10162f">bird</text><rect x="160" y="262" width="62" height="34" rx="8" fill="#f2b84b" stroke="#10162f" stroke-width="3"/>
  </g>
  <path d="M520 368 C570 178 650 138 810 126" fill="none" stroke="#6f42c1" stroke-width="8" stroke-linecap="round"/>
  <circle cx="650" cy="196" r="14" fill="#f2b84b" stroke="#10162f" stroke-width="4"/>
  <text x="642" y="92" fill="#6f42c1" font-family="Arial, sans-serif" font-size="25">loss = -log(p_true)</text>
  <g stroke-width="10">
    <path d="M530 438V386" stroke="#3868ff"/><path d="M552 438V392" stroke="#0f9f7a"/>
    <path d="M610 438V348" stroke="#3868ff"/><path d="M632 438V370" stroke="#0f9f7a"/>
    <path d="M690 438V304" stroke="#3868ff"/><path d="M712 438V340" stroke="#0f9f7a"/>
    <path d="M770 438V258" stroke="#3868ff"/><path d="M792 438V324" stroke="#0f9f7a"/>
  </g>
  <text x="82" y="502" fill="#475467" font-family="Arial, sans-serif" font-size="24">Useful probabilities are normalized, placed correctly, and calibrated.</text>
</svg>
""",
    "VectorSpanNormScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Vector span and norm poster">
  <rect width="960" height="540" fill="#f8fbff"/>
  <g stroke="#d7dee9" stroke-width="1">
    <path d="M120 90V450M220 90V450M320 90V450M420 90V450M520 90V450M620 90V450M720 90V450M820 90V450"/>
    <path d="M100 130H860M100 210H860M100 290H860M100 370H860M100 450H860"/>
  </g>
  <path d="M100 270H860" stroke="#667085" stroke-width="2"/>
  <path d="M480 90V450" stroke="#667085" stroke-width="2"/>
  <path d="M480 270L650 208" stroke="#3868ff" stroke-width="10" stroke-linecap="round"/>
  <path d="M642 193L690 194L657 229Z" fill="#3868ff"/>
  <path d="M480 270L425 125" stroke="#0f9f7a" stroke-width="10" stroke-linecap="round"/>
  <path d="M407 133L416 86L447 122Z" fill="#0f9f7a"/>
  <path d="M650 208L595 63M425 125L595 63" stroke="#8a96a8" stroke-width="5" stroke-dasharray="12 12"/>
  <path d="M480 270L595 63" stroke="#e26d3d" stroke-width="10" stroke-linecap="round"/>
  <path d="M576 62L618 22L612 79Z" fill="#e26d3d"/>
  <path d="M620 360L720 410" stroke="#d9463f" stroke-width="8" stroke-linecap="round"/>
  <path d="M707 392L748 424L696 426Z" fill="#d9463f"/>
  <text x="92" y="72" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Span, dependence, and norm</text>
  <text x="92" y="502" fill="#475467" font-family="Arial, sans-serif" font-size="24">Combine directions, then measure the remaining error vector.</text>
</svg>
""",
    "TaylorPolynomialScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Taylor polynomial curves approaching sine near the center">
  <rect width="960" height="540" fill="#f8fbff"/>
  <g stroke="#d7dee9" stroke-width="1">
    <path d="M120 90V450M220 90V450M320 90V450M420 90V450M520 90V450M620 90V450M720 90V450M820 90V450"/>
    <path d="M100 130H860M100 210H860M100 290H860M100 370H860M100 450H860"/>
  </g>
  <path d="M100 270H860" stroke="#667085" stroke-width="2"/>
  <path d="M480 90V450" stroke="#667085" stroke-width="2"/>
  <path d="M110 278 C190 352 270 382 350 333 C430 284 510 178 590 207 C670 236 750 349 850 264" fill="none" stroke="#3868ff" stroke-width="9" stroke-linecap="round"/>
  <path d="M110 452 C230 367 330 304 430 279 C530 254 640 262 850 96" fill="none" stroke="#e26d3d" stroke-width="8" stroke-linecap="round" stroke-dasharray="20 16"/>
  <circle cx="480" cy="270" r="13" fill="#0f9f7a" stroke="#fff" stroke-width="5"/>
  <text x="92" y="72" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Taylor polynomials are local models</text>
  <text x="92" y="502" fill="#475467" font-family="Arial, sans-serif" font-size="24">sin(x), center 0, degree 5 approximation</text>
</svg>
""",
    "MonteCarloSamplingScene": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-label="Monte Carlo samples inside a quarter circle">
  <rect width="960" height="540" fill="#f7fbfa"/>
  <g transform="translate(245 92)">
    <rect x="0" y="0" width="356" height="356" rx="18" fill="#ffffff" stroke="#d9e3e1" stroke-width="4"/>
    <path d="M0 0 A356 356 0 0 1 356 356" fill="none" stroke="#247a73" stroke-width="12" stroke-linecap="round"/>
    <g fill="#247a73" stroke="#ffffff" stroke-width="3">
      <circle cx="34" cy="292" r="9"/><circle cx="80" cy="210" r="9"/><circle cx="142" cy="312" r="9"/>
      <circle cx="188" cy="160" r="9"/><circle cx="228" cy="238" r="9"/><circle cx="282" cy="182" r="9"/>
      <circle cx="315" cy="318" r="9"/><circle cx="58" cy="74" r="9"/><circle cx="108" cy="116" r="9"/>
    </g>
    <g fill="#d8663a" stroke="#ffffff" stroke-width="3">
      <circle cx="322" cy="70" r="9"/><circle cx="292" cy="118" r="9"/><circle cx="184" cy="42" r="9"/>
      <circle cx="334" cy="214" r="9"/>
    </g>
  </g>
  <text x="88" y="64" fill="#0f1728" font-family="Arial, sans-serif" font-size="34" font-weight="700">Monte Carlo turns area into a count</text>
  <text x="88" y="500" fill="#475467" font-family="Arial, sans-serif" font-size="24">Count the fraction of samples inside the quarter circle, then scale the area.</text>
</svg>
""",
}

FALLBACK_TITLES = {
    "VectorDistanceNormScene": "Norm and distance use the same ruler",
    "CosineSimilarityAngleScene": "Cosine similarity reads direction",
    "MatrixColumnCombinationScene": "Matrix-vector multiplication mixes columns",
    "RankFlatteningScene": "Rank counts effective output directions",
    "NullSpaceCollapseScene": "Null space is what the matrix erases",
    "SvdLowRankReconstructionScene": "SVD keeps the strongest matrix directions",
    "PcaCenteringProjectionScene": "PCA centers before projecting variance",
    "BeginnerDerivativeWindowScene": "Derivative window shrinks to the tangent",
    "BeginnerChainRuleBackpropScene": "Chain rule sends gradients backward",
    "BeginnerLearningRateBehaviorScene": "Same slope, different step size",
    "BeginnerProbabilityFrequencyScene": "Probability needs repeated trials",
    "BeginnerConditionalBayesScene": "Evidence filters the sample space",
    "BeginnerCalibrationCrossEntropyScene": "Probability bars must be checked",
}


def render_scene(scene_name: str) -> Path:
    subprocess.run(
        [
            "manim",
            "-ql",
            "--format",
            "mp4",
            "--media_dir",
            str(ROOT / "media"),
            str(SCENE_FILE),
            scene_name,
        ],
        cwd=ROOT,
        check=True,
    )
    media_path = ROOT / "media" / "videos" / "math_lab_basics" / "480p15" / f"{scene_name}.mp4"
    if not media_path.exists():
        raise FileNotFoundError(f"Expected Manim output not found: {media_path}")
    return media_path


def write_fallback_video(scene_name: str, out_path: Path) -> None:
    from PIL import Image, ImageDraw, ImageFont
    import av

    title = FALLBACK_TITLES.get(scene_name, scene_name)
    font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 44)
    font_body = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 26)
    width, height = 960, 540
    container = av.open(str(out_path), "w")
    stream = container.add_stream("libx264", rate=15)
    stream.width = width
    stream.height = height
    stream.pix_fmt = "yuv420p"

    for frame_index in range(90):
        image = Image.new("RGB", (width, height), "#fffaf1")
        draw = ImageDraw.Draw(image)
        draw.text((72, 58), title, fill="#10162f", font=font_title)
        progress = frame_index / 89
        draw.rounded_rectangle((88, 150, 872, 410), radius=26, fill="#ffffff", outline="#d8dfeb", width=4)
        if scene_name == "BeginnerChainRuleBackpropScene":
            nodes = [(150, "x"), (340, "z = w·x + b"), (560, "ŷ = σ(z)"), (760, "L")]
            for x, label in nodes:
                draw.rounded_rectangle((x - 62, 235, x + 62, 300), radius=12, fill="#ffffff", outline="#10162f", width=3)
                draw.text((x - 42, 255), label, fill="#10162f", font=font_body)
            draw.line((212, 268, 278, 268, 498, 268, 698, 268), fill="#3868ff", width=7)
            x_back = 760 - progress * 610
            draw.line((760, 340, x_back, 340), fill="#d65a31", width=7)
        elif scene_name == "BeginnerLearningRateBehaviorScene":
            for offset, color in [(170, "#f2b84b"), (440, "#0f9f7a"), (710, "#d9463f")]:
                draw.arc((offset - 95, 180, offset + 95, 390), 190, 350, fill="#3868ff", width=7)
                draw.line((offset - 70, 230, offset - 70 + 130 * progress, 340 - 110 * abs(progress - 0.5)), fill=color, width=7)
        elif scene_name == "SvdLowRankReconstructionScene":
            for index, height in enumerate([190, 138, 92, 46, 26]):
                x = 128 + index * 68
                color = "#3868ff" if index < 3 or progress < 0.55 else "#d7dbea"
                draw.rounded_rectangle((x, 382 - height, x + 46, 382), radius=8, fill=color, outline="#10162f", width=3)
                draw.text((x + 8, 396), f"s{index + 1}", fill="#475467", font=font_body)
            draw.text((108, 152), "A_k keeps the first k singular layers", fill="#10162f", font=font_body)
            for row in range(4):
                for col in range(4):
                    strong = row == col or row + col == 3
                    color = "#0f9f7a" if strong else ("#9ee6ff" if progress < 0.55 else "#e7eef7")
                    x = 560 + col * 48
                    y = 192 + row * 48
                    draw.rounded_rectangle((x, y, x + 38, y + 38), radius=6, fill=color, outline="#10162f", width=2)
            draw.text((532, 414), "structure first, detail later", fill="#475467", font=font_body)
        elif scene_name == "PcaCenteringProjectionScene":
            draw.line((130, 384, 600, 384), fill="#7b8497", width=3)
            draw.line((190, 132, 190, 420), fill="#7b8497", width=3)
            raw_points = [(236, 310), (282, 280), (330, 258), (374, 236), (424, 214), (476, 188)]
            mean = (354, 248)
            if progress < 0.48:
                for point in raw_points:
                    draw.ellipse((point[0] - 11, point[1] - 11, point[0] + 11, point[1] + 11), fill="#3868ff", outline="#10162f", width=3)
                draw.ellipse((mean[0] - 14, mean[1] - 14, mean[0] + 14, mean[1] + 14), fill="#ffd84d", outline="#10162f", width=3)
                draw.text((560, 174), "subtract the mean", fill="#10162f", font=font_body)
            else:
                centered = [(x - 164, y + 88) for x, y in raw_points]
                draw.line((210, 346, 526, 168), fill="#f2b84b", width=8)
                for index, point in enumerate(centered):
                    draw.ellipse((point[0] - 11, point[1] - 11, point[0] + 11, point[1] + 11), fill="#0f9f7a", outline="#10162f", width=3)
                    projected_x = 230 + index * 48
                    projected_y = 335 - index * 27
                    draw.ellipse((projected_x - 9, projected_y - 9, projected_x + 9, projected_y + 9), fill="#f2b84b", outline="#10162f", width=2)
                draw.text((560, 174), "project max variance", fill="#10162f", font=font_body)
        else:
            points = []
            for index in range(100):
                x = -2.4 + index * 4.8 / 99
                y = 0.35 * (x - 0.25) ** 2
                points.append((150 + index * 6.5, 360 - y * 95))
            draw.line(points, fill="#3868ff", width=7)
            x0 = 470
            h = 210 * (1 - progress) + 34
            draw.line((x0, 335, x0 + h, 280 + h * 0.12), fill="#d65a31", width=7)
            draw.line((380, 350, 610, 310), fill="#0f9f7a", width=7)
        draw.text((72, 462), "Fallback preview generated because Manim is unavailable in this environment.", fill="#475467", font=font_body)
        video_frame = av.VideoFrame.from_image(image)
        for packet in stream.encode(video_frame):
            container.mux(packet)

    for packet in stream.encode():
        container.mux(packet)
    container.close()


def write_metadata() -> None:
    metadata = {
        "generatedBy": "scripts/manim/render_math_lab.py",
        "scenes": [
            {
                "scene": scene,
                "assetPath": f"/manim/math-lab/{filename}",
                "posterPath": f"/manim/math-lab/{filename.replace('.mp4', '.svg')}",
            }
            for scene, filename in SCENES.items()
        ],
    }
    (PUBLIC_DIR / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf8")


def write_static_posters() -> None:
    for scene, svg in POSTER_SVGS.items():
        filename = SCENES[scene].replace(".mp4", ".svg")
        (PUBLIC_DIR / filename).write_text(svg, encoding="utf8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Render Math Intuition Lab Manim videos.")
    parser.add_argument("--skip-render", action="store_true", help="Only rewrite metadata.")
    parser.add_argument("--force", action="store_true", help="Render scenes even when the public MP4 already exists.")
    parser.add_argument("--scene", action="append", choices=sorted(SCENES), help="Render only the selected scene. Can be repeated.")
    args = parser.parse_args()

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    write_static_posters()

    if not args.skip_render:
        manim_path = shutil.which("manim")
        selected_scenes = set(args.scene or SCENES.keys())
        for scene_name, filename in SCENES.items():
            if scene_name not in selected_scenes:
                continue
            destination = PUBLIC_DIR / filename
            if destination.exists() and not args.force:
                continue
            if manim_path:
                output = render_scene(scene_name)
                shutil.copyfile(output, destination)
            elif not destination.exists():
                write_fallback_video(scene_name, destination)

    write_metadata()


if __name__ == "__main__":
    main()
