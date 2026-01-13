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




🔹 Panels métier définitifs

    Strategies

        unique

        seul panel affiché au chargement

        point d’entrée du workflow

    StrategyDetail

        unique

        ouvert suite à clic sur une stratégie

        lié implicitement à la stratégie courante

    Chart:<strategyId>

        un panel par stratégie

        ouvert au‑dessus de strategyDetail

    Run:<strategyId>

        un panel par stratégie

        ouvert en dessous de strategyDetail

    NodeRed:<strategyId>

        lié à une stratégie

        pas affiché au chargement

        ouvert explicitement pour une stratégie donnée



Règle “ajout en onglet” (ta règle exacte)

Quand on ouvre un panel et qu’on doit l’ajouter en onglet, on ne cherche pas une stack ni une position, on cherche un panel d’ancrage (le “premier panel trouvé” qui matche) :

    si on ouvre un strategyDetail
    ➜ on l’ajoute au premier panel existant de type strategyDetail (peu importe l’id)

    si on ouvre un chart pour strategyId = Sx
    ➜ on l’ajoute au premier panel existant qui matche type=chart et strategyId=Sx

    si on ouvre un run pour strategyId = Sx
    ➜ on l’ajoute au premier panel existant qui matche type=run et strategyId=Sx


| Concept métier    | Panel ?  | panelKey            | componentId              |
| ----------------- | -------- | ------------------- | ------------------------ |
| Strategies        | ✅       | `strategies`        | `strategies:main`        |
| StrategyDetail S1 | ✅       | `strategyDetail:S1` | `strategyDetail:S1:main` |
| Chart S1 (panel)  | ✅       | `chart:S1`          | —                        |
| Chart S1 – tab 1  | ❌       | —                   | `chart:S1:1`             |
| Chart S1 – tab 2  | ❌       | —                   | `chart:S1:2`             |
| Run S1 (panel)    | ✅       | `run:S1`            | —                        |
| Run S1 – tab A    | ❌       | —                   | `run:S1:A`               |
| NodeRed S1        | ✅       | `nodered:S1`        | `nodered:S1:main`        |



