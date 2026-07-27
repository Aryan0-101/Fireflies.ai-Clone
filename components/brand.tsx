export function FirefliesMark({ size = 24 }: { size?: number }) {
  return (
    <span className="ff-mark" style={{ width: size, height: size }} aria-label="Fireflies">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export function FredMark({ size = 24 }: { size?: number }) {
  return (
    <span className="fred-mark" style={{ width: size, height: size }} aria-label="AskFred">
      <i className="fred-eye left" />
      <i className="fred-eye right" />
    </span>
  );
}
