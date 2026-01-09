🔄 Synchronisation UI & Invalidation des entités

Cette application front adopte un pattern volontairement simple et robuste pour synchroniser les vues UI avec l’état réel du backend.
🎯 Principe général

    Le backend est la seule source de vérité.
    Les vues UI ne maintiennent pas d’état métier partagé ou dérivé complexe.

Toute mutation métier (Create / Update / Delete / Action) entraîne une invalidation des vues concernées, qui se resynchronisent explicitement depuis l’API.

Ce mécanisme s’applique de manière homogène à toutes les entités :

    Strategies

    Runs

    Jobs

    (et toute entité future)

🧱 Séparation claire des responsabilités
Vues List (ex : Strategies, Runs)

    affichent une collection

    effectuent uniquement :

        Create

        Read

        Delete

    sont considérées comme des caches invalidables

    ne conservent jamais d’état métier “maître”

Vues Detail (ex : StrategyDetail, RunDetail)

    affichent et modifient une entité précise

    effectuent les mutations métier (U, actions, lifecycle)

    n’essaient jamais de mettre à jour les listes directement

📡 Mécanisme d’invalidation générique

Lorsqu’une mutation métier est effectuée avec succès (rename, changement de statut, paramètres, etc.), la vue Detail émet un événement global d’invalidation :

document.dispatchEvent(
  new CustomEvent("entity-changed", {
    detail: {
      type: "strategy", // ou "run", "job", etc.
      id: "alpha"       // optionnel, informatif
    }
  })
);

👉 L’événement ne décrit pas la mutation
👉 Il indique simplement que l’état connu peut être obsolète
🔁 Réaction des vues List

Les vues List écoutent cet événement et se resynchronisent depuis l’API :

document.addEventListener("entity-changed", e => {
  if (e.detail.type === "strategy") {
    this.load(); // re-fetch depuis le backend
  }
});

    aucune mise à jour locale optimiste

    aucune propagation fine de champs

    aucune dépendance entre composants

✅ Avantages de ce pattern

    ✔ backend = source de vérité unique

    ✔ pas d’état partagé fragile côté front

    ✔ prêt multi‑utilisateur

    ✔ prêt websocket / SSE / polling

    ✔ évite les incohérences UI

    ✔ extensible à toutes les entités (Runs, Jobs, etc.)

    ✔ facile à raisonner et à maintenir

Ce pattern s’apparente à une invalidation de cache UI, volontairement générique, inspirée de pratiques éprouvées (CQRS, architectures distribuées).
🧭 Règle d’architecture à respecter

    Les vues Detail mutent.
    Les vues List se resynchronisent.
    La communication se fait par invalidation, jamais par synchronisation fine.




🧭 Architecture Charts / Datasources / Runs
(Synthèse fonctionnelle & MCD)
1. Contexte et objectifs

Le système vise à permettre :

    l’exécution de Runs (issus d’AST)

    la production de résultats de backtests

    leur visualisation flexible dans un ou plusieurs charts

    la comparaison, l’exploration et la sauvegarde de vues

Contraintes clés :

    plusieurs runs simultanés

    plusieurs backtests par run

    plusieurs charts ouverts en parallèle

    liberté totale d’affichage (drag & drop)

    aucune destruction implicite de données

2. Principes fondamentaux
2.1 Séparation stricte des responsabilités
Élément	Rôle
AST	Logique de stratégie (hors temps, hors UI)
Run	Exécution d’un AST sur un contexte (tickers, range)
Backtest	Résultat calculé d’un run
Datasource	Courbe affichable (abstraction visuelle)
Chart	Vue de visualisation persistable

👉 Le chart ne calcule rien
👉 Le run ne décide rien de l’affichage
3. Datasource (nouvelle entité clé)
3.1 Définition

    Une Datasource représente une série de données affichable sur un chart.

Elle peut correspondre à :

    un backtest (résultat d’un run)

    une série de marché (ticker)

    plus tard : indicateur, equity curve, overlay, etc.

3.2 Propriétés essentielles

    immuable

    indépendante de tout chart

    référençable par plusieurs charts

    jamais “consommée” ou déplacée

3.3 Rattachement à l’existant

AST
 └── Run
      └── Backtest
           └── Datasource

Chaque backtest génère une datasource unique.
4. Chart (nouvelle entité)
4.1 Définition

    Un Chart est un conteneur de visualisation, ouvrable, fermable et sauvegardable.

Un chart :

    ne contient pas les données

    référence des datasources

    maintient son propre état d’affichage

4.2 Propriétés typiques

    timeframe

    range temporel de référence

    liste locale de datasources affichées

    styles (couleurs, ordre, visibilité)

5. Ventilation (concept central)
5.1 Définition

    La ventilation consiste à associer explicitement une datasource à un chart.

Concrètement :

    Drag & drop d’une datasource → le chart l’ajoute

    Suppression depuis un chart → la datasource est retirée localement

    Fermeture d’un chart → aucune datasource n’est affectée

👉 La ventilation est locale au chart, pas globale.
6. Modèle d’interaction (UX)
6.1 Scénario standard

    Des Runs sont exécutés

    Des backtests (B1…B5) sont produits

    Les backtests apparaissent comme objets manipulables

    L’utilisateur ouvre un ou plusieurs charts (vides)

    Il drag & drop B1, B3, etc. dans les charts de son choix

    Les courbes apparaissent immédiatement

