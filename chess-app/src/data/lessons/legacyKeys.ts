/** Exercise keys by block index, frozen before diagrams were inserted: old progress saved block indices. */
export const LEGACY_KEYS: Record<string, Record<number, string>> = {
 "intro-board": {
  "3": "s:a1,h8,e4,d5,f3,b7,g2,c6"
 },
 "pieces-straight": {
  "1": "t:7k/8/8/8/8/8/R6p/4K3 w - - 0 1:a2h2",
  "2": "t:7k/8/8/8/n2R1P1b/8/8/6K1 w - - 0 1:d4a4",
  "4": "t:7k/8/8/8/5p2/8/3B4/4K3 w - - 0 1:d2f4",
  "6": "t:7k/8/8/1r6/8/8/4Q3/4K3 w - - 0 1:e2b5"
 },
 "pieces-special": {
  "1": "t:7k/8/8/8/8/8/P2n4/4K3 w - - 0 1:e1d2",
  "3": "t:7k/8/8/3p4/8/2N5/8/4K3 w - - 0 1:c3d5",
  "4": "t:7k/8/8/8/3r4/1PRP4/1PNP4/4K3 w - - 0 1:c2d4",
  "6": "t:rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1:e2e4",
  "7": "t:7k/8/8/8/3n1b2/4P3/8/4K3 w - - 0 1:e3d4"
 },
 "notation": {
  "1": "t:rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1:g1f3",
  "2": "t:r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3:f1c4",
  "3": "t:rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2:e4d5"
 },
 "rules-special": {
  "1": "t:r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 5:e1g1",
  "2": "t:rnbqkbnr/ppp2ppp/4p3/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3:e5d6",
  "3": "t:8/1P4k1/8/8/8/8/8/4K3 w - - 0 1:b7b8q"
 },
 "check-mate-draw": {
  "2": "t:7k/5Q2/6K1/8/8/8/8/8 w - - 0 1:f7g7",
  "3": "t:6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1:a1a8",
  "4": "t:r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4:h5f7"
 },
 "opening-principles": {
  "1": "t:r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3:g7g6",
  "2": "t:rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1:e2e4"
 },
 "basic-mates": {
  "1": "t:6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1:b1b7",
  "4": "t:3k4/8/3K4/8/8/8/8/6Q1 w - - 0 1:g1g8",
  "7": "t:7k/8/6K1/8/8/8/8/R7 w - - 0 1:a1a8"
 },
 "pawn-endings-1": {
  "1": "t:8/8/8/8/P4k2/8/8/7K b - - 0 1:f4e4",
  "2": "t:4k3/8/4K3/4P3/8/8/8/8 w - - 0 1:e6d6",
  "3": "t:4k3/8/8/4K3/4P3/8/8/8 b - - 0 1:e8e7"
 },
 "thinking-process": {
  "1": "t:r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4:d2d3",
  "2": "t:r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 5 4:d7d5",
  "3": "p:hangingPiece,mateIn1:500-900"
 },
 "opening-white-italian": {
  "1": "t:rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1:e2e4",
  "2": "t:rn1qkbnr/ppp2p1p/3p2p1/4N3/2B1P3/2N5/PPPP1PPP/R1BbK2R w KQkq - 0 6:c4f7",
  "3": "t:r1bqkbnr/pppp1ppp/8/4p3/2BnP3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4:f3d4",
  "4": "p:attackingF2F7,opening:900-1300"
 },
 "opening-black-e4": {
  "1": "t:rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1:e2e4",
  "2": "t:r1bqkb1r/ppp2ppp/2n2n2/3Pp1N1/2B5/8/PPPP1PPP/RNBQK2R b KQkq - 0 5:c6a5",
  "3": "p:opening,attackingF2F7:1000-1400"
 },
 "opening-black-d4": {
  "1": "t:rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1:d2d4",
  "2": "p:queensideAttack,middlegame:1000-1400"
 },
 "mating-patterns": {
  "6": "p:smotheredMate,arabianMate,anastasiaMate:1000-1500",
  "7": "p:bodenMate,doubleBishopMate:1000-1500",
  "8": "p:mateIn2:1100-1400"
 },
 "rook-endings-1": {
  "1": "t:2K5/2P2k2/8/8/8/8/r7/4R3 w - - 0 1:e1e4",
  "3": "t:4k3/7R/r3P3/3K4/8/8/8/8 b - - 0 1:a6a1",
  "4": "p:rookEndgame:1100-1500"
 },
 "pawn-endings-2": {
  "1": "t:7k/ppp5/8/PPP5/8/8/8/7K w - - 0 1:b5b6",
  "3": "p:pawnEndgame:1100-1500"
 },
 "strategy-basics": {
  "3": "p:quietMove:1100-1500"
 },
 "pawn-structures": {
  "4": "p:advancedPawn,promotion:1500-1900"
 },
 "minor-pieces": {
  "3": "p:bishopEndgame,knightEndgame:1500-1900"
 },
 "attack-king": {
  "2": "p:kingsideAttack,sacrifice:1500-1900",
  "3": "p:exposedKing:1500-1900"
 },
 "defence": {
  "1": "p:defensiveMove:1500-1900",
  "2": "p:defensiveMove:1100-1500",
  "3": "p:intermezzo:1500-1900"
 },
 "endgames-advanced": {
  "2": "p:rookEndgame:1600-2000",
  "3": "p:queenEndgame,queenRookEndgame:1500-2000",
  "4": "p:zugzwang:1500-2000"
 },
 "calculation": {
  "1": "p:long,veryLong:1600-2000",
  "2": "p:quietMove:1600-2000"
 },
 "opening-repertoire": {
  "1": "p:opening:1500-1900"
 },
 "planning": {
  "2": "p:middlegame,quietMove:1600-2000"
 },
 "road-to-master": {
  "1": "p:master,masterVsMaster,superGM:2000-2400"
 },
 "prophylaxis": {
  "1": "p:quietMove,defensiveMove:2000-2500",
  "2": "p:zugzwang,endgame:2000-2500"
 }
};
