"""Sample a compact, stratified puzzle set from the Lichess puzzle database (CC0).

Usage: python3 -I scripts/build_puzzles.py <lichess_db_puzzle.csv.zst> <out.json>

Output: JSON array of [id, fen, moves, rating, themes] rows.
"""
import csv, io, json, random, sys
import zstandard

SRC, OUT = sys.argv[1], sys.argv[2]
random.seed(42)

BUCKETS = list(range(400, 2900, 100))          # 400..2800
PER_BUCKET = 260
RESERVOIR = 3000
MIN_POP, MIN_PLAYS = 85, 600

# Themes we want represented. Everything else is kept as extra tags.
KEY_THEMES = [
    "mateIn1","mateIn2","mateIn3","fork","pin","skewer","discoveredAttack","doubleCheck",
    "backRankMate","hangingPiece","trappedPiece","deflection","attraction","sacrifice",
    "clearance","interference","intermezzo","quietMove","defensiveMove","zugzwang",
    "promotion","advancedPawn","exposedKing","kingsideAttack","queensideAttack",
    "endgame","rookEndgame","pawnEndgame","queenEndgame","bishopEndgame","knightEndgame",
    "queenRookEndgame","smotheredMate","anastasiaMate","arabianMate","bodenMate","hookMate",
    "doubleBishopMate","dovetailMate","killBoxMate","xRayAttack","capturingDefender",
    "attackingF2F7","castling","enPassant","underPromotion","opening","middlegame",
    "crushing","advantage","equality","oneMove","short","long","veryLong","master","masterVsMaster","superGM",
]
KEY = set(KEY_THEMES)

reservoirs = {b: [] for b in BUCKETS}
seen = {b: 0 for b in BUCKETS}

dctx = zstandard.ZstdDecompressor()
with open(SRC, "rb") as fh:
    reader = csv.reader(io.TextIOWrapper(dctx.stream_reader(fh), encoding="utf-8", newline=""))
    header = next(reader)
    idx = {name: i for i, name in enumerate(header)}
    for row in reader:
        try:
            pop = int(row[idx["Popularity"]]); plays = int(row[idx["NbPlays"]])
            rating = int(row[idx["Rating"]]); rd = int(row[idx["RatingDeviation"]])
        except ValueError:
            continue
        if pop < MIN_POP or plays < MIN_PLAYS or rd > 90:
            continue
        b = min(max((rating // 100) * 100, 400), 2800)
        seen[b] += 1
        rec = (row[idx["PuzzleId"]], row[idx["FEN"]], row[idx["Moves"]], rating, row[idx["Themes"]])
        r = reservoirs[b]
        if len(r) < RESERVOIR:
            r.append(rec)
        else:
            j = random.randrange(seen[b])
            if j < RESERVOIR:
                r[j] = rec

out = []
for b in BUCKETS:
    cand = reservoirs[b]
    random.shuffle(cand)
    counts = {t: 0 for t in KEY_THEMES}
    chosen = []
    # Greedy: prefer puzzles whose rarest theme is under-represented in this bucket.
    def score(rec):
        th = [t for t in rec[4].split() if t in KEY]
        return min((counts[t] for t in th), default=10**6)
    pool = cand[:]
    while pool and len(chosen) < PER_BUCKET:
        pool.sort(key=score)
        rec = pool.pop(0)
        chosen.append(rec)
        for t in rec[4].split():
            if t in KEY:
                counts[t] += 1
    out.extend(chosen)

random.shuffle(out)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump([[r[0], r[1], r[2], r[3], r[4]] for r in out], f, ensure_ascii=False, separators=(",", ":"))
print("wrote", len(out), "puzzles")
from collections import Counter
c = Counter(t for r in out for t in r[4].split() if t in KEY)
print(sorted(c.items(), key=lambda x: -x[1]))
