# mosaic-dnd

DnD tab‑centric playground built on top of React and react‑mosaic.

## 🎯 Goal

This project explores a **Drag & Drop first UX model** where:

- the **tab** is the only movable unit
- grouping, isolation and closing are **effects**, not commands
- layout (Mosaic) is strictly **orthogonal** to business logic
- there is **no concept of “isolated panel”** at the model level

A container with one tab *is* an isolated panel.

---

## 🧠 Core principles

### 1. Tabs are the only draggable entities
- never containers
- never headers
- never groups

### 2. Containers are tab stacks (LIFO)
- 1 tab → visually isolated
- N tabs → visually grouped
- same model, same rules

### 3. Drag & Drop is the language
There are only two valid DnD targets:

- **tab → container header**
  → grouping (move tab into container)

- **tab → neutral area**
  - if source has more than 1 tab → isolation
  - if source has 1 tab → closure

No explicit:
- attach
- detach
- close tab
- create group

---

## 🧱 Architecture (high level)

src/
model/ # pure business logic (tabs, containers, workspace)
dnd/ # drag & drop handling (UI → model mapping)
workspace/ # orchestration between model and layout
ui/ # dumb UI components


- **model** has no React dependency
- **layout** never modifies business state
- **DnD** only calls model actions

---

## 🚧 Status

This project is intentionally minimal and incremental.

Current focus:
- establish a clean, tab‑centric model
- validate DnD semantics before UI polish
- avoid legacy concepts and implicit behaviors

---

## 📌 Non‑goals (for now)

- no advanced styling
- no persistence
- no external DnD library until semantics are proven
- no premature abstractions

---

## 🧭 Why this project exists

This is a sandbox to design a **coherent DnD UX system** that can later
be integrated into a larger SaaS application.

Clarity > features.
Correctness > speed.



🧠 Concepts (définition stricte)
1️⃣ Tab

    représente un contenu métier

    est déplaçable

    est unique dans le workspace

2️⃣ Container

    contient une pile LIFO de tabs

    a toujours un tab actif

    peut avoir 1 à N tabs

    ne disparaît que s’il est vide

3️⃣ Workspace

    ensemble des containers

    garantit :

        unicité des tabs

        cohérence des piles

        opérations atomiques


______________________________________________________________________________


| Panel          | Cardinalité     | Ouvre               | Est ouvert depuis |
| -------------- | --------------- | ------------------- | ----------------- |
| Strategies     | 1               | StrategyDetail      | —                 |
| StrategyDetail | 1 / strategy    | Chart, Run, Nodered | Strategies        |
| Chart          | 0..n            | —                   | StrategyDetail    |
| Run            | 0..n            | —                   | StrategyDetail    |
| Nodered        | 0..1 / strategy | —                   | StrategyDetail    |

______________________________________________________________________________



🧭 Règle complète d’ouverture des panels

(avec zonage & choix du container cible)
1️⃣ Zonage global de l’application

Le workspace est structurellement découpé en 2 grandes zones :
🔵 Zone haute — ~60 % de la hauteur

Rôle : visualisation & édition lourde

Panels autorisés :

    Chart

    Nodered

Caractéristiques :

    grande surface par défaut

    panels à forte densité visuelle

    usage souvent simultané


┌───────────────────────────────────────────┐
│ 🔵 ZONE HAUTE (~60%)                      │
│ ┌──────────────┐ ┌──────────────────────┐ │
│ │ Nodered      │ │ Charts               │ │
│ │ (gauche)     │ │ (droite)             │ │
│ └──────────────┘ └──────────────────────┘ │
├───────────────────────────────────────────┤
│ 🟢 ZONE BASSE (~40%)                      │
│ ┌────────┐ ┌──────────────┐ ┌──────────┐  │
│ │ Strat. │ │ StrategyDet. │ │ Runs     │  │
│ │ gauche │ │ centre       │ │ droite   │  │
│ └────────┘ └──────────────┘ └──────────┘  │
└───────────────────────────────────────────┘


🧭 Workspace — Spécification fonctionnelle & UX
1️⃣ Objectif

