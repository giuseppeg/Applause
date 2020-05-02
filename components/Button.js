export default function Button(props) {
  return (
    <>
      <button {...props} />
      <style jsx>{`
        button {
          display: block;
          width: 100%;
          margin: 1rem 0;
          padding: 0.5em;
          border-radius: 6px;
          font: inherit;
          border: 1px solid transparent;
          color: var(--backgroundColor);
          background-color: var(--color);
        }
      `}</style>
    </>
  )
}
