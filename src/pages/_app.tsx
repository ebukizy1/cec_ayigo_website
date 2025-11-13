import { Layout } from "@/components/layout/Layout";
import Chatbot from "@/components/layout/Chatbot";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Poppins } from "next/font/google";
import Head from "next/head";
import Script from "next/script";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="facebook-domain-verification" content="5zd5smm7qzfhr8f72w8gfrfpuuiym7" />
      </Head>

      {/* Google Analytics 4 */}
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-NL5JCQMFDM"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-NL5JCQMFDM');
        `}
      </Script>

      {/* TikTok Pixel */}
      <Script id="tiktok-pixel" strategy="afterInteractive">
        {`
          !function (w, d, t) {
            w.TiktokAnalyticsObject = t;
            var ttq = w[t] = w[t] || [];
            ttq.methods = ["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
            ttq.setAndDefer = function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
            for(var i=0;i<ttq.methods.length;i++){ttq.setAndDefer(ttq,ttq.methods[i])}
            ttq.instance = function(t){var e=ttq._i[t]||[];for(var n=0;n<ttq.methods.length;n++){ttq.setAndDefer(e,ttq.methods[n])}return e};
            ttq.load = function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
            ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
            ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e;
            var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('D4AG1DRC77U1BLONRQ70');ttq.page();
          }(window, document, 'ttq');
        `}
      </Script>

      {/* OpenWidget */}
      <Script
        id="openwidget"
        strategy="afterInteractive"
      >
        {`
          window.__ow = window.__ow || {};
          window.__ow.organizationId = "5fd06b29-7fba-40ed-8dfa-55a46c8aef6d";
          window.__ow.integration_name = "manual_settings";
          window.__ow.product_name = "openwidget";   
          (function(n,t,c){
            function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}
            var e={_q:[],_h:null,_v:"2.0",
              on:function(){i(["on",c.call(arguments)])},
              once:function(){i(["once",c.call(arguments)])},
              off:function(){i(["off",c.call(arguments)])},
              get:function(){if(!e._h)throw new Error("[OpenWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},
              call:function(){i(["call",c.call(arguments)])},
              init:function(){
                var n=t.createElement("script");
                n.async=!0;n.type="text/javascript";n.src="https://cdn.openwidget.com/openwidget.js";
                t.head.appendChild(n)
              }
            };
            !n.__ow.asyncInit&&e.init(),n.OpenWidget=n.OpenWidget||e
          }(window,document,[].slice));
        `}
      </Script>

      <main className={`${poppins.variable} font-sans`}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Chatbot />
      </main>

      {/* Noscript fallbacks */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=D4AG1DRC77U1BLONRQ70"
          alt="TikTok Pixel"
        />
      </noscript>

      <noscript>
        You need to{" "}
        <a
          href="https://www.openwidget.com/enable-javascript"
          rel="noopener nofollow"
        >
          enable JavaScript
        </a>{" "}
        to use the communication tool powered by{" "}
        <a
          href="https://www.openwidget.com/"
          rel="noopener nofollow"
          target="_blank"
        >
          OpenWidget
        </a>
      </noscript>
    </>
  );
}
