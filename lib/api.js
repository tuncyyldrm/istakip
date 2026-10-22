const API_BASE = "/api";

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`);
  return res.json();
}

export async function fetchOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  return res.json();
}

export async function createOrder(orderData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData)
  });
  return res.json();
}

export async function updateOrder(id, orderData) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData)
  });
  return res.json();
}

export async function updateOrderStatus(id, status) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function deleteOrder(id) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: "DELETE"
  });
  return res.json();
}

export async function calculateCost(hours, minutes) {
  const res = await fetch(`${API_BASE}/calculator?hours=${hours}&minutes=${minutes}`);
  return res.json();
}

export async function fetchSavedParts() {
  const res = await fetch(`${API_BASE}/saved-parts`);
  return res.json();
}

export async function createSavedPart(part) {
  const res = await fetch(`${API_BASE}/saved-parts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(part)
  });
  return res.json();
}

export async function deleteSavedPart(id) {
  const res = await fetch(`${API_BASE}/saved-parts/${id}`, {
    method: "DELETE"
  });
  return res.json();
}

export async function fetchTrendyolSales() {
  const res = await fetch(`${API_BASE}/trendyol`);
  return res.json();
}

export async function createTrendyolSale(saleData) {
  const res = await fetch(`${API_BASE}/trendyol`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(saleData)
  });
  return res.json();
}

export async function updateTrendyolSale(id, saleData) {
  const res = await fetch(`${API_BASE}/trendyol/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(saleData)
  });
  return res.json();
}

export async function toggleTrendyolSale(id) {
  const res = await fetch(`${API_BASE}/trendyol/${id}`, {
    method: "PATCH"
  });
  return res.json();
}

export async function deleteTrendyolSale(id) {
  const res = await fetch(`${API_BASE}/trendyol/${id}`, {
    method: "DELETE"
  });
  return res.json();
}

export async function fetchCashRegister() {
  const res = await fetch(`${API_BASE}/cash`);
  return res.json();
}

export async function createCashSession(sessionData) {
  const res = await fetch(`${API_BASE}/cash`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sessionData)
  });
  return res.json();
}

export async function deleteCashSession(id) {
  const res = await fetch(`${API_BASE}/cash/${id}`, {
    method: "DELETE"
  });
  return res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  return res.json();
}

export async function updateSettings(settingsData) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settingsData)
  });
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/reset`, {
    method: "POST"
  });
  return res.json();
}
