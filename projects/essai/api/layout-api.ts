/* layout-api.ts
 * API métier au-dessus de @genesis-community/golden-layout (GLv2 Genesis)
 *
 * Points clés:
 * - Ne manipule jamais le DOM : uniquement ContentItems + containers GL
 * - Split = row/column uniquement (jamais stack)
 * - Un "panel" métier correspond à un stack GL
 */

import type { GoldenLayout } from "@genesis-community/golden-layout";

/** -----------------------------
 *  Types publics (API métier)
 *  ----------------------------- */

export type ComponentId = string; // ex: "editor:main"
export type PanelId = string;     // ex: "panel:left"
export type ZoneId = "left" | "center" | "right" | "top" | "bottom";
export type LayoutId = string;

export type TargetRef =
  | ComponentId
  | PanelId
  | ZoneId
  | { near: ComponentId }      // "près de"
  | { panelOf: ComponentId };  // "le panel qui contient"

export type IfExistsPolicy = "ignore" | "focus" | "activate" | "replace";

export interface OpenOptions {
  /** fraction [0..1] ou pixels; appliqué selon votre stratégie (voir note) */
  size?: number;
  /** état sérialisable du component (componentState GL) */
  state?: Record<string, unknown>;
  /** sélectionner l’onglet créé */
  activate?: boolean;
  /** focus visuel (implémentation dépend des hooks GL disponibles) */
  focus?: boolean;
  /** que faire si le composant existe déjà */
  ifExists?: IfExistsPolicy;
  /** titre affiché dans l’onglet */
  title?: string;
}

export interface AddTabOptions {
  state?: Record<string, unknown>;
  activate?: boolean;
  focus?: boolean;
  ifExists?: IfExistsPolicy;
  title?: string;
}

export interface SaveSnapshot {
  // GoldenLayout v2 retourne un layout config sérialisable
  layout: unknown;
  // métadonnées éventuelles
  meta?: Record<string, unknown>;
}

export interface LayoutAPI {
  openLeft(target: TargetRef, component: ComponentId, options?: OpenOptions): void;
  openRight(target: TargetRef, component: ComponentId, options?: OpenOptions): void;
  openTop(target: TargetRef, component: ComponentId, options?: OpenOptions): void;
  openBottom(target: TargetRef, component: ComponentId, options?: OpenOptions): void;

  openIn(zone: ZoneId, component: ComponentId, options?: OpenOptions): void;

  addTab(target: TargetRef, component: ComponentId, options?: AddTabOptions): void;

  close(component: ComponentId): void;
  closePanel(target: TargetRef): void;

  focus(component: ComponentId): void;

  exists(component: ComponentId): boolean;

  save(meta?: Record<string, unknown>): SaveSnapshot;
  load(snapshot: SaveSnapshot): void;

  normalize(): void;
}

/** -----------------------------
 *  Types internes (GL)
 *  ----------------------------- */

/**
 * GLv2 ContentItems: on garde "any" ici car les types officiels varient selon versions/bundlers.
 * On s’appuie sur des propriétés stables: type, parent, contentItems, componentType, addChild/removeChild.
 */
type ContentItem = any;

/** -----------------------------
 *  Implémentation
 *  ----------------------------- */

export interface CreateLayoutApiOptions {
  /** mapping zone -> panelId/heuristique de résolution */
  zones?: Partial<Record<ZoneId, PanelId>>;
  /** mapping componentId -> title par défaut */
  titles?: Partial<Record<ComponentId, string>>;
}

