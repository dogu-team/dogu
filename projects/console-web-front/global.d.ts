interface Window {
  google: any;
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
