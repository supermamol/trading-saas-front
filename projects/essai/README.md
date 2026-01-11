Panels – MCD (Modèle Conceptuel de Données)

Ce document décrit le modèle conceptuel des panels de l’application.
Il s’agit d’un modèle métier, indépendant de toute considération de layout ou de framework UI.

    Golden Layout est une vue.
    Le MCD décrit le “quoi”, pas le “où”.

1. Principes généraux

    Un panel représente une intention métier, pas un composant technique.

    Les panels sont :

        ouvrables

        fermables

        recréables

    Le layout est une projection (dock / stack / split).

    La persistance repose sur :

        un snapshot métier

        des relations explicites entre panels et entités métier

2. Typologie des panels
Panel	Type	Cardinalité
Strategies	Liste	Singleton
StrategyDetail	Détail	Multiple
Node‑RED	Éditeur	Multiple contrôlé
Chart	Visualisation	Multiple
Run	Exécution	Multiple
3. MCD – Relations entre panels

USER
  1
  │
  │ ouvre
  │
  1
STRATEGIES (panel – singleton)
  │
  └── 1 ─── n STRATEGY_DETAIL (panel – multi)
               (create / open strategy)
               │
               ├── 1 ─── 0..1 NODERED (panel – multi contrôlé)
               │            (define my strategy)
               │
               ├── 1 ─── 0..n RUN (panel – multi)
               │            (run this strategy / open run)
               │
               └── 1 ─── 0..n CHART (panel – multi)
                            (new chart)
                            (persisté en base, lié à la strategy)

4. Description détaillée des panels
4.1 Strategies (panel)

    Singleton

    Liste des stratégies

    Point d’entrée vers StrategyDetail

    Ne crée pas directement de Charts ni de Runs

4.2 StrategyDetail (panel)

    Multiple

    Lié à une Strategy

    Panel pivot du modèle

Depuis StrategyDetail, l’utilisateur peut :

    définir la stratégie (Node‑RED)

    créer / ouvrir des Charts

    lancer / ouvrir des Runs

4.3 Node‑RED (panel)

    Multiple contrôlé

    1 Node‑RED maximum par Strategy

    Ouvert depuis StrategyDetail via “Define my strategy”

    Usage plein écran

    Outil d’édition, pas un état permanent du workspace

Clé métier :

Node‑RED(strategyId)

4.4 Chart (panel)

    Multiple

    Toujours lié à une Strategy en base

    Instancié exclusivement depuis StrategyDetail

    Persisté / restaurable depuis le backend

Exemples d’usage :

    création d’un nouveau chart

    ouverture d’un chart existant

    plusieurs charts simultanés pour une même stratégie

4.5 Run (panel)

    Multiple

    Lié à une Strategy

    Représente une exécution (en cours ou terminée)

    Peut être ouvert / rouvert indépendamment

5. Règles métier globales
Singleton

    Strategies

Multiple

    StrategyDetail

    Chart

    Run

    Node‑RED (avec contrainte métier)

Contraintes spécifiques

    1 Node‑RED par Strategy

    Les Charts ne sont jamais globaux

    Toute ouverture d’un panel multi :

        l’ajoute à la suite

        ne remplace jamais un panel existant

6. Séparation modèle / vue

    Le MCD ne dépend pas du layout

    Golden Layout :

        ne porte aucune règle métier

        ne fait qu’afficher les panels

    Les règles d’unicité et d’ouverture sont évaluées avant la projection UI

7. Résumé

    Le MCD décrit les relations métier entre panels

    StrategyDetail est le contexte central

    Node‑RED, Chart et Run sont des vues métier liées à une stratégie

    Le layout est libre, jetable et reconstructible
