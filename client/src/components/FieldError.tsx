/** Inline field-level error message. */
export default function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-sm" style={{ color: 'var(--color-clay)' }}>
      {message}
    </p>
  );
}
