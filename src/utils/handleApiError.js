export default function handleApiError(err, setError) {
  if (!err.response) {
    setError("Network error — please check your connection.");
    return;
  }

  const data = err.response.data;

  if (data?.errors) {
    // Laravel validation errors
    const allErrors = Object.values(data.errors).flat();
    const formatted = allErrors.join("\n"); // Combine into readable block
    setError(formatted || data.message || "Validation failed.");
  } else {
    // Generic API or auth errors
    setError(data?.message || "Something went wrong.");
  }
}
