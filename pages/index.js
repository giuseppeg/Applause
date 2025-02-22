import Link from "next/link";

import Button from "../components/Button";
import Claps from "../components/Claps";
import Iframe from "../components/Iframe";
import Input from "../components/Input";

export default function Host() {
  const showId = React.useRef(Date.now());
  const [url, setUrl] = React.useState(null);

  const [viewers, setViewers] = React.useState([]);
  const totalClaps = React.useRef(0);
  const [outgoingClaps, setOutgoingClaps] = React.useState([]);

  React.useEffect(() => {
    if (!url) {
      return;
    }
    let aborted = false;
    let peer = null;
    import("peerjs").then((Peer) => {
      if (aborted) {
        return;
      }
      const id = btoa(`${showId.current}|${url}`).replace(/\W/g, "");
      peer = new Peer.default(id, { debug: 0 });
      peer.on("disconnect", () => {
        alert("Connection Lost. Please refresh the page.");
      });
      peer.on("error", (err) => {
        alert(String(err));
      });
      peer.on("connection", (conn) => {
        conn.on("open", () => {
          // When a peer connects to the show send them the current claps count.
          conn.send({ totalClaps: totalClaps.current });
          setViewers((viewers) => {
            return [...viewers, conn];
          });
        });
        conn.on("close", () => {
          setViewers((viewers) => {
            return viewers.filter((v) => v.peer !== conn.peer);
          });
        });
        conn.on("data", (claps) => {
          totalClaps.current += claps.length;
          setOutgoingClaps((c) => {
            return [...c, [conn.peer, claps]];
          });
        });
      });
    });

    function onBeforeUnload(e) {
      e.preventDefault();
      e.returnValue =
        "By closing this window the watch party ends and the audience won't be able to broadcast their applauses.";
    }

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      aborted = true;
      peer && peer.destroy();
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [url]);

  const broadcastClaps = React.useCallback(() => {
    setOutgoingClaps((claps) => {
      if (claps.length <= 0) {
        return claps;
      }
      viewers.forEach((viewer) => {
        // type Claps = [[peerId, clap]]
        const clapsToBroadcast = claps
          // peers should not receive their own claps.
          .filter((c) => c[0] !== viewer.peer)
          .map((c) => c[1]);
        if (clapsToBroadcast.length > 0) {
          viewer.send(...clapsToBroadcast);
        }
      });
      return [];
    });
  }, [viewers]);

  React.useEffect(() => {
    const timeoutId = setTimeout(broadcastClaps, 500);
    return () => {
      timeoutId && clearTimeout(timeoutId);
    };
  }, [outgoingClaps, broadcastClaps]);

  // Crowded events might have continuous clapping
  // and the previous effect could block syncing for tens of seconds.
  // Force flushing after 2 secs of claps.
  React.useEffect(() => {
    setTimeout(broadcastClaps, 2000);
  }, [outgoingClaps, broadcastClaps]);

  if (!url) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setUrl(urlToEmbed(e.target.elements.url.value));
        }}
      >
        <div className="description">
          <p>
            <span role="presentation">👋</span> Hello friend! With Applause you
            can host watch parties, invite people and let them clap!
          </p>
          <p>
            This page is for event hosts. Here you can insert the event embed
            URL (eg. a Twitch stream or a YouTube live video). Applause will
            generate a event link to share with your audience.
          </p>
          <p>
            Audience will send claps by clicking to any part of the page and we
            will broadcast the claps to everybody! How cool is that!?
          </p>
        </div>
        <label>
          Embed Show URL:
          <Input
            type="url"
            name="url"
            defaultValue="https://www.youtube.com/embed/uXEEL9mrkAQ?start=108&autoplay=1"
          />
        </label>
        <Button>start</Button>

        <style jsx>{`
          form {
            width: 100%;
          }
          .description {
            color: var(--altColor);
          }
        `}</style>
      </form>
    );
  }
  const viewersCount = Object.keys(viewers).length;
  return (
    <div>
      <div className="stats">
        <span>
          {viewersCount} viewer{viewersCount !== 1 && "s"}
        </span>
        <span>
          {totalClaps.current} <span title="claps">👏</span>
        </span>
      </div>
      <label>
        Share Link:
        <Input
          onFocus={(e) => e.target.select()}
          onChange={(e) => e.preventDefault()}
          value={`${location.protocol}//${location.host}/s/${btoa(
            `${showId.current}|${url}`
          )}`}
        />
      </label>
      <Iframe src={url} />
      <Claps claps={outgoingClaps} />
      <style jsx>{`
        div {
          width: 100%;
        }
        label {
          display: block;
        }
        .stats {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      `}</style>
    </div>
  );
}

function urlToEmbed(url) {
  const parsed = new URL(url);
  const plugin = plugins.find((p) => p.test(parsed));
  if (plugin) {
    return plugin.getEmbed(parsed);
  }
  return url;
}

const plugins = [
  {
    test: ({ hostname, search }) =>
      hostname.includes("youtube.") && search.includes("v="),
    getEmbed: ({ protocol, host, search }) => {
      const params = new URLSearchParams(search);
      const id = params.get("v");
      params.delete("v");
      return `${protocol}//${host}/embed/${id}?${params.toString()}&autoplay=1`;
    },
  },
  {
    test: ({ hostname, pathname }) =>
      hostname.includes("facebook.") && pathname.includes("/videos/"),
    getEmbed: ({ href }) => {
      return (
        "https://www.facebook.com/plugins/video.php?href=" +
        encodeURIComponent(href) +
        "&width=734&height=411"
      );
    },
  },
  {
    test: ({ href }) => href.includes("twitch.tv/videos/"),
    getEmbed: ({ href, pathname }) => {
      const id = pathname.match(/videos\/(\d+)/);

      if (id) {
        return `https://player.twitch.tv/?autoplay=true&video=v${id[1]}`;
      }
      return href;
    },
  },
];
