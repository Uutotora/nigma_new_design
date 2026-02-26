declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    SERVER: boolean | undefined;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}

// Minimal typings for Quasar wrappers used in this project.
declare module 'quasar/wrappers' {
  // Preserve the callback type without prescribing a specific signature.
  export function route<T>(cb: T): T;
  export function configure<T>(cb: T): T;
  export function boot<T>(cb: T): T;
}

// `process.env` is replaced at build time by Quasar/Vite. Provide a minimal
// global type so TS doesn't require Node typings in the browser.
declare const process: {
  env: NodeJS.ProcessEnv;
};
