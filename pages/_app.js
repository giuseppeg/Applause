import Analytics, { pageview } from "../components/Analytics";
import Router from "next/router";

Router.events.on("routeChangeComplete", (url) =>
  // Anonymize visits to /s/showId
  pageview(url.replace(/\/s\/.*$/, "/audience"))
);

export default function Applause({ Component, pageProps }) {
  return (
    <div>
      <Analytics />
      <link
        href="https://fonts.googleapis.com/css2?family=Baloo+Paaji+2:wght@500&display=swap"
        rel="stylesheet"
      />
      <h1>
        <a href="/">
          Applause
          <span role="presentation"> 👏</span>
        </a>
      </h1>
      <Component {...pageProps} />
      <p>
        Built for fun by{" "}
        <a href="https://twitter.com/giuseppegurgone" target="_blank">
          @giuseppegurgone
        </a>{" "}
        <span role="presentation">· </span>
        <a href="https://github.com/giuseppeg/applause" target="_blank">
          Source Code
        </a>
      </p>
      <style jsx global>{`
        :root {
          --backgroundColor: #121d31;
          --color: #ffb000;
          --boxShadowColor: #070c13;
          --altColor: #fff;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          background-color: var(--backgroundColor);
          color: var(--color);
          min-height: 100vh;
          font-family: "Baloo Paaji 2", sans-serif;
          user-select: none;
        }
        a {
          color: var(--color);
          text-decoration: none;
        }
        a:hover,
        a:focus {
          text-decoration: underline;
        }
      `}</style>
      <style jsx>{`
        div {
          width: 100%;
          max-width: 867px;
          padding: 1rem;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-items: center;
          min-height: 100vh;
          cursor: pointer;
        }
        h1 {
          text-align: center;
        }
      `}</style>
    </div>
  );
}
