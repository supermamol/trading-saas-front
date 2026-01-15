# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
_____________________________________________________________________________________________

✅ Checklist d’architecture cible — Système de panels métier
0️⃣ Principes fondateurs (non négociables)

    ☐ Le layout n’est pas le métier

    ☐ Le métier pilote le layout, jamais l’inverse

    ☐ Aucune dépendance métier à une lib de layout

    ☐ Tout état important est sérialisable

    ☐ Aucune magie opaque (DOM impératif, API cachée)

1️⃣ Couches de l’architecture (séparation stricte)
1.1 Modèle métier (source de vérité)

    ☐ Modèle PanelGraph ou équivalent (pur JS/TS)

    ☐ Indépendant de React, Mosaic, DOM

    ☐ Testable sans UI

    ☐ Exprime :

        panels logiques

        groupes (onglets)

        zones

        règles métier

👉 C’est la vérité du système
1.2 Orchestration UI

    ☐ Traduit le modèle métier → état UI

    ☐ Décide :

        plein écran

        focus

        ouverture / fermeture

        regroupement en tabs

    ☐ Ne manipule jamais le DOM directement

1.3 Moteur de layout (React Mosaic)

    ☐ Gère uniquement :

        splits

        resize

        zones spatiales

    ☐ Ne connaît :

        ni les types de panels

        ni les règles métier

    ☐ Remplaçable sans casser le métier

1.4 Panels UI

    ☐ Composants React simples

    ☐ Ne connaissent PAS le layout global

    ☐ Reçoivent leur contexte métier en props

    ☐ Peuvent être remplacés par Web Components plus tard

2️⃣ Identité et typologie des panels

    ☐ Chaque panel a une identité métier stable

    panelKey = "chart:S1"

    ☐ Séparation claire :

        type (chart, run, strategyDetail, …)

        contexte (strategyId)

        instance (Nb si nécessaire)

    ☐ Aucune dépendance à un componentId technique

3️⃣ Zones et organisation spatiale

    ☐ Nombre de zones non figé

    ☐ Les zones sont :

        des conteneurs logiques

        projetées via Mosaic

    ☐ Une zone peut contenir :

        un panel unique

        ou un groupe d’onglets

4️⃣ Onglets (tabs métier)

    ☐ Les onglets sont un concept métier

    ☐ Implémentés au-dessus du layout

    ☐ Règles explicites :

        quels panels peuvent être tabulés ensemble

        unicité ou multiplicité

    ☐ Les tabs ne modifient jamais le layout Mosaic

5️⃣ Plein écran (fullscreen)

    ☐ Le plein écran est logique, pas graphique

    ☐ Implémenté par :

        un changement du PanelGraph

        ou un layout simplifié (1 panel)

    ☐ Le layout précédent est conservé (restaurable)

    ☐ Le bouton natif “Expand” de Mosaic n’est PAS utilisé

6️⃣ Interactions entre panels

    ☐ Les panels communiquent via :

        intents

        événements métier

    ☐ Aucun panel ne référence un autre panel directement

    ☐ Exemples d’intents :

        openChart

        focusRun

        showDetails

7️⃣ Drag’n Drop (sémantique)

    ☐ Le D&D ne déplace PAS des panels

    ☐ Le D&D transporte :

        une intention métier

    ☐ Le panel source :

        reste inchangé

    ☐ Le panel cible :

        accepte / refuse

        déclenche une action métier

    ☐ Aucune interaction D&D avec Mosaic

8️⃣ UX & contrôles

    ☐ Les contrôles natifs Mosaic sont :

        désactivés ou ignorés

    ☐ Chaque panel définit sa toolbar métier

    ☐ Les icônes sont :

        explicites

        alignées avec le vocabulaire métier

    ☐ Aucune action ambiguë (“expand” flou, etc.)

9️⃣ État & persistance

    ☐ Le PanelGraph est sérialisable (JSON)

    ☐ Possibilité de :

        sauvegarder

        restaurer

        versionner l’état UI

    ☐ Aucune dépendance à l’état interne d’une lib

