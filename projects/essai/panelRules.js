// panelRules.js

export const PANEL_RULES = {
    strategies: {
        mode: 'singleton'
    },

    strategyDetail: {
        mode: 'multi',
        key: state => state.strategyId
    },
    chart: {
        mode: 'multi',
        key: state => state.chartId
    }

    // le reste viendra ici plus tard :
    // chart, run, nodered, ...
};
