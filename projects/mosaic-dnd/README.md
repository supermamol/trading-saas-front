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


| Action      | Test UI ?  | Pourquoi                    |
| ----------- | ---------  | --------------------------- |
| close       | ✅         | geste local, visible        |
| detach      | ✅         | geste local, visible        |
| isolate     | ✅         | geste spatial, intentionnel |
| **rattach** | ❌         | orchestration métier        |



        intégrer Mosaic
        ✅ OUI, ensuite seulement

| Event Mosaic       | Sens            | Action             |
| ------------------ | --------------- | ------------------ |
| `onChange(layout)` | géométrie       | stocker layout     |
| `onRemove(nodeId)` | fermer un panel | `close(container)` |
| drag container     | réorganiser     | Mosaic only        |
| detach             | ❌              | **hors Mosaic**    |


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

________________________________________________________________

DETACH / RATTACH
""""""""""""""""

Mode des fenêtres détachées

    2 modes UI uniquement :

        partagé (par défaut, Mosaic standard)

        full screen

    Le passage de l’un à l’autre :

        ❌ ne modifie PAS le workspace métier

        ❌ ne touche PAS Detached[]

        ✅ est purement UI

🔹 Bouton X (toujours visible)

    Visible :

        en mode partagé

        en mode full screen

    Une seule sémantique :

    X = RATTACH

Donc :

    pas de “Close destructif”

    pas de bouton “Rattach” séparé

    fermer la fenêtre = rattacher le tab

🔁 Cycle de vie final d’un tab (figé)
Detach

    Tab retiré de son container

    Tab ajouté à Detached[]

    Fenêtre créée (mode partagé)

Full screen

    Toggle UI uniquement

X (Close)

    Tab retiré de Detached[]

    Tab réinséré via la règle globale existante :

        onglet sur 1ʳᵉ occurrence du type

        sinon zone liée au type

    Fenêtre supprimée

👉 Aucune exception, aucun cas spécial.
🧠 Conséquence clé (très importante)

    ❌ Il n’existe plus de notion de :

        “fermer un tab détaché”

        “perdre un tab”

    ✅ Un tab détaché est toujours récupérable

    ✅ Detached[] est un état transitoire, jamais terminal

C’est un très bon choix produit.
🔧 Ce que ça implique pour le code (sans encore coder)

À partir de maintenant, il faudra :

    Detached[]

        contenir au minimum :

            tab

            éventuellement originContainerId (si utile plus tard)

        ❌ aucune info de layout / fullscreen

    Une fonction métier claire

        detachTab(workspace, tab)

        rattachTab(workspace, tab)
        → qui appelle la logique standard d’ajout de panel

    La fenêtre détachée

        est une projection UI

        disparaît dès que Detached[] n’inclut plus le tab

_____________________________________________________________________

SYNTHESE APPLICATIVE
""""""""""""""""""""

┌──────────────────────────────┐
│           UI (React)         │
│  Mosaic / Tabs / Boutons / X │
└──────────────▲───────────────┘
               │ intentions UI
┌──────────────┴───────────────┐
│    Orchestration UI → Métier │
│  (WorkspaceDnDProvider, UI)  │
└──────────────▲───────────────┘
               │ transitions atomiques
┌──────────────┴───────────────┐
│       Modèle Métier          │
│  Workspace / Container / Tab │
└──────────────▲───────────────┘
               │ invariants
┌──────────────┴───────────────┐
│        Tests & Debug         │
│  Vitest + Debug Views        │
└──────────────────────────────┘

🧠 Vue d’ensemble — principe global

sequenceDiagram
    participant U as Utilisateur
    participant UI as UI (TabView / ContainerView)
    participant O as Orchestration UI
    participant M as Modèle Métier
    participant S as State React (workspace)

    U->>UI: Action utilisateur (click / drag)
    UI->>O: Intention (close / detach / drop)
    O->>M: Appel fonction métier pure
    M-->>O: Nouveau Workspace
    O->>S: setWorkspace(next)
    S-->>UI: Re-render

👉 Message clé :

    L’UI n’envoie jamais un “résultat”, seulement une intention.

1️⃣ Séquence — Close tab (tab rattaché)
🎯 Cas : clic sur ✕ dans un container Mosaic

sequenceDiagram
    participant U as Utilisateur
    participant Tab as TabView
    participant C as ContainerView
    participant M as workspace.ts
    participant R as React State

    U->>Tab: Click ✕
    Tab->>C: onClose(tabId)
    C->>M: closeTab(workspace, tabId)

    alt container.tabs.length > 1
        M-->>C: Workspace (tab retiré)
    else container.tabs.length == 1
        M-->>C: Workspace (container supprimé)
    end

    C->>R: setWorkspace(next)
    R-->>Tab: Re-render

✅ Décision métier centrale
✅ UI totalement agnostique du cas
2️⃣ Séquence — Detach via bouton (flux officiel)
🎯 Cas : clic sur Detach (Tab → fenêtre détachée)

sequenceDiagram
    participant U as Utilisateur
    participant Tab as TabView
    participant C as ContainerView
    participant P as workspace.panels.ts
    participant M as workspace.ts
    participant R as React State

    U->>Tab: Click Detach
    Tab->>C: onDetach(tab)
    C->>P: detachPanel(workspace, tab)

    P->>M: findContainerByTab
    alt container.tabs.length > 1
        P->>M: isolateTab
        P->>P: supprimer container isolé
    else container.tabs.length == 1
        P->>M: closeTab
    end

    P-->>C: { workspace: next, detached }
    C->>R: setWorkspace(next)

👉 Point crucial :

    le DetachedPanel sort du workspace

    aucune UI Mosaic n’est impliquée

    Mosaic ne “voit” que le workspace restant

3️⃣ Séquence — Drag & Drop (raccourci expert)
🎯 Cas : tab déplacé par DnD (dnd-kit)

sequenceDiagram
    participant U as Utilisateur
    participant D as dnd-kit
    participant P as WorkspaceDnDProvider
    participant DND as model/dnd.ts
    participant M as workspace.ts
    participant R as React State

    U->>D: Drag tab
    D->>P: onDragStart
    P->>P: setActiveTab (overlay)

    U->>D: Drop
    D->>P: onDragEnd(active, over)

    alt drop sur container
        P->>DND: handleTabDrop(header)
        DND->>M: moveTabToContainer
    else drop outside
        P->>DND: handleTabDrop(outside)
        DND->>M: isolateTab / closeTab
    end

    M-->>P: Workspace next
    P->>R: setWorkspace(next)

🟡 Pourquoi legacy contrôlé :

    ce flux ne définit plus le produit

    il n’est qu’un outil de manipulation

4️⃣ Séquence — Rattach (futur, décision A)
🎯 Cas : clic ✕ sur une fenêtre détachée

sequenceDiagram
    participant U as Utilisateur
    participant W as Fenêtre détachée
    participant P as workspace.panels.ts
    participant M as workspace.ts
    participant R as React State

    U->>W: Click ✕ (Rattach)
    W->>P: openPanel(kind, context)
    P->>M: pushTab / création container
    M-->>P: Workspace next
    P->>R: setWorkspace(next)

👉 Aucune restauration de layout
👉 Règles identiques à “ouvrir un panel”
🧾 Synthèse finale (à garder)
🧠 Règle d’or illustrée

    L’UI déclenche → le modèle décide → l’UI reflète

📌 Où vit chaque décision
Décision	Fichier
Close tab	workspace.ts
Detach / Rattach	workspace.panels.ts
DnD	model/dnd.ts
Layout	WorkspaceMosaicView.tsx


__________________________________________________________________


Isolate par DnD vers zone de split :

sequenceDiagram
    participant U as Utilisateur
    participant T as TabView
    participant D as dnd-kit
    participant P as WorkspaceDnDProvider
    participant Z as SplitDropZone
    participant W as workspace.panels.ts
    participant M as workspace.ts
    participant R as React State
    participant MO as Mosaic

    %% Drag start
    U->>T: Drag Tab
    T->>D: dragStart
    D->>P: onDragStart(tabId, sourceContainerId)
    P->>P: setActiveTab (overlay)

    %% Hover over split zones
    D->>Z: dragOver(splitZone)
    Z-->>U: feedback visuel (highlight)

    %% Drop
    U->>D: Drop sur split zone
    D->>P: onDragEnd(active, over)

    %% Intention explicite
    P->>W: detachToSplit(workspace, tabId, splitTarget)

    %% Métier
    W->>M: findContainerByTab(tabId)
    alt source.container.tabs.length > 1
        W->>M: removeTab(source, tabId)
    else source.container.tabs.length == 1
        W->>M: closeTab(source)
    end

    %% Création du nouveau container
    W->>W: createContainerWithTab(tab)
    W-->>P: { workspace: nextWorkspace, newContainerId }

    %% Mise à jour état
    P->>R: setWorkspace(nextWorkspace)

    %% Mise à jour layout Mosaic
    R-->>MO: re-render
    MO->>MO: insert container at splitTarget


| Effet                | Mot autorisé |
| -------------------- | ------------ |
| Changer de container | `move`       |
| Nouveau pane Mosaic  | `isolate`    |
| Nouvelle fenêtre OS  | `detach`     |


ISOLATE :

Cas 1 — source > 1 tab
C1: [A, B]
isolate A
→ C1: [B]
→ Cx: [A]

Cas 2 — source = 1 tab
C1: [A]
isolate A
→ C1 supprimé
→ Cx: [A]

Quand source = 1 tab :

    Mosaic va :

        supprimer un node

        en ajouter un autre

    visuellement :

        le panel “bouge”

        mais l’utilisateur voit le même contenu

_______________________________________________________________________

PROCHAINES ACTIONS:
""""""""""""""""""

🗺️ FEUILLE DE ROUTE VALIDÉE

🧱 PHASE 0 — Socle déjà en place (OK)

(rien à faire, juste pour contexte)

    Container = pile LIFO de tabs

    Tab actif = tabs[tabs.length - 1]

    Helpers pushTab / removeTab / activateTab

    Décisions UX figées (tablist ligne, header interne, grip, etc.)

👉 On part sur une base saine.
🧩 PHASE 1 — Extraire la Tablist (UI propre)

👉 Prochaine action immédiate
🎯 Objectif

Isoler clairement le CU “Sélection d’un tab” dans un composant dédié.
À faire

    Créer ui/TablistView.tsx

    Responsabilités :

        afficher les tabs en ligne

        identifier le tab actif (dernier de la pile)

        gérer le onClick(tabId) → sélection

Signature cible

<TablistView
  tabs={container.tabs}
  onSelectTab={(tabId) => activateTab(containerId, tabId)}
/>

Livrable

    ContainerView simplifié

    logique de sélection centralisée

    UX lisible

❌ Pas de DnD
❌ Pas de Detach / Close
🖱️ PHASE 2 — CU Sélection d’un tab (métier + UI)

(s’appuie directement sur Phase 1)
🎯 Objectif

Finaliser le cas d’usage manquant que tu as très bien identifié.
À faire

    Côté modèle :

        utiliser activateTab(container, tabId)

    Côté UI :

        click onglet → appel activation

        tab actif remonte visuellement à droite

Livrable

    sélection fluide

    pile LIFO visible et compréhensible

    invariant respecté partout

🧱 PHASE 3 — Header du tab actif

(UI, pas de métier)
🎯 Objectif

Créer la zone d’action unique du tab actif.
À faire

Dans le contenu du tab actif :

    Header avec :

        grip (zone drag)

        bouton Detach

        bouton Close

    Visible uniquement pour le tab actif

Livrable

    séparation nette :

        tablist = navigation

        header = actions

❌ Les boutons peuvent être branchés “à vide”
🔀 PHASE 4 — Move Tab (métier pur)

(indépendant de l’UI)
🎯 Objectif

Implémenter le déplacement entre containers compatibles.
À faire

    moveTab(workspace, tabId, targetContainerId)

    règles :

        compatibilité de type

        removeTab source

        pushTab target

        suppression container source si vide

Livrable

    tests métier verts

    aucun code UI encore

🖱️ PHASE 5 — DnD branché sur le grip

(UI → métier)
🎯 Objectif

Permettre le Move uniquement depuis le tab actif.
À faire

    activer le drag sur le grip du header

    drop → appel moveTab

    la tablist reste passive

Livrable

    DnD clair, non ambigu

    UX alignée avec le modèle

✂️ PHASE 6 — Detach

(métier + UI)
🎯 Objectif

Isoler un tab actif dans son propre container.
À faire

    detachTab :

        removeTab source

        création nouveau container mono‑tab

    bouton Detach → appel métier

🔁 PHASE 7 — Rattach

(finalisation)
🎯 Objectif

Retour automatique d’un tab vers un container compatible.
À faire

    ignorer toute cible UI

    chercher container compatible

    sinon créer nouveau container

    pushTab + focus

🎨 PHASE 8 — Polish UI (plus tard)

    overflow tablist

    scroll horizontal

    styles finaux

    accessibilité

______________________________________________________________________


🧭 Résumé ultra‑court

Ordre recommandé (et validé) :

    ✅ TablistView

    ✅ CU Sélection d’un tab

    ✅ Header du tab actif

    🔀 Move Tab (métier)

    🖱️ DnD sur le grip

    ✂️ Detach

    🔁 Rattach

    🎨 Polish

===================================================================
commit 2cf6040efd4342bcef1460d41a3f8d674d8a6ea5 (HEAD -> mosaic-phase-2, origin/mosaic-phase-2)
Author: Serge Helly <sergio@localhost-live.home>
Date:   Tue Jan 20 21:59:24 2026 +0100
-------------------------------------------------------------------

Un petit point d'étape sur le front :

ok- move (dnd) container -> drop zone : ok (Mosaic)

ok- close container : visuel ok mais workspace inchangé

ok- présentation tablist + boutons action tab actif dans la même ligne : ok

ok- tabs dans la tablist : affichage ok avec xor (drag/select)

ok- select tab : ok (tab devient actif et ordre des tabs dans la tablist inchangé)

ok- scroll vertical dans content tab : ok

ok- drag tab (cas plusieurs tabs) -> container : dnd, visuel et workspace ok 

ok- drag tab (cas tab seul) -> container : dnd, visuel et workspace ok 

ok- close tab (cas plusieurs tabs) : visuel et workspace ok

ok- close tab (cas tab seul) : visuel et workspace ok

- isolation tab actif (dnd tab --> zone drop du même container) : à faire

ok- création nouveau tab (tab de même type existe) : à faire (mise en onglet)

ok- création nouveau tab (tab de même type absent) : à faire (insertion selon zonage)

- restriction des regroupements des tabs (en tablist) suivant le type: à faire
ok --> pour MOVE
ok --> pour CREATE

- detach tab actif (ouverture dans nouvelle fenetre à part) : à faire (bouton prêt)

- rattach tab (depuis fenetre à part) : à faire (après detach)

===================================================================


OK: Close container → workspace + prune ✅

    Règles regroupement + openPanel (même type / absent) ✅

    Isolate via 4 zones (DnD complet) ✅

    Detach / Rattach (fenêtres) ✅

    Tests + invariants + polish ✅

===================================================================

| ----------------------------------- | ---------------------- | ---------------------- | ------------- | --------------------------- | -------------------- | --------------------- |
| Action utilisateur                  | Intention conceptuelle | Effet métier principal | Crée un panel | Réutilise un panel existant | Modifie `detached[]` | Passe par `openPanel` |
| ----------------------------------- | ---------------------- | ---------------------- | ------------- | --------------------------- | -------------------- | --------------------- |
| **Drag tab → autre container**      | MOVE                   | `moveTab`              | ❌            | ✅ (tab existant)           | ❌                   | ❌                    |
| **Drag tab → split même container** | ISOLATE                | `isolateTab`           | ❌            | ✅ (tab existant)           | ❌                   | ❌                    |
| **Click ↗ Detach**                  | DETACH                 | `detachPanel`          | ❌            | ✅ (tab existant)           | ➕ ajoute            | ❌                    |
| **Fenêtre externe → Rattach**       | RATTACH                | `openPanel`            | ❌            | ✅ (panel détaché)          | ➖ supprime          | ✅                    |
| **Click “New panel”**               | CREATE                 | `openPanel`            | ✅            | ❌                          | ❌                   | ✅                    |
| ----------------------------------- | ---------------------- | ---------------------- | ------------- | --------------------------- | -------------------- | --------------------- |


OK ---> detached[] ajouté au workspace

| CU      | Crée tab | Utilise règles de regroupement | Modifie `detached[]` | Appel clé    |
| ------- | -------- | ------------------------------ | -------------------- | ------------ |
| MOVE    | ❌       | ✅                             | ❌                   | `canGroup`   |
| CREATE  | ✅       | ✅                             | ❌                   | `openPanel`  |
| ISOLATE | ❌       | ➖ *(implicite, split)*        | ❌                   | `isolateTab` |
| DETACH  | ❌       | ❌                             | ➕                   | `detachTab`  |
| RATTACH | ❌       | ✅                             | ➖                   | `openPanel`  |



✅ Règle validée
1️⃣ CREATE = regroupement fort

    kind + payload (ex: strategyId)

    CREATE exprime une intention métier

    « Je veux ouvrir ce type précis de panel, dans ce contexte précis »

    Donc le regroupement doit être strict

    👉 GroupKey = { kind, payload }

C’est exactement ce que fait openPanel aujourd’hui ✔️
(et tes tests CREATE le confirment)
2️⃣ MOVE = regroupement faible

    kind uniquement

    MOVE exprime une intention utilisateur

    « Je décide manuellement de ranger ce tab ici »

    Le contexte (payload) est secondaire

    👉 seule contrainte : homogénéité visuelle & fonctionnelle

    Donc :

canGroup(tab, container) => tab.kind === container.tabs[0].kind

C’est cohérent avec :

    le DnD visuel

    la logique de “post-création”

    les use cases réels (ex: comparer deux charts de stratégies différentes)


--------------------------------------------------------

Comportement CREATE 
"""""""""""""""""""

Quand tu fais openPanel(kind, payload, direction), tu choisis un seul container cible selon cette priorité :

    Container “pur” exact
    → tous les tabs du container ont exactement le même (kind + payload) que le nouveau tab.
    ✅ meilleur match, stable, pas d’effet de bord.

    Container “contient” exact
    → le container a au moins un tab avec le même (kind + payload).
    ✅ tu renforces un cluster existant, même si le container est “pollué”.

    Container “contient kind”
    → le container a au moins un tab de même kind (payload différent).
    ✅ fallback “rassemblement manuel post-MOVE”, cohérent avec votre philosophie.

    Sinon
    → Nouveau container et placement explicite relatif à fromContainerId, selon "direction"

------------------------------------------------------------

2️⃣ Règle de regroupement (prioritaire)

Quand on fait CREATE :

    🔍 On cherche un container compatible (affinité décroissante) :

        même kind + même contexte → priorité

        sinon même kind

    ✅ Si trouvé
    → on push le tab dans ce container
    → PAS de nouveau container
    → PAS de modification du layout

    ❌ Si aucun container compatible
    → on crée un nouveau container

👉 Cette règle est indépendante de la direction
👉 La direction ne sert que si un nouveau container est créé
3️⃣ Règle de placement (UI uniquement)

Si un nouveau container est créé :

    la direction est traduite en placement Mosaic :
| Direction  | Effet visuel                 |
| ---------- | ---------------------------- |
| `"left"`   | nouveau container à gauche   |
| `"right"`  | nouveau container à droite   |
| `"top"`    | nouveau container au-dessus  |
| `"bottom"` | nouveau container en dessous |


