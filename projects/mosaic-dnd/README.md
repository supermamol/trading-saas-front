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



