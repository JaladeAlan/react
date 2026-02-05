import api from "../utils/api";

/* PURCHASE LAND */
export async function purchaseLand(id, units, pin) {
  try {
    const res = await api.post(`/lands/${id}/purchase`, {
      units,
      transaction_pin: pin,
    });

    return res.data;
  } catch (error) {
    throw error;
  }
}

/* SELL LAND */
export async function sellLand(id, units, pin) {
  try {
    const res = await api.post(`/lands/${id}/sell`, {
      units,
      transaction_pin: pin,
    });

    return res.data;
  } catch (error) {
    throw error;
  }
}

/* GET USER UNITS FOR LAND */
export async function getUserUnitsForLand(id) {
  try {
    const res = await api.get(`/lands/${id}/units`);
    return res.data;
  } catch (error) {
    throw error;
  }
}
