/**
 * Datasource domain model
 *
 * A Datasource represents ONE series that can be rendered in a chart.
 */

 export function createDatasource({
    id,
    label,
    type = "line",
    origin,
    color,
  }) {
    if (!id) throw new Error("Datasource requires an id");
    if (!origin) throw new Error("Datasource requires an origin");
  
    return {
      id,
      label: label ?? id,
      type,
      origin,
      color,
    };
  }
  