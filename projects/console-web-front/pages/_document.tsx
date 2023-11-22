import { extractStyle, StyleProvider } from '@ant-design/cssinjs';
import { createCache } from '@ant-design/cssinjs';
import Document, { DocumentContext, Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;
    const cache = createCache();

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => {
            return sheet.collectStyles(
              <StyleProvider cache={cache}>
                <App {...props} />
              </StyleProvider>,
            );
          },
        });

      const initialProps = await Document.getInitialProps(ctx);
      const initialStyles = (
        <>
          {initialProps.styles}
          <style dangerouslySetInnerHTML={{ __html: extractStyle(cache) }} />
        </>
      );
      return {
        ...initialProps,
        styles: [initialStyles, sheet.getStyleElement()],
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html>
        <Head>
          {this.props.styles}
          <meta charSet="utf-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@700&family=Noto+Sans+KR:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
          <Script
            key="gtag-script"
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_DOGU_GA_ID}`}
            strategy="beforeInteractive"
          />
          <Script
            key="gtag-script-2"
            id="gtag"
            async
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  
                  gtag('config', '${process.env.NEXT_PUBLIC_DOGU_GA_ID}');
                  `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