export function createLayoutAPI(gl: GoldenLayout, opts: CreateLayoutApiOptions = {}): LayoutAPI {
  const zones = opts.zones ?? {
    left: "panel:left",
    center: "panel:center",
    right: "panel:right",
    top: "panel:top",
    bottom: "panel:bottom",
  };

  /** -----------------------------
   *  Utilitaires de parcours
   *  ----------------------------- */

  function* walk(item: ContentItem | undefined): Generator<ContentItem> {
    if (!item) return;
    yield item;
    const children: ContentItem[] | undefined = item.contentItems;
    if (Array.isArray(children)) {
      for (const c of children) yield* walk(c);
    }
  }

  function rootItem(): ContentItem | undefined {
    return (gl as any).rootItem; // GLv2 Genesis expose rootItem
  }

  function findFirst(predicate: (i: ContentItem) => boolean): ContentItem | undefined {
    const r = rootItem();
    for (const i of walk(r)) {
      if (predicate(i)) return i;
    }
    return undefined;
  }

  function findAll(predicate: (i: ContentItem) => boolean): ContentItem[] {
    const r = rootItem();
    const out: ContentItem[] = [];
    for (const i of walk(r)) if (predicate(i)) out.push(i);
    return out;
  }

  /** -----------------------------
   *  Résolution: component / stack / split parent
   *  ----------------------------- */

  function isStack(i: ContentItem) { return i?.type === "stack"; }
  function isRow(i: ContentItem) { return i?.type === "row"; }
  function isColumn(i: ContentItem) { return i?.type === "column"; }
  function isComponent(i: ContentItem) { return i?.type === "component"; }
  function isSplit(i: ContentItem) { return isRow(i) || isColumn(i); }

  /** trouve le component item correspondant à componentType === componentId */
  function findComponentItem(componentId: ComponentId): ContentItem | undefined {
    return findFirst(i => isComponent(i) && i.componentType === componentId);
  }

  /** retourne le stack qui contient ce component */
  function stackOfComponent(componentId: ComponentId): ContentItem | undefined {
    const comp = findComponentItem(componentId);
    if (!comp) return undefined;
    const parent = comp.parent;
    if (isStack(parent)) return parent;
    // Normalement vrai en GLv2, mais on garde un fallback
    let cur = parent;
    while (cur && !isStack(cur)) cur = cur.parent;
    return cur;
  }

  /** cherche un stack "porteur" via PanelId (heuristique: stack.id ou config.id ou itemId) */
  function findStackByPanelId(panelId: PanelId): ContentItem | undefined {
    // stratégie simple: on stocke panelId dans l'id du stack (si vous le faites),
    // sinon fallback: premier stack.
    const direct = findFirst(i => isStack(i) && (i.id === panelId || i.config?.id === panelId));
    return direct ?? findFirst(i => isStack(i));
  }

  /** remonte au premier parent split (row/column) */
  function splitParent(item: ContentItem): ContentItem | undefined {
    let cur = item?.parent;
    while (cur && !isSplit(cur)) cur = cur.parent;
    return cur;
  }

  /** remonte jusqu’au parent qui N’EST PAS un stack (utile si on part d’un component) */
  function nonStackParent(item: ContentItem): ContentItem | undefined {
    let cur = item?.parent;
    while (cur && isStack(cur)) cur = cur.parent;
    return cur;
  }

  /** Résout TargetRef -> stack */
  function resolveTargetToStack(target: TargetRef): ContentItem | undefined {
    if (typeof target === "string") {
      // ZoneId ?
      if (target === "left" || target === "center" || target === "right" || target === "top" || target === "bottom") {
        return findStackByPanelId(zones[target]);
      }
      // PanelId ?
      if (target.startsWith("panel:")) {
        return findStackByPanelId(target);
      }
      // sinon ComponentId
      return stackOfComponent(target);
    }
    if ("near" in target) return stackOfComponent(target.near);
    if ("panelOf" in target) return stackOfComponent(target.panelOf);
    return undefined;
  }

  /** -----------------------------
   *  Création de configs component
   *  ----------------------------- */

  function defaultTitle(componentId: ComponentId): string {
    return opts.titles?.[componentId] ?? componentId;
  }

  function componentConfig(componentId: ComponentId, options?: { state?: any; title?: string }) {
    return {
      type: "component",
      componentType: componentId,
      title: options?.title ?? defaultTitle(componentId),
      componentState: options?.state ?? undefined,
    };
  }

  /** -----------------------------
   *  Idempotence / existence
   *  ----------------------------- */

  function exists(componentId: ComponentId): boolean {
    return !!findComponentItem(componentId);
  }

  function handleIfExists(componentId: ComponentId, policy: IfExistsPolicy | undefined): boolean {
    if (!exists(componentId)) return false;

    switch (policy ?? "focus") {
      case "ignore":
        return true;
      case "focus":
      case "activate":
        focus(componentId);
        return true;
      case "replace":
        // replace = fermer puis ré-ouvrir; l’appelant poursuit
        close(componentId);
        return false;
      default:
        return true;
    }
  }

  /** -----------------------------
   *  Opérations: tabs
   *  ----------------------------- */

  function addTab(target: TargetRef, componentId: ComponentId, options: AddTabOptions = {}): void {
    if (handleIfExists(componentId, options.ifExists)) return;

    const stack = resolveTargetToStack(target);
    if (!stack) throw new Error(`addTab: target not found: ${String(target)}`);

    // stack.addChild accepte un component config
    stack.addChild(componentConfig(componentId, { state: options.state, title: options.title }));

    if (options.activate ?? true) {
      focus(componentId);
    }
  }

  /** -----------------------------
   *  Opérations: splits (openLeft/right/top/bottom)
   *  ----------------------------- */

  /**
   * Split directionnel: on split un "panel" (= stack) cible.
   * Pour left/right -> row ; top/bottom -> column.
   */
  function openDirectional(
    dir: "left" | "right" | "top" | "bottom",
    target: TargetRef,
    componentId: ComponentId,
    options: OpenOptions = {}
  ): void {
    if (handleIfExists(componentId, options.ifExists)) return;

    const targetStack = resolveTargetToStack(target);
    if (!targetStack) throw new Error(`open${dir}: target not found: ${String(target)}`);

    const wantRow = dir === "left" || dir === "right";
    const wantedContainerType: "row" | "column" = wantRow ? "row" : "column";

    // Le stack cible est enfant d’un split (row/column) ou du root; sinon, on l'encapsule.
    let parent = splitParent(targetStack);
    if (!parent) {
      // parent split introuvable: cas root=stack ou structure atypique
      parent = nonStackParent(targetStack);
    }

    // Si le parent n'est pas du type voulu, on encapsule le stack cible dans un container du type voulu.
    // Encapsulation locale: remplacer targetStack par row(targetStack) ou column(targetStack).
    if (!parent || parent.type !== wantedContainerType) {
      wrapStackInContainer(targetStack, wantedContainerType);
      parent = splitParent(targetStack) ?? nonStackParent(targetStack);
    }

    if (!parent || parent.type !== wantedContainerType) {
      throw new Error(`open${dir}: cannot obtain a ${wantedContainerType} parent`);
    }

    // Ajouter le nouveau composant comme sibling du stack cible au bon index dans le parent
    const siblings: ContentItem[] = parent.contentItems ?? [];
    const idx = siblings.indexOf(targetStack);

    const insertIndex =
      dir === "left" || dir === "top"
        ? idx
        : idx + 1;

    parent.addChild(componentConfig(componentId, { state: options.state, title: options.title }), insertIndex);

    // NOTE taille: GL gère tailles via config/resize; l’API expose "size" mais l’application de size dépend de GL.
    // Vous pourrez appliquer size en jouant sur les "size" dans config enfant si votre build le supporte.
    // Ici on reste compatible et neutre.

    if (options.activate ?? true) {
      focus(componentId);
    }

    // Nettoyage structurel optionnel
    normalizeUpwards(parent);
  }

  /**
   * Encapsule un stack dans un container row/column au même emplacement dans son parent.
   * Transformation: parent(..., stack, ...) => parent(..., container(stack), ...)
   */
  function wrapStackInContainer(stack: ContentItem, containerType: "row" | "column"): ContentItem {
    const p = stack.parent;
    if (!p) {
      // si pas de parent (root stack), on ne gère pas ici; à traiter via loadLayout initial
      throw new Error(`wrap: stack has no parent`);
    }
    const siblings: ContentItem[] = p.contentItems ?? [];
    const index = siblings.indexOf(stack);

    // Retirer sans détruire
    p.removeChild(stack, true);

    // Ajouter le container au même index
    const container = p.addChild({ type: containerType }, index);

    // Réinsérer le stack dedans
    container.addChild(stack, 0);

    return container;
  }

  /** -----------------------------
   *  Opérations: fermeture
   *  ----------------------------- */

  function close(componentId: ComponentId): void {
    const comp = findComponentItem(componentId);
    if (!comp) return;

    const stack = comp.parent;
    if (!stack || !isStack(stack)) {
      // fallback: tenter de remonter à un stack
      const s = stackOfComponent(componentId);
      if (!s) return;
      // retrouver comp dans s
    }

    // removeChild(child, keepChild?) : keepChild=false => détruit
    stack.removeChild(comp, false);

    // Si stack vide, le retirer
    if (!Array.isArray(stack.contentItems) || stack.contentItems.length === 0) {
      const sp = stack.parent;
      if (sp) sp.removeChild(stack, false);
      if (sp) normalizeUpwards(sp);
    } else {
      normalizeUpwards(stack);
    }
  }

  function closePanel(target: TargetRef): void {
    const stack = resolveTargetToStack(target);
    if (!stack) return;

    // Ferme tous les components du stack
    const items: ContentItem[] = [...(stack.contentItems ?? [])];
    for (const c of items) stack.removeChild(c, false);

    // retirer le stack lui-même
    const p = stack.parent;
    if (p) p.removeChild(stack, false);
    if (p) normalizeUpwards(p);
  }

  /** -----------------------------
   *  Focus (best-effort)
   *  ----------------------------- */

  function focus(componentId: ComponentId): void {
    const comp = findComponentItem(componentId);
    if (!comp) return;

    const stack = comp.parent;
    if (stack && isStack(stack)) {
      // v2 expose souvent setActiveContentItem / setActiveComponentItem selon builds
      if (typeof stack.setActiveContentItem === "function") {
        stack.setActiveContentItem(comp);
      } else if (typeof stack.setActiveComponentItem === "function") {
        stack.setActiveComponentItem(comp);
      }
    }

    // Certains builds exposent comp.container.focus()
    try {
      const container = comp.container;
      if (container?.focus) container.focus();
    } catch {
      // best-effort: ignorer
    }
  }

  /** -----------------------------
   *  Persistance
   *  ----------------------------- */

  function save(meta?: Record<string, unknown>): SaveSnapshot {
    const layout = (gl as any).saveLayout();
    return { layout, meta };
  }

  function load(snapshot: SaveSnapshot): void {
    (gl as any).loadLayout(snapshot.layout);
  }

  /** -----------------------------
   *  Normalisation / nettoyage
   *  ----------------------------- */

  function normalize(): void {
    const r = rootItem();
    if (!r) return;
    normalizeNode(r);
  }

  function normalizeUpwards(from: ContentItem): void {
    let cur: ContentItem | undefined = from;
    // normaliser quelques niveaux vers le haut
    for (let i = 0; i < 8 && cur; i++) {
      normalizeNode(cur);
      cur = cur.parent;
    }
  }

  /**
   * Règles simples et sûres:
   * - row/column avec 0 enfant => supprimer
   * - row/column avec 1 enfant => remplacer par l’enfant
   * - row/column imbriqué du même type => fusion (flatten)
   * - stack vide => supprimer
   */
  function normalizeNode(node: ContentItem): void {
    if (!node) return;

    if (isStack(node)) {
      const kids = node.contentItems ?? [];
      if (kids.length === 0) {
        const p = node.parent;
        if (p) p.removeChild(node, false);
      }
      return;
    }

    if (isRow(node) || isColumn(node)) {
      const kids: ContentItem[] = node.contentItems ?? [];

      // supprimer conteneur vide (sauf root)
      if (kids.length === 0 && node.parent) {
        node.parent.removeChild(node, false);
        return;
      }

      // remplacer conteneur unitaire
      if (kids.length === 1 && node.parent) {
        const only = kids[0];
        const p = node.parent;
        const idx = (p.contentItems ?? []).indexOf(node);

        node.removeChild(only, true);
        p.removeChild(node, false);
        p.addChild(only, idx);
        return;
      }

      // fusionner conteneurs du même type
      for (let k = 0; k < kids.length; k++) {
        const child = kids[k];
        if (child && child.type === node.type) {
          // Flatten: remonter les enfants du child dans node à la place
          const grandKids: ContentItem[] = [...(child.contentItems ?? [])];

          // retirer le child (en gardant ses enfants)
          node.removeChild(child, true);

          // insérer ses enfants à la position k
          for (let j = 0; j < grandKids.length; j++) {
            child.removeChild(grandKids[j], true);
            node.addChild(grandKids[j], k + j);
          }

          // détruire le conteneur child vide
          if (child.parent) {
            // si child a encore un parent, le retirer
            child.parent.removeChild(child, false);
          }
        }
      }
    }
  }

  /** -----------------------------
   *  Exposition API
   *  ----------------------------- */

  return {
    openLeft: (t, c, o) => openDirectional("left", t, c, o),
    openRight: (t, c, o) => openDirectional("right", t, c, o),
    openTop: (t, c, o) => openDirectional("top", t, c, o),
    openBottom: (t, c, o) => openDirectional("bottom", t, c, o),

    openIn: (zone, c, o) => {
      // stratégie simple: ouvrir "dans une zone" = ouvrir comme tab si zone existe,
      // sinon créer via split depuis center.
      const stack = resolveTargetToStack(zone);
      if (stack) {
        addTab(zone, c, o);
        return;
      }
      // fallback: splitter depuis center
      const center = resolveTargetToStack("center");
      if (!center) throw new Error(`openIn: center not found`);
      // décider la direction selon zone
      if (zone === "left") openDirectional("left", { near: center.contentItems?.[0]?.componentType ?? "center" }, c, o);
      else if (zone === "right") openDirectional("right", { near: center.contentItems?.[0]?.componentType ?? "center" }, c, o);
      else if (zone === "top") openDirectional("top", { near: center.contentItems?.[0]?.componentType ?? "center" }, c, o);
      else openDirectional("bottom", { near: center.contentItems?.[0]?.componentType ?? "center" }, c, o);
    },

    addTab,

    close,
    closePanel,

    focus,

    exists,

    save,
    load,

    normalize,
  };
}