Définir :

    le zonage du workspace

    les types de panels métier

    les règles d’ouverture

    les règles de regroupement (tabs)

    le rôle de Mosaic

Cette spec décrit le comportement attendu, indépendamment de l’implémentation technique.
2️⃣ Principes fondamentaux
2.1 Panels vs layout

    Les panels sont des vues métier.
    Le layout est une conséquence, pas une contrainte.

    le métier décide quoi ouvrir

    Mosaic décide où et comment l’afficher

    le zonage définit uniquement des destinations par défaut

2.2 Rien n’est figé

    le layout initial suit des règles

    ensuite :

        Mosaic permet resize

        Mosaic permet déplacements

        l’utilisateur peut regrouper / dégrouper

    aucune zone n’est verrouillée

2.3 Symétrie des types de panels

    Tous les types de panels obéissent aux mêmes règles structurelles.

    tous peuvent :

        exister en plusieurs instances

        être détachés

        cohabiter à l’écran

        être regroupés en tabs

    le type influe uniquement sur :

        la zone d’ouverture par défaut

        le sens métier du contenu

3️⃣ Types de panels métier

    Strategies

    StrategyDetail

    Nodered

    Chart

    Run

Chaque panel est :

    contextualisé (ex : strategyId, runId, etc.)

    contenu dans un container

    représenté par un Tab

4️⃣ Zonage du workspace (destinations par défaut)

Le workspace est découpé en 2 grandes zones, utilisées uniquement à l’ouverture initiale.
🔵 Zone haute (~60 % de la hauteur)

Rôle : visualisation & édition lourde

Découpage par défaut :

| Position | Type de panel |
| -------- | ------------- |
| Gauche   | **Nodered**   |
| Droite   | **Chart**     |


Règles :

    Nodered et Chart ne se mélangent pas dans un même container

    plusieurs containers possibles

    plusieurs tabs par container

    disposition modifiable après ouverture

🟢 Zone basse (~40 % de la hauteur)

Rôle : pilotage & exécution

Découpage par défaut :

| Position | Type de panel      |
| -------- | ------------------ |
| Gauche   | **Strategies**     |
| Centre   | **StrategyDetail** |
| Droite   | **Run**            |


Règles :

    plusieurs containers possibles

    plusieurs tabs par container

    coexistence libre après ouverture

5️⃣ Règle d’ouverture des panels (règle centrale)
🧠 Règle unique (valable pour tous les types)

    À l’ouverture d’un panel d’un type donné :

    On recherche les containers existants de ce type

    S’il en existe au moins un :

        le panel est ajouté en onglet (Tab)

        dans le premier container trouvé

    Sinon :

        un nouveau container est créé

        il est placé dans la zone par défaut associée au type

Ensuite :

    Mosaic peut librement modifier le layout

    aucune contrainte supplémentaire n’est imposée

6️⃣ Regroupement, détachement, coexistence
6.1 Onglets (Tabs)

    un container peut contenir plusieurs tabs

    tous les types de panels suivent la même logique

    fermeture d’un tab :

        supprime le tab

        supprime le container s’il devient vide

6.2 Détachement

    un tab peut être détaché

    le détachement crée :

        soit un nouveau container

        soit ferme le tab si c’était le dernier (règle métier existante)

6.3 Coexistence

    plusieurs StrategyDetail peuvent être ouverts simultanément

    plusieurs stratégies peuvent être travaillées en parallèle

    aucun type n’est “pivot” structurellement

7️⃣ Rôle de Mosaic

Mosaic est responsable de :

    la géométrie

    les splits

    les redimensionnements

    les déplacements

    les zones de drop (edges, placeholders)

Mosaic ne connaît pas :

    les types de panels métier

    les règles d’ouverture

    les cardinalités métier

    les contextes (strategyId, etc.)

👉 Mosaic est une couche d’interaction, pas de décision.
8️⃣ Résumé exécutif

    le zonage définit des destinations par défaut

    rien n’est figé après ouverture

    tous les types de panels sont structurellement équivalents

    ouverture :

        container existant du bon type → onglet

        sinon → nouveau container dans la zone par défaut

    Mosaic gère le layout, le métier gère le sens


