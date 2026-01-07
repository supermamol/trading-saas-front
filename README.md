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
