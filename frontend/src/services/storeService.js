import api from "./api";

export const storeService = {
  async getAllStores(filters = {}) {
    const response = await api.get("/stores/getAllStores", { params: filters });
    return response.data;
  },

  async getStoreById(id) {
    const response = await api.get(`/stores/getStoreByid/${id}`);
    return response.data;
  },

  async createStore(storeData) {
    const response = await api.post("/stores/create-store", storeData);
    return response.data;
  },

  async getStoreOwnerDashboard() {
    const response = await api.get("/stores/owner/dashboard");
    return response.data;
  },

  async getStoreRatings(storeId) {
    const response = await api.get(`/stores/${storeId}/ratings`);
    return response.data; // ⭐ FIXED
  },
};
