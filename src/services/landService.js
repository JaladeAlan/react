const API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/lands`
  : "http://127.0.0.1:8000/api/lands";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Purchase units of a land
export async function purchaseLand(id, units) {
  try {
    const response = await fetch(`${API_URL}/${id}/purchase`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ units }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to purchase land units.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error purchasing land:", error);
    throw error;
  }
}

// Sell units of a land
export async function sellLand(id, units) {
  try {
    const response = await fetch(`${API_URL}/${id}/sell`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ units }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to sell land units.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error selling land:", error);
    throw error;
  }
}

// Get units owned for a land
export async function getUserUnitsForLand(id) {
  try {
    const response = await fetch(`${API_URL}/${id}/units`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user units.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user units:", error);
    throw error;
  }
}
