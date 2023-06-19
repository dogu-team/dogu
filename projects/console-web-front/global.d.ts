interface Window {
  __ENV: NodeJS.ProcessEnv;
}

declare module '*.svg' {
  const component: React.FC<React.SVGProps<SVGSVGElement>>;

  export default component;
}

declare namespace JSX {
  interface IntrinsicAttributes {
    'access-id'?: string;
  }

  interface ElementAttributesProperty {
    'access-id': any;
  }
}