_______________________________________________________________________________


🪟 Panels détachés — Spécification fonctionnelle
1️⃣ Objectif

Définir le comportement des panels détachés en fenêtre indépendante, en garantissant :

    une sémantique métier claire

    l’absence d’état implicite ou magique

    une parfaite cohérence avec les règles d’ouverture standards (openPanel())

Cette spec s’applique à tous les types de panels, sans exception.
2️⃣ Principe fondamental

    Un panel détaché n’appartient plus au workspace.

Conséquences :

    il est retiré du layout Mosaic

    le workspace est immédiatement recalculé sans lui

    la fenêtre détachée contient un seul panel

    il n’existe aucun lien structurel persistant avec l’ancien layout

Il ne s’agit ni d’un plein écran,
ni d’un mode focus,
mais d’un détachement réel.
3️⃣ Détachement d’un panel
3.1 Action utilisateur

    action explicite sur un panel :

        “Détacher en fenêtre”

        icône ↗ / ⧉

    jamais automatique

3.2 Effets immédiats

    le panel est :

        supprimé de son container

        le container est supprimé s’il devient vide

    le layout Mosaic est mis à jour

    une nouvelle fenêtre est ouverte

    la fenêtre contient :

        exactement un panel

        avec son kind et son context

4️⃣ Coexistence de plusieurs fenêtres

    plusieurs panels peuvent être détachés simultanément

    chaque panel vit dans sa propre fenêtre

    l’OS / navigateur gère :

        la taille

        la position

        le côte‑à‑côte

        le multi‑écran

👉 Le système n’impose aucune limite artificielle.
5️⃣ Fermeture de la fenêtre

Il existe deux chemins distincts, avec des sémantiques différentes.
5.1 Fermeture “brutale” (OS / navigateur)
Exemples

    clic sur la croix native de la fenêtre

    raccourci OS (Alt+F4, Cmd+W)

    crash / refresh

Effet

    ❌ perte définitive du panel

    aucun événement de retour

    aucune ré‑insertion automatique

Sémantique métier

    Fermer brutalement la fenêtre = fermer le panel.

Ce comportement est :

    simple

    explicite

    sans surprise

    conforme à un usage expert

5.2 Fermeture via le bouton “Retour au workspace”
UX

    bouton explicite dans la fenêtre :

        “⤢ Retour au workspace”

        ou “Replacer dans le layout”

Effet

    la fenêtre déclenche une intention métier

    un événement est envoyé au workspace

    le panel est ré‑ouvert, pas restauré

6️⃣ Ré‑insertion dans le workspace
6.1 Principe clé

    Le retour d’un panel détaché est traité comme une ouverture normale.

Il n’y a :

    ❌ pas de restauration de position

    ❌ pas de snapshot du layout précédent

    ❌ pas de logique spéciale

6.2 Événement émis

Conceptuellement :

openPanel(kind, context)

ou, de façon équivalente :

PanelReturnEvent = {
  type: "PANEL_RETURN",
  kind: PanelKind,
  context: PanelContext
}

6.3 Règles appliquées

La ré‑insertion suit exactement la spec openPanel() :

    calcul de la GroupKey

    recherche d’un container existant compatible

        → ajout en onglet

    sinon :

        création d’un nouveau container

        placement dans la zone par défaut du type

👉 Le panel peut donc :

    revenir dans un autre container

    rejoindre un onglet existant

    apparaître à un autre endroit qu’avant

C’est volontaire et assumé.
7️⃣ Cycle de vie récapitulatif

Workspace
   │
   ├─ Détacher → Fenêtre indépendante
   │               │
   │               ├─ Fermeture OS
   │               │        → panel fermé (perdu)
   │               │
   │               └─ Bouton "Retour"
   │                        ↓
   └──────────── openPanel(kind, context)


8️⃣ Invariants garantis

    un panel n’est jamais dupliqué

    un panel est soit :

        dans le workspace

        soit dans une fenêtre

    jamais les deux

    aucun état caché

    aucune restauration implicite

    toutes les règles passent par openPanel()

