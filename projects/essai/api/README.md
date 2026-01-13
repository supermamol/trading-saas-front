Voici une proposition structurée, cohérente et complète des fonctions que votre API métier de layout pourrait (et devrait) exposer, au-dessus de Golden Layout v2 (Genesis).

L’objectif n’est pas d’exposer toute la puissance de GLv2, mais de fournir une surface API stable, expressive et testable, alignée avec les opérations formalisées que nous avons définies.

1. Principe de conception (avant la liste)

Avant de lister des fonctions, posons 3 règles non négociables :

Aucune fonction exposée ne manipule row, column, stack

Chaque fonction exprime une intention métier

Toute fonction est traduisible en une ou plusieurs opérations formelles

👉 L’API est déclarative, pas structurelle.

2. Catégories de fonctions exposées

Une API saine se découpe naturellement en 6 familles :

Initialisation & cycle de vie

Navigation / focus

Ouverture spatiale (splits)

Gestion des onglets (tabs)

Fermeture & nettoyage

Persistance & inspection

3. Initialisation & cycle de vie
3.1 Chargement initial
init(layoutDescriptor?: InitialLayout): void


Exemples :

layout.init(['editor', 'terminal']);
layout.init({ preset: 'ide' });

3.2 Reset / rechargement
reset(): void
restore(snapshot: LayoutSnapshot): void

4. Navigation & focus

Ces fonctions ne modifient pas l’arbre, seulement l’état actif.

focus(componentId: ComponentId): void
activateTab(componentId: ComponentId): void


Optionnel :

ensureVisible(componentId: ComponentId): void

5. Ouverture spatiale (splits)

C’est le cœur de l’API.

5.1 Ouverture directionnelle
openLeft(target: TargetRef, component: ComponentId, options?)
openRight(target: TargetRef, component: ComponentId, options?)
openTop(target: TargetRef, component: ComponentId, options?)
openBottom(target: TargetRef, component: ComponentId, options?)


Exemples :

openLeft('editor', 'files');
openBottom('editor', 'console', { size: 0.3 });
openRight('center', 'inspector');

5.2 Ouverture dans une zone logique
openIn(zone: ZoneRef, component: ComponentId, options?)


Exemples :

openIn('left', 'files');
openIn('bottom', 'terminal');


(les zones sont résolues par votre API)

6. Gestion des onglets (tabs)
6.1 Ajouter un onglet
addTab(target: TargetRef, component: ComponentId, options?)


Exemples :

addTab('console', 'log');
addTab('editor', 'diff', { activate: true });

6.2 Déplacer un onglet
moveTab(component: ComponentId, target: TargetRef): void

6.3 Réordonner les onglets
reorderTab(component: ComponentId, index: number): void

7. Fermeture & nettoyage
7.1 Fermer un composant
close(component: ComponentId): void

7.2 Fermer un panel (stack entier)
closePanel(target: TargetRef): void


(implique suppression de tous les components du stack)

7.3 Nettoyage global
normalize(): void


supprime les stacks vides

fusionne rows/columns unitaires

garantit une forme canonique

8. Inspection & requêtes (lecture seule)

Ces fonctions sont essentielles pour le raisonnement.

exists(componentId: ComponentId): boolean
isOpen(componentId: ComponentId): boolean
getLocation(componentId: ComponentId): LocationDescriptor


Exemple :

getLocation('console');
// → { zone: 'center', position: 'bottom', tabIndex: 1 }

9. Persistance & historique
save(): LayoutSnapshot
load(snapshot: LayoutSnapshot): void


Option avancée :

undo(): void
redo(): void

10. Événements (facultatif mais puissant)
on(event: LayoutEvent, handler)


Exemples :

on('opened', ({ component, location }) => { … })
on('closed', ({ component }) => { … })
on('changed', (diff) => { … })

11. Vue synthétique (API complète)

Voici l’API exposée minimale mais suffisante :

interface LayoutAPI {
  init(layout?: InitialLayout): void;

  openLeft(target, component, options?);
  openRight(target, component, options?);
  openTop(target, component, options?);
  openBottom(target, component, options?);

  openIn(zone, component, options?);

  addTab(target, component, options?);
  moveTab(component, target);
  reorderTab(component, index);

  focus(component);
  activateTab(component);

  close(component);
  closePanel(target);

  save(): LayoutSnapshot;
  load(snapshot: LayoutSnapshot);

  normalize(): void;

  exists(component): boolean;
  getLocation(component): LocationDescriptor;
}

12. Ce que cette API permet (très important)

Avec ces seules fonctions, vous pouvez :

✔ reproduire toutes les interactions Golden Layout

✔ implémenter menus, raccourcis, drag & drop

✔ écrire des tests unitaires sur le layout

✔ changer Golden Layout sans changer l’API

✔ raisonner en intentions, pas en structure

13. Phrase clé de conclusion

Golden Layout manipule des arbres.
Votre API manipule des intentions.

Si cette séparation est respectée, votre architecture est saine.



14. API métier au-dessus de Golden Layout v2 (Genesis) :

surface API : openLeft/right/top/bottom, openIn, addTab, close, closePanel, focus, save/load, normalize, exists

résolution robuste des cibles (TargetRef : componentId / panelId / zoneId / near / panelOf)

gestion des pièges GLv2 : encapsulation automatique en stack, impossibilité de splitter un stack, idempotence, nettoyage

transmission de paramètres via componentState, plus options runtime (activate, focus, ifExists, size…)

Ci-dessous : un fichier TypeScript unique (layout-api.ts) que vous pouvez copier-coller.
Il ne dépend que de @genesis-community/golden-layout.

Hypothèse raisonnable : vous enregistrez vos composants GL par componentType (ex: "editor:main", "files:explorer", etc.). Si vous préférez mapper componentId -> componentType, c’est trivial.



15. Comment utiliser cette API

1) Création
import { GoldenLayout } from "@genesis-community/golden-layout";
import { createLayoutAPI } from "./layout-api";

const gl = new GoldenLayout(document.getElementById("layout")!);
// registerComponentConstructor(...) etc.
gl.loadLayout(/* layout initial */);

const layout = createLayoutAPI(gl, {
  titles: {
    "editor:main": "Editor",
    "terminal:shell": "Terminal",
    "files:explorer": "Files",
    "console:output": "Console",
    "console:log": "Log",
    "inspector:props": "Inspector",
    "help:docs": "Help",
  }
});

2) Votre séquence (exemple 1)
// état initial déjà chargé: editor + terminal

layout.openLeft("editor:main", "files:explorer");
layout.openBottom("editor:main", "console:output");
layout.openRight("center", "inspector:props");
layout.addTab("console:output", "console:log");
layout.addTab("inspector:props", "help:docs");