🔟 Évolutivité / sécurité future

    ☐ Possibilité de remplacer React Mosaic

    ☐ Possibilité d’introduire :

        Web Components

        micro-frontends

    ☐ Le métier reste inchangé


______________________________________________________________________________

🧭 Plan d’implémentation par itérations

(React + React Mosaic + moteur métier de panels)
🟢 Itération 0 — Socle technique (VALIDÉE)

🎯 Objectif : terrain stable

✅ Déjà fait chez toi :

    React 18 + Vite

    React Mosaic fonctionnel

    CSS global propre (body non-flex)

    Layout de base fluide

👉 Sortie :

    “Le layout est une projection d’état React”

🟢 Itération 1 — Modèle métier minimal (PanelGraph v0)

🎯 Objectif : introduire le métier sans UI complexe
À implémenter

    Un modèle métier pur TS, ex :

type PanelKind = "strategies" | "strategyDetail" | "chart";

type Panel = {
  panelKey: string;        // ex: chart:S1
  kind: PanelKind;
  strategyId?: string;
};

    Un état central :

type PanelState = {
  openPanels: Panel[];
};

    Des actions métier simples :

openPanel(panel: Panel)
closePanel(panelKey: string)

À NE PAS faire

    Pas de tabs

    Pas de drag’n drop

    Pas de fullscreen

👉 Sortie :

    le métier existe

    le layout s’adapte à partir de cet état

🟢 Itération 2 — Projection PanelGraph → Mosaic

🎯 Objectif : prouver que le layout est dérivé du métier
À implémenter

    Une fonction pure :

panelStateToMosaic(state: PanelState): MosaicNode

    Règle simple, par exemple :

        1 panel → plein écran

        2 panels → split row

        3 panels → row + column

À NE PAS faire

    Pas de logique UX

    Pas de boutons avancés

👉 Sortie :

    “Changer le métier change le layout, sans code Mosaic impératif”

🟢 Itération 3 — Onglets métier (TabGroup v1)

🎯 Objectif : panels de même type regroupés
À implémenter

    Un composant générique :

<TabGroup
  tabs={Panel[]}
  activeTab={panelKey}
  onSelect={panelKey}
/>

    Règle métier claire :

        chart:S1:* → même TabGroup

        run:S1:* → même TabGroup

À NE PAS faire

    Pas encore de drag’n drop

    Pas encore de fullscreen

👉 Sortie :

    les onglets existent

    totalement indépendants de Mosaic

🟢 Itération 4 — Fullscreen métier

🎯 Objectif : vrai plein écran, contrôlé
À implémenter

    Un état métier :

fullscreenPanelKey?: string;

    Règle :

        si fullscreenPanelKey défini → MosaicNode = ce panel seul

        sinon → layout normal

À NE PAS faire

    Ne pas utiliser le bouton Expand natif

    Pas de CSS fullscreen bricolé

👉 Sortie :

    “Le fullscreen est une décision métier réversible”

🟢 Itération 5 — Toolbar métier des panels

🎯 Objectif : UX claire, compréhensible
À implémenter

    Désactiver les contrôles Mosaic :

<MosaicWindow toolbarControls={[]} />

    Ajouter une toolbar métier :

        ⛶ Plein écran

        ✕ Fermer

        📌 Autres actions métier

À NE PAS faire

    Pas de logique layout directe dans les panels

👉 Sortie :

    UX maîtrisée

    icônes explicites

    aucune ambiguïté utilisateur

🟢 Itération 6 — Drag’n Drop sémantique (Intent D&D)

🎯 Objectif : interaction riche entre panels
À implémenter

    Drag d’un intent :

{
  action: "open-chart",
  strategyId: "S1",
  chartType: "price"
}

    Drop dans un panel cible :

        validation métier

        déclenchement d’action (nouvel onglet, focus, etc.)

À NE PAS faire

    Ne jamais déplacer un panel Mosaic

    Ne jamais modifier le layout directement

