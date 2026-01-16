/**
 * Tab
 * ---
 * Représente une unité de contenu métier.
 * Un tab est toujours contenu dans exactement un container.
 */

 import type { TabId } from "./ids";

 export interface Tab {
   id: TabId;
 
   /**
    * Type métier du contenu
    * (strategyDetail, chart, run, nodered, etc.)
    */
   kind: string;
 
   /**
    * Données métier optionnelles
    * (strategyId, instanceKey, etc.)
    */
   payload?: Record<string, unknown>;
 }
 