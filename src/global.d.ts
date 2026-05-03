// Ambient module declarations for CSS Modules so TypeScript can type-check
// `import styles from './Foo.module.scss'` without a real .scss file existing
// at type-check time. The consumer's bundler (Vite, Next.js, Webpack, etc.)
// transforms the import into a hashed-class-name object at build time.

declare module "*.module.scss" {
  const styles: Record<string, string>;
  export default styles;
}

declare module "*.module.css" {
  const styles: Record<string, string>;
  export default styles;
}
