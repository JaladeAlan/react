const API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/lands`
  : "https://growth-estate.onrender.com/api/lands";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Helper to safely extract backend error messages
async function parseError(response) {
  try {
    const data = await response.json();
    return (
      data.message ||
      data.error ||
      (typeof data === "string" ? data : null) ||
      "Something went wrong."
    );
  } catch {
    return "Unexpected server response.";
  }
}

/* PURCHASE LAND */
export async function purchaseLand(id, units, pin) {
  try {
    const response = await fetch(`${API_URL}/${id}/purchase`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ units, transaction_pin: pin }),
    });

    if (!response.ok) {
      const message = await parseError(response);
      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error purchasing land:", error);
    throw error;
  }
}

/* SELL LAND */
export async function sellLand(id, units, pin) {
  try {
    const response = await fetch(`${API_URL}/${id}/sell`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ units, transaction_pin: pin }),
    });

    if (!response.ok) {
      const message = await parseError(response);
      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error selling land:", error);
    throw error;
  }
}

/* GET USER UNITS FOR LAND */
export async function getUserUnitsForLand(id) {
  try {
    const response = await fetch(`${API_URL}/${id}/units`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const message = await parseError(response);
      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error fetching user units:", error);
    throw error;
  }
}
