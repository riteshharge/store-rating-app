import api from "./api";

export const ratingService = {
  async submitRating(ratingData) {
    const response = await api.post("/ratings/submitRating", ratingData);
    return response.data;
  },

  async getUserRatings() {
    const response = await api.get("/ratings/getUserRating");
    console.log("response data: ", response.data);
    return response.data;
  },

  async getStoreWithUserRating(storeId) {
    const response = await api.get(`/ratings/store/rating/${storeId}`);
    return response.data;
  },

  async deleteRating(ratingId) {
    const response = await api.delete(`/ratings/deleteRating/${ratingId}`);
    return response.data;
  },
};
