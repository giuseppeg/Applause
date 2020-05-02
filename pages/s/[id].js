import debounce from "just-debounce";

import Button from "../../components/Button";
import Claps from "../../components/Claps";
import Iframe from "../../components/Iframe";

export default function Show({ id, url }) {
  const totalClaps = React.useRef(0);
  const [ownClaps, setOwnClaps] = React.useState([]);
  const [incomingClaps, setIncomingClaps] = React.useState([]);
  const deliverClaps = React.useRef(() => {});

  React.useEffect(() => {
    let aborted = false;
    let peer = null;
    import("peerjs").then((Peer) => {
      if (aborted) {
        return;
      }
      peer = new Peer.default(undefined, { debug: 0 });
      peer.on("disconnect", () => {
        alert("Connection Lost. Please refresh the page.");
      });
      peer.on("error", (err) => {
        alert(String(err));
      });
      peer.on("open", () => {
        const conn = peer.connect(id.replace(/\W/g, ""));
        conn.on("open", (id) => {
          deliverClaps.current = debounce(() => {
            setOwnClaps((claps) => {
              console.log(`sending ${claps.length} claps`);
              conn.send(claps);
              return [];
            });
          }, 1000);
          conn.on("data", (claps) => {
            // initial count sync
            if (typeof claps.totalClaps == "number") {
              setIncomingClaps((ownClaps) => {
                totalClaps.current += claps.totalClaps;
                return [];
              });
              return;
            }
            totalClaps.current += claps.length;
            setIncomingClaps((c) => [...c, ...claps]);
          });
        });
      });
    });
    return () => {
      aborted = true;
      peer && peer.destroy();
    };
  }, [id]);

  React.useEffect(() => {
    if (incomingClaps.length === 0) {
      return;
    }
    const timeoutId = setTimeout(() => {
      setIncomingClaps([]);
    }, 2000);
    return () => {
      timeoutId && clearTimeout(timeoutId);
    };
  }, [incomingClaps]);

  React.useEffect(() => {
    document.addEventListener("click", (e) => {
      if (e.defaultPrevented) {
        return;
      }
      totalClaps.current++;
      setOwnClaps((c) => [...c, `${Math.random()}:${Date.now()}`]);
      deliverClaps.current();
    });
  }, []);

  return (
    <>
      <div className="claps">
        {totalClaps.current} <span title="claps">👏</span>
      </div>
      <Iframe src={url} onClick={(e) => e.stopPropagation()} />
      <Button>clap</Button>
      <p>You can also clap by clicking on any part of the page.</p>
      <Claps claps={ownClaps.concat(incomingClaps)} />
      <style jsx>{`
        .claps {
          display: flex;
          justify-content: flex-end;
        }
        p {
          color: var(--altColor);
          font-size: 0.8rem;
          margin-top: -0.5rem;
          text-align: center;
        }
      `}</style>
    </>
  );
}

export async function getStaticProps({ params }) {
  const [showId, ...url] = Buffer.from(params.id, "base64")
    .toString("ascii")
    .split("|");
  return {
    props: {
      url: url.join("|"),
      showId,
      id: params.id,
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}