6.2 Règles UX actées

    Une datasource peut être affichée :

        dans plusieurs charts

        ou dans aucun

    Droppée deux fois dans le même chart → ignorée silencieusement

    Suppression d’une datasource depuis un chart → locale

    Fermeture d’un chart → totalement transparente

👉 Le drag & drop est une intention explicite
👉 Aucune règle automatique ne s’applique dans ce cas
7. Gestion des tickers et des ranges

    Les datasources peuvent être basées sur :

        des tickers différents

        des ranges temporels différents

    Cela peut compliquer l’affichage → c’est un choix utilisateur

    Le système :

        n’interdit pas

        ne corrige pas

        ne “devine” pas

👉 Lisibilité par défaut, liberté par intention.
8. Sauvegarde des charts
8.1 Principe

    Sauvegarder un chart = sauvegarder une vue, pas des données.

Un chart sauvegardé mémorise :

    son range

    son timeframe

    la liste des datasources affichées

    leurs styles

8.2 Objectifs

    restaurer une analyse

    comparer des vues

    effectuer des recherches croisées

    partager une configuration (plus tard)

Les datasources référencées :

    peuvent exister ou non au moment de la restauration

    ne sont jamais dupliquées

9. Modèle conceptuel de données (MCD)
Entités introduites

Chart
Datasource

Relation clé (N–N)

Chart —< ChartDatasource >— Datasource

ChartDatasource représente :

    la présence d’une datasource dans un chart

    avec ses paramètres visuels (couleur, visibilité, ordre)

10. Règles d’or (à conserver)

    Une datasource n’appartient jamais à un chart

    Un chart ne calcule jamais de données

    L’affichage est toujours explicite

    La suppression est toujours locale

    La fermeture est toujours non destructive

    La sauvegarde concerne la vue, pas les résultats

11. Résumé exécutif

    Le système repose sur une séparation claire entre
    calcul (AST / Run / Backtest) et visualisation (Chart / Datasource).

    Les charts sont des vues autonomes, manipulables et persistables,
    tandis que les datasources sont des objets immuables, partageables
    et indépendants de toute logique d’affichage.


    ____________________________________________



1️⃣ Nature de la Datasource (origine des données)

    « un ensemble de données issu d’un run jusqu’à un node backtest
    ou bien un ticker impliqué dans un run »

👉 Oui, totalement juste.

On peut formuler la règle ainsi :

    Une Datasource est :

        soit le résultat d’un calcul (backtest, equity, indicateur…) produit par un Run

        soit une source de marché (ticker) utilisée par un Run

Autrement dit :

    le Run est producteur

    la Datasource est un artefact produit, exploitable par l’UI

👉 Important :
La Datasource n’exécute rien et ne connaît pas la logique (AST, Node‑RED).
Elle porte uniquement le résultat et les métadonnées nécessaires à l’affichage.
2️⃣ Représentation graphique / UX

    « graphiquement, c'est un bouton qui pourra être D&D dans un chart
    et un graphique sur un chart (qui peut aussi être retiré du chart) »

👉 Parfaitement aligné avec le contrat technique.

La Datasource a donc deux incarnations UI, cohérentes entre elles :
🟦 Hors chart (exploration)

    un bouton / item dans :

        le panel Runs

        le panel Datasources (si tu l’isoles plus tard)

    draggable

    toujours disponible (jamais “consommé”)

📈 Dans un chart

    une courbe / série / markers

    ajoutée par D&D

    supprimable localement

    duplicable dans plusieurs charts

👉 C’est exactement ce qu’on a acté :

    Datasource immuable, affichage local et réversible

3️⃣ Entité persistée en base

    « c'est aussi une entité référencée en base, en relation avec un Run »

👉 Oui, et c’est même essentiel.

Relation claire :

    Un Run :

        peut produire N Datasources

    Une Datasource :

        est produite par un Run

        peut être affichée dans 0..N Charts

En MCD (simplifié) :

Run 1 ────< Datasource >──── 0..N Chart

👉 Cette persistance permet :

    retrouver les résultats

    sauvegarder des charts

    faire des recherches croisées

    rejouer / comparer des vues

4️⃣ Couleur unique et cohérente (point très important)

    « possède une couleur identique dans l'éditeur Nodered,
    dans le panel Runs et pour le graphe affiché dans le chart »

👉 Excellent choix UX, et je te confirme :
👉 la couleur doit appartenir à la Datasource, pas au Chart.

Pourquoi ?

    cohérence visuelle immédiate

    reconnaissance cognitive (“ah, le vert c’est B3”)

    pas de recalcul mental quand on change de vue

    continuité Node‑RED → Runs → Charts

Règle recommandée

    La Datasource possède une couleur canonique

    Le Chart :

        l’utilise par défaut

        peut éventuellement la surcharger localement (optionnel, plus tard)

5️⃣ Conclusion : définition “officielle” de Datasource

    Datasource

    Une Datasource représente un ensemble de données affichable, produit par l’exécution d’un Run.

    Elle peut correspondre :

        à un résultat de backtest (courbe, trades, equity…)

        ou à une source de marché (ticker) impliquée dans un Run.

    Une Datasource :

        est immuable

        est référencée en base

        est liée à un Run

        possède une identité visuelle propre (couleur)

        peut être manipulée graphiquement (drag & drop)

        peut être affichée dans plusieurs charts

        peut être retirée localement d’un chart sans impact global

    Elle constitue l’unité fondamentale de visualisation entre le moteur de calcul (AST / Run) et l’interface graphique (Charts).



