/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_API_URL: string;
  readonly VITE_PUBLIC_ASSETS_URL?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_GA_ID?: string;
  readonly VITE_ENABLE_E2E_ROUTES?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_ENABLE_SMOOTH_SCROLL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.svg?react" {
  import type React from "react";
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

// Asset modules
declare module "*.svg" {
  const src: string;
  export default src;
}
declare module "*.png" {
  const src: string;
  export default src;
}
declare module "*.jpg" {
  const src: string;
  export default src;
}
declare module "*.jpeg" {
  const src: string;
  export default src;
}
declare module "*.gif" {
  const src: string;
  export default src;
}
declare module "*.webp" {
  const src: string;
  export default src;
}
declare module "*.mp4" {
  const src: string;
  export default src;
}
declare module "*.webm" {
  const src: string;
  export default src;
}

declare module "*.png?w=400;800&format=webp&as=srcset" {
  const srcset: string;
  export default srcset;
}
declare module "*.png?w=600;1200&format=webp&as=srcset" {
  const srcset: string;
  export default srcset;
}
declare module "*.png?w=800;1600&format=webp&as=srcset" {
  const srcset: string;
  export default srcset;
}
declare module "*.png?w=400;800;1200&format=webp&as=srcset" {
  const srcset: string;
  export default srcset;
}
declare module "*.jpg?w=400;800&format=webp&as=srcset" {
  const srcset: string;
  export default srcset;
}
declare module "*.jpg?w=600;1200&format=webp&as=srcset" {
  const srcset: string;
  export default srcset;
}
declare module "*.jpg?w=800;1600&format=webp&as=srcset" {
  const srcset: string;
  export default srcset;
}
declare module "*.jpg?w=400;800;1200&format=webp&as=srcset" {
  const srcset: string;
  export default srcset;
}
declare module "*.jpg?w=400;800&format=avif&as=srcset" {
  const srcset: string;
  export default srcset;
}
declare module "*.png?w=400;800&format=avif&as=srcset" {
  const srcset: string;
  export default srcset;
}
declare module "*.png?w=600;1200&format=avif&as=srcset" {
  const srcset: string;
  export default srcset;
}

declare module "./scripts/vite-plugin-csp-nonce.mjs" {
  import type { Plugin } from "vite";
  export function cspNoncePlugin(): Plugin;
}

// CSS modules
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module "*.module.sass" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Plain styles (for side-effect imports)
declare module "*.css";
declare module "*.scss";
declare module "*.sass";
