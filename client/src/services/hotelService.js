import api from "./api";

// Get the hotel
export const getHotel = async () => {
  const response = await api.get("/hotel");
  return response.data;
};

// Create hotel
export const createHotel = async (hotelData) => {
  const response = await api.post("/hotel", hotelData);
  return response.data;
};

// Update hotel
export const updateHotel = async (hotelData) => {
  const response = await api.put("/hotel", hotelData);
  return response.data;
};

// AdminDashboard compatibility
export const getAllHotels = async () => {
  const response = await api.get("/hotel");
  return response.data;
};