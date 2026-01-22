## MOVE tab — vérification manuelle

### Cas 1 — MOVE sans suppression
Initial:
- C1: [A, B]
- C2: [C]

Action:
- drag B → header C2

Attendu:
- C1: [A]
- C2: [C, B]

### Cas 2 — MOVE avec suppression
Initial:
- C1: [A]
- C2: [B]

Action:
- drag A → header C2

Attendu:
- C1 supprimé
- C2: [B, A]

### Cas 3 — no-op
Initial:
- C1: [A, B]

Action:
- drag A → header C1

Attendu:
- aucun changement
