// Auto-register all node modules by importing them eagerly for side effects.
// Each node module calls nodeRegistry.register(...) on import.

// Import every TSX file in components/nodes eagerly so their registration runs.
// Vite's import.meta.glob with eager: true will include them in the bundle.
const modules = import.meta.glob("../components/nodes/*.tsx", { eager: true });

// The imported modules are intentionally unused; side effects are what we need.
void modules;
