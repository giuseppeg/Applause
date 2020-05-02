export default function Iframe(props) {
  return (
    <div>
      <iframe {...props} />
      <style jsx>{`
        iframe {
          border: 0;
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 10px;
          box-shadow: 0 10px 60px var(--boxShadowColor);
          cursor: auto;
        }
        div {
          width: 100%;
          padding-bottom: 60%;
          position: relative;
        }
      `}</style>
    </div>
  );
}
