// this exists to prevent any issues when importing this module directly.
// if you import the module in CJS without this shim, then the types will be
// inaccurate because there is no default export e.g. require('...').default
import plugin from './';
export = plugin;