9️⃣ Ce que cette spec exclut explicitement

    ❌ plein écran “toggle”

    ❌ retour automatique à la position précédente

    ❌ mode focus implicite

    ❌ duplication workspace ↔ fenêtre

    ❌ logique spéciale par type de panel

🔚 Résumé exécutif

    Le détachement ouvre un panel dans une fenêtre indépendante et le retire du workspace.
    La fermeture de la fenêtre ferme le panel.
    Le bouton “Retour au workspace” déclenche une ré‑ouverture standard via openPanel(), sans restauration de layout.

__________________________________________________________________________________

🧪 Tableau — Actions ↔ Invariants impactés

    Objectif : savoir exactement quels invariants doivent rester vrais après chaque action utilisateur ou système.

🔹 Légende rapide des invariants

    A* : invariants structurels

    B* : cycle de vie

    C* : règles métier / openPanel

    D* : indépendance du layout

    E* : nettoyage / cohérence

(Référence aux invariants listés précédemment)
📋 Tableau de synthèse

| Action                                                  | Invariants impactés        | Ce qui doit être vérifié                                                  |
| ------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------- |
| **openPanel(kind, context)**                            | A1, C1, C2, E2             | Panel présent une seule fois, regroupement par GroupKey, workspace valide |
| **openPanel avec container existant**                   | A1, C1, C2                 | Ajout en onglet, pas de nouveau container                                 |
| **openPanel sans container existant**                   | A1, C1, E2                 | Création d’un container dans la zone par défaut                           |
| **detachPanel(panel)**                                  | A1, A2, A3, B1, D2, E1, E2 | Panel retiré du workspace, fenêtre créée, container vide supprimé         |
| **detach dernier tab d’un container**                   | A2, E1, E2                 | Container supprimé, pas de container vide                                 |
| **ouvrir plusieurs panels détachés**                    | A1, A3, B1                 | Une fenêtre = un panel, aucune duplication                                |
| **fermeture fenêtre (OS / brute)**                      | B2, E2                     | Panel définitivement perdu, aucun event workspace                         |
| **clic “Retour au workspace”**                          | B3, C1, C2, D1, E2         | Émission `openPanel`, pas de restauration de position                     |
| **retour alors qu’un container compatible existe**      | C1, C2                     | Ajout en onglet dans le bon container                                     |
| **retour alors qu’aucun container compatible n’existe** | C1, E2                     | Nouveau container créé dans la zone par défaut                            |
| **double clic / retour multiple**                       | C3, A1, E2                 | Idempotence : pas de duplication, état stable                             |
| **fermer un panel dans le workspace**                   | A1, E1, E2                 | Suppression du tab, suppression du container si vide                      |
| **fermer un panel détaché via bouton “Fermer”**         | B2, E2                     | Fermeture équivalente à fermeture OS                                      |
| **modifier le layout après detach (sans Mosaic)**       | D2, E2                     | Aucune dépendance au layout, invariants inchangés                         |
| **ré‑ouvrir un panel précédemment perdu**               | C1, C2, E2                 | Comportement identique à une ouverture normale                            |


🧠 Lecture rapide (ce qu’il faut retenir)
Actions critiques (à tester en priorité)

    detachPanel

    fermeture OS de la fenêtre

    bouton “Retour au workspace”

    retour avec GroupKey déjà existante

Invariants les plus sensibles

    A1 — exclusivité panel

    C2 — respect de la GroupKey

    E1 — pas de container vide

    D1 — aucune restauration implicite

Si un seul de ceux‑là casse, il faut corriger avant Mosaic.
🧪 Utilisation concrète du tableau

Tu peux l’utiliser comme :

    ✅ checklist de tests manuels

    🧪 base de tests unitaires

    📋 critères d’acceptation du POC

    🧱 garde‑fou avant intégration Mosaic

🧠 Version ultra‑condensée (si tu veux la coller en tête de test plan)

    Chaque action doit préserver :

        l’exclusivité panel (workspace ou fenêtre)

        le regroupement par GroupKey

        l’absence de restauration implicite

        la suppression des containers vides

        la validité globale du workspace



_________________________________________________________________________

