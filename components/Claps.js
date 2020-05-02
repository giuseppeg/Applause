import Button from "./Button";

export default function Claps({ claps, color }) {
  const registry = React.useRef({});
  const [buffer, setBuffer] = React.useState(claps || []);

  React.useEffect(() => {
    let timer;
    function loop() {
      timer = requestAnimationFrame(loop);
      let i;

      let doneIds = {};
      for (let clapId in registry.current) {
        if (registry.current[clapId].done) {
          delete registry.current[clapId];
          doneIds[clapId] = true;
        }
      }

      for (let clapId in registry.current) {
        const info = registry.current[clapId];
        if (info && info.node) {
          animate(registry.current[clapId]);
        }
      }

      if (Object.keys(doneIds).length) {
        setBuffer((buffer) => {
          return buffer.filter((id) => !doneIds[id]);
        });
      }
    }
    loop();

    return () => {
      timer && cancelAnimationFrame(timer);
    };
  }, []);

  React.useLayoutEffect(() => {
    setBuffer((buffer) => {
      const news = claps.filter((c) => !buffer.includes(c));
      return buffer.concat(news);
    });
  }, [claps]);

  return (
    <div className="claps">
      <AudioPlayer play={buffer.length > 0} />
      {buffer.map((clap) => (
        <Clap key={clap} registry={registry} clap={clap} color={color} />
      ))}
      <style jsx>{`
        .claps {
          font-size: 3rem;
        }
        .claps > :global(span) {
          position: absolute;
          left: -3em;
          top: -1.5em;
          border-radius: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem 0.5rem;
        }
        .claps :global(span) {
          line-height: 1;
        }
      `}</style>
    </div>
  );
}

function AudioPlayer({ play }) {
  const [isAudioOn, setAudioOn] = React.useState(true);

  return (
    <div>
      {play && isAudioOn && (
        <audio autoPlay loop>
          <source src="/claps.mp3" type="audio/mpeg" />
        </audio>
      )}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setAudioOn((isAudioOn) => !isAudioOn);
        }}
      >
        <span role="presentation">{isAudioOn ? "🔊 " : "🔇 "}</span>
        Audio: {isAudioOn ? "On" : "Off"}
      </Button>
      <style jsx>{`
        div {
          position: fixed;
          top: 0.5rem;
          left: 1rem;
          font-size: 1rem;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}

const Clap = React.memo(function Clap({
  registry,
  clap,
  color = `hsl(${Math.floor(Math.random() * 360)}, 50%, 50% )`,
}) {
  const registerClap = React.useCallback((node) => {
    if (node) {
      registry.current[clap] = {
        node,
        x: parseFloat(window.innerWidth - 50),
        y: parseFloat(window.innerHeight - 30),
        color: Math.floor(Math.random() * 360),
        phase: Math.random() * 360,
        radius: Math.random() * 1,
        speed: 1 + Math.random() * 2,
        scale: 0.2 + Math.random() * 0.8,
        grow: 0.01,
        alpha: 1,
        done: false,
      };
    } else {
      delete registry.current[clap];
    }
  }, []);

  return (
    <span
      ref={registerClap}
      style={{
        backgroundColor: color,
      }}
    >
      <span>👏</span>
    </span>
  );
});

function animate(info) {
  // credit to https://codepen.io/leusrox/pen/jKBarX
  info.alpha = info.alpha > 0 ? info.alpha - 0.0015 : info.alpha;
  info.alpha = info.alpha < 0 ? 0 : info.alpha;

  info.x += Math.cos(info.phase / 50) * info.radius;
  info.y -= info.speed;

  info.grow += (info.scale - info.grow) / 10;
  info.phase += 1;

  info.done = info.y < -100 || info.alpha <= 0 ? true : false;

  info.node.style.transform = `translateX(${info.x}px) translateY(${info.y}px) translateZ(0) scale(${info.grow})`;
  info.node.style.opacity = info.alpha;
}
