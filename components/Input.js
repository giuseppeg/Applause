export default function Input(props) {
  return (
    <>
      <input {...props} />
      <style jsx>{`
        input {
          display: block;
          width: 100%;
          margin: 0.5rem 0;
          padding: 0.5em;
          border-radius: 6px;
          font: inherit;
          border: 1px solid var(--color);
          color: var(--color);
          background-color: transparent;
        }
        input:focus {
          color: var(--backgroundColor);
          background-color: var(--color);
        }
      `}</style>
    </>
  )
}