✅ État actuel du projet (au moment du freeze)
Ce qui est solide et validé

    ✅ Modèle métier (Workspace / Tabs / Containers)

        openPanel, detachPanel, DnD header → OK

        Règles métiers testées et stables

    ✅ Detach

        Sort définitivement du workspace

        Supporte plusieurs tabs détachés

        Retour possible via openPanel

    ✅ Tests modèle : verts

    ✅ POC UI fonctionnel

        Bouton detach

        DnD header

        Debug View exploitable

    ✅ Tag déjà posé : mosaic-dnd-v0.1
    👉 c’est une borne saine

Ce qui est volontairement gelé

    ❄️ isolate

        Trop lié à Mosaic

        Les tests UI forcent une sémantique qui n’existe pas encore visuellement

    ❄️ DnD outside → isolate

        À retirer / ignorer pour l’instant

__________________________________________________________________

✅ Ton plan proposé : VALIDÉ

Je te confirme point par point :

        mettre des boutons "detach" et "isolate" sur les Tabs
        ✅ OUI (UI explicite > DnD implicite)

        implémenter les 2 fonctions derrière ces boutons
        ✅ OUI (déjà très bien séparées)

        retirer le DnD outside pour réaliser isolate
        ✅ OUI (excellent choix)

        faire des tests vitest avec ces boutons
        ✅ OUI, tests d’intention, pas de layout


        | Fichier                       | Action       | Raison                 |
| ----------------------------- | ------------ | ---------------------- |
| `Workspace.detach.spec.tsx`   | ✅ actif      | contrat UI stable      |
| `Workspace.close.spec.tsx`    | ✅ partiel    | dernier tab hors scope |
| `Workspace.isolate.spec.tsx`  | 🟡 `it.skip` | dépend Mosaic          |
| `Workspace.render.spec.tsx`   | 🟡 `it.skip` | layout                 |
| `Workspace.semantic.spec.tsx` | 🟡 `it.skip` | structure future       |


| Action      | Test UI ? | Pourquoi                    |
| ----------- | --------- | --------------------------- |
| close       | ✅         | geste local, visible        |
| detach      | ✅         | geste local, visible        |
| isolate     | ✅         | geste spatial, intentionnel |
| **rattach** | ❌         | orchestration métier        |



        intégrer Mosaic
        ✅ OUI, ensuite seulement

        adapter isolate
        ✅ OUI, à ce moment-là seulement

        adapter detach
        🟰 peu de changements, surtout pour le “retour”

        implémenter "retour" sur un Tab détaché
        ✅ OUI (via openPanel)

____________________________________________________________________


🗺️ Plan post‑freeze (ordre important)
Phase 1 — Clarification UI (sans Mosaic)

Objectif : figer les intentions UI.

Bouton Detach sur chaque Tab

Bouton Isolate sur chaque Tab (simulation)

Supprimer totalement :

    DnD outside → isolate

    Tests UI simples :

        click Detach → tab sort du workspace

        click Isolate → tab reste dans le workspace

👉 Isolate = appel d’une intention, pas encore un layout réel.
Phase 2 — Introduction de Mosaic (layout only)

Objectif : brancher Mosaic sans logique métier.

Intégrer Mosaic comme projection du workspace

Aucun changement dans :

    workspace.ts

    workspace.panels.ts

    Mapper :

        Container → MosaicNode

        Tab → contenu

👉 Mosaic ne décide rien, il affiche.
Phase 3 — Dock / Split Mosaic

Objectif : donner un sens réel à isolate.

Définir zones de dock Mosaic (N / S / E / W)

Isolate déclenché uniquement par :

    DnD vers une zone de split du container source

    Cas particulier :

        container avec 1 tab → split neutre (pas visible)

👉 C’est le layout qui décide si quelque chose est visible.
Phase 4 — Adapter isolate

isolate(tab) reçoit une intention de split

Le modèle :

    crée un container

    Mosaic :

        décide s’il l’affiche ou non

👉 Séparation nette :
modèle = vérité, layout = projection.
Phase 5 — Retour d’un tab détaché

UI pour afficher workspace.detached[]

Bouton Retour

Retour = openPanel(detached.kind, detached.payload)

Aucun souvenir de position (assumé)