👉 Sortie :

    “Le D&D déclenche des comportements métier, pas des mutations UI”

🟢 Itération 7 — Persistance & restauration

🎯 Objectif : robustesse long terme
À implémenter

    Sérialisation du PanelGraph :

JSON.stringify(panelState)

    Restauration au reload

    Versionnement léger si besoin

👉 Sortie :

    sessions restaurables

    base pour multi-workspaces

🏁 Vision finale

À la fin :

    Mosaic = moteur spatial

    Panels = UI métier

    Tabs = logique métier

    Fullscreen = état métier

    D&D = intents métier

    Le layout est remplaçable

👉 Tu peux changer Mosaic sans tout casser.
👉 Tu peux enrichir le métier sans toucher au layout.

_______________________________________________________________________

1 panel Strategies
Pour chaque stratégie :
  StrategyDetail : 1
  Chart : 0..n
  Run : 0..n
  Nodered : 1  (et nous attribuerons un flow Nodered vide à chaque nouvelle stratégie)

| PanelKind        | Cardinalité | Portée        |
| ---------------- | ----------- | ------------- |
| `strategies`     | 1           | globale       |
| `strategyDetail` | 1           | par stratégie |
| `nodered`        | 1           | par stratégie |
| `chart`          | 0..n        | par stratégie |
| `run`            | 0..n        | par stratégie |


Règle de layout :

1. Au  début : 
- 1 panel "Strategies"

2. Click sur une stratégie (dans Strategies):
- 1 panel "nodered" (en haut)
- 1 panel "Strategies" (en bas, à gauche)
- 1 panel "strategyDetail" (en bas, à droite) 

3a. Click sur un lien chart (dans strategyDetail) :
- 1 panel "nodered" (en haut, à gauche)
- 1 panel "Strategies" (en bas, à gauche)
- 1 panel "Chart" (en haut, à droite)
- 1 panel "strategyDetail" (en bas, à droite) 

3b. Click sur un lien run (dans strategyDetail) :
- 1 panel "nodered" (en haut, à gauche)
- 1 panel "Strategies" (en bas, à gauche)
- 1 panel "strategyDetail" (en haut, à droite) 
- 1 panel "Run" (en bas, à droite)

4. quand tous les panels sont présents : (Chart et Run ouverts)
- 1 panel "nodered" (en haut, à gauche)
- 1 panel "Strategies" (en bas, à gauche)
- 1 panel "Chart" (en haut, à droite)
- 1 panel "strategyDetail" (au centre, à droite) 
- 1 panel "Run" (en bas, à droite)

