// panelRules.js

export const PANEL_RULES = {
    strategies: {
      mode: 'singleton'
    },
  
    strategyDetail: {
      mode: 'multi',
      key: state => state.strategyId
    }
  
    // B viendra ici plus tard :
    // chart, run, nodered, ...
  };
  