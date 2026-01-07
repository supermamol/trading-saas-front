let strategies = [
    { id: "alpha", name: "Alpha" },
    { id: "momentum", name: "Momentum" }
  ];
  
  function delay(ms = 200) {
    return new Promise(r => setTimeout(r, ms));
  }
  
  export async function getStrategies() {
    await delay();
    return [...strategies];
  }
  
  export async function addStrategy(name) {
    await delay();
    const id = name.toLowerCase().replace(/\s+/g, "-");
    const strategy = { id, name };
    strategies.push(strategy);
    return strategy;
  }
  
  export async function deleteStrategy(id) {
    await delay();
    strategies = strategies.filter(s => s.id !== id);
  }
  