Par ailleurs (en vue de l'itération 3)
- les panels d'un même type (ex: chart:S1) se rangent en onglet


________________________________________________________________________


🔒 Invariant 3 — Règles par type (rappel validé)

| Kind           | Groupé  | Onglets       | Détachable  |
| -------------- | ------- | ------------- | ----------- |
| strategies     | ❌      | ❌            | ❌          |
| strategyDetail | ✅      | 1 / stratégie | ✅          |
| chart          | ✅      | stratégie:nb  | ✅          |
| run            | ✅      | stratégie:nb  | ✅          |
| nodered        | ✅      | 1 / stratégie | ✅          |


🧭 PLAN D’ACTION POUR LA SUITE
🟩 ÉTAT ACTUEL (point de départ)
✅ Étape 5 — TERMINÉE

    5.1 : workspace Mosaic persistant

    5.2 : insertion automatique des panels
    ➡️ On n’y touche plus

Ce socle est bon, sain, et nécessaire.
🟦 BLOC 1 — ÉTAPE 6 : UX DES ONGLETS (PRIORITAIRE)

👉 Tout ce que tu as soulevé récemment (onglet actif, pile, detach, d&d) est ici.
🔹 6.1 — Modèle d’onglets par pile (OBLIGATOIRE)
Objectif

Avoir un comportement prévisible et logique des onglets.
Règles formelles

    ouverture d’un panel → il devient actif

    fermeture d’un panel non actif → aucun changement

    fermeture de l’actif → retour au précédent (pile)

    jamais d’onglet “fantôme”

Livrable

    remplacement de activeTabs par activeStacks

    helpers clairs (push, remove, getActive)

    aucun impact Mosaic

Validation

    Scénario :
    Ouvre 1 → 2 → 3
    Ferme 2 → actif = 3
    Ferme 3 → actif = 1

🔹 6.2 — Cohérence attach / detach
Objectif

Attach et detach ne cassent jamais la navigation.
Règles

    detach :

        retire le panel de la pile

        choisit le bon onglet actif

    attach :

        réinsère dans la pile

        devient actif

Validation

    aucun group vide incohérent

    jamais “plus rien d’actif” alors qu’il reste des onglets

🔹 6.2.bis — Étape intermédiaire : Généralisation

Objectif :

    appliquer exactement les mêmes règles
    à tous les groups, sans changer l’UX globale.

Concrètement :

    Identifier le groupKind naturel d’un panel

        strategyDetail:* → strategyDetail

        chart:* → chart

        run:* → run

        nodered:* → nodered

    Rendre Attach / Detach générique

        plus de logique codée en dur sur strategyDetail

        même code, groupKind variable

    Ne pas encore toucher au layout métier

        ça, c’est 6.3

🔹 6.3 — UX explicite (SANS drag & drop)
Objectif

Permettre à l’utilisateur de rattacher proprement un panel.
Moyens

    bouton “Rattacher à StrategyDetail”

    ou menu contextuel

👉 Pas de D&D ici (volontairement)
Validation

    on peut toujours revenir à un état cohérent sans geste complexe

👉 À la fin de l’étape 6 :

    les onglets sont solides

    la navigation est intuitive

    Mosaic est juste un conteneur

🟨 BLOC 2 — ÉTAPE 7 : LAYOUT MÉTIER GUIDÉ (CE QUE TU AS DÉCRIT)

👉 Le layout précis que tu as formalisé (nodered en haut gauche, strategies bas gauche, etc.) n’appartient PAS au workspace libre.

On l’assume comme un autre mode.
🔹 7.1 — Formalisation des règles (SANS CODE)
Objectif

Écrire noir sur blanc les règles de placement.

Exemple :

    nodered → toujours haut gauche

    strategies → toujours bas gauche

    chart → haut droite

    run → bas droite

    strategyDetail :

        bas droite si seul

        centre droite si chart + run

👉 On valide les règles AVANT de coder
🔹 7.2 — Projection “dashboard”
Objectif

Un layout calculé, déterministe, piloté par le modèle.
Caractéristiques

    pas de drag structurel

    layout recalculé à chaque changement métier

    Mosaic utilisé comme moteur de rendu

🔹 7.3 — Choix du mode

Deux options possibles (à décider) :

    soit dashboard uniquement

    soit double mode :

        Workspace libre (étape 5)

        Dashboard métier (étape 7)

🟪 BLOC 3 — OPTIONNEL / BONUS

À faire uniquement si utile :

    drag & drop vers onglets (UX pure)

    sauvegarde du workspace

    layouts personnalisés par utilisateur

🧠 SYNTHÈSE ULTRA-COURTE

    Étape 5 : terminée ✅

    Étape 6 : onglets solides (pile, attach/detach) ⏭️ prochaine

    Étape 7 : layout métier guidé (celui que tu veux)

    Drag & drop = bonus, pas fondation


_____________________________________________________________________________

T O D O        T O D O        T O D O        T O D O        T O D O        
_____________________________________________________________________________


✅ Déjà fait / solidement en place

On peut les considérer acquis :
Architecture & modèle

    PanelGraph comme source de vérité

    Projection panelGraph → tiles → layout

    Layout métier déterministe (6.3)

    Groupes homogènes, pas de groupes à 1 onglet

    Externalisation des panels (StrategyDetail OK)

    Séparation claire :

        structure (layout)

        contenu métier

        interactions futures

UX structurelle

    Onglets par groupKind

    Activation d’onglet correcte

    Attach / Detach compris comme transitoires

    Décision claire : Detach = DnD only (plus tard)

👉 Très bon socle.
🔜 À FAIRE AVANT LE DnD (POC “propre”)

Ces points sont fortement recommandés avant d’attaquer le DnD, sinon tu vas empiler des dettes.
1️⃣ Finaliser proprement le layout métier (6.3 final)
À faire

Geler définitivement buildBusinessLayout

Vérifier tous les scénarios listés (tu les as très bien formalisés)

    Ajuster éventuellement :

        proportions gauche / droite

        proportions verticales à droite (chart / detail / run)

👉 Objectif : plus aucun débat sur le layout pendant le DnD.
2️⃣ Clarifier le statut des boutons Attach / Detach

Ils sont aujourd’hui :

    utiles pour tester

    mais conceptuellement faux à terme

À faire

Décider :

    soit on les garde temporairement (flag __DEV__)

    soit on les retire du POC UI

    S’assurer que rien de critique ne dépend d’eux

👉 Le DnD doit arriver dans un terrain propre.
3️⃣ Externaliser les autres panels (symétrie)

Pour éviter des traitements “à part” plus tard.
À faire

ChartPanel

RunPanel

NoderedPanel

    (optionnel) StrategiesPanel

👉 Même si le contenu est minimal, la structure doit être prête.
4️⃣ Stabiliser le modèle métier des panels

Avant DnD, il faut être sûr de ces points :
À vérifier / figer

Un panel a toujours un panelKey stable

Un group est déduit, jamais stocké

Aucune logique métier ne dépend du layout

    panelGraphToTiles est pure et memoïsé (déjà fait)

👉 Sinon le DnD va exposer les failles.
5️⃣ Décider ce que le POC NE fait PAS

Très important pour ne pas dériver.

À acter explicitement :

pas de persistence du layout

pas de restauration session

pas de resize sophistiqué

pas de raccourcis clavier

    pas d’undo / redo

👉 Le DnD sera fonctionnel, pas “produit fini”.
🟡 OPTIONNEL (mais utiles selon ton objectif)
6️⃣ Mode “layout verrouillé / libre” (UX bonus)

Même sans DnD complet :

détecter un onChange Mosaic

geler le recalcul automatique

    bouton “Reset layout métier”

👉 Très pédagogique pour les reviewers.
7️⃣ Préparer le terrain du DnD (sans l’implémenter)

Avant de coder le DnD, tu peux déjà :

définir les types TS :

DragSource
DropTarget
DropIntent

écrire computeDropIntent(...) (sans UI)

    tester les règles sur des objets mock

👉 Le DnD devient alors une plomberie UI, pas un chantier métier.
🧭 Vision synthèse (important)

Pour un POC crédible, il faut que :

    le layout + le modèle soient irréprochables avant d’ajouter le DnD

Sinon :

    le DnD masquera des défauts

    ou les rendra impossibles à corriger ensuite

✅ Checklist POC minimale (si on devait trancher)

Si tu veux un POC “clean” rapidement, je dirais :

    ✔️ Layout métier figé

    ✔️ Panels externalisés

    ✔️ Attach/Detach neutralisés ou assumés

    ✔️ Modèle PanelGraph stable

    ➜ ensuite seulement : DnD


__________________________________________________________________________

🔍 Les 3 types d’événements layout
1️⃣ Événements métier

    openStrategies

    openStrategyDetail

    openChart / openRun / openNodered

👉 Le layout doit être dérivé du modèle
👉 buildBusinessLayout(...)
2️⃣ Événements utilisateur structurants

    detach tab

    attach tab

    fermeture / création explicite de fenêtres

👉 Le layout devient piloté par l’utilisateur
👉 on ne doit plus jamais le recalculer automatiquement
3️⃣ Événements utilisateur géométriques

    resize

    drag

    splitPercentage change

    rearrange Mosaic

👉 Ce ne sont PAS des décisions métier
👉 Ça ne doit JAMAIS réactiver l’auto‑layout

____________________________________________________________________


