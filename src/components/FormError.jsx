export default function FormError({ error }) {
  if (!error) return null;

  const message = Array.isArray(error) ? error[0] : error;

  return (
    <p className="text-red-500 text-xs mt-1">
      {message}
    </p>
  );
}
