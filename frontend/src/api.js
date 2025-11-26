import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProperties = async (customerType = 'Working Adult') => {
  const response = await api.get('/properties', {
    params: { customer_type: customerType }
  });
  return response.data;
};

export const getProperty = async (propertyId) => {
  const response = await api.get(`/properties/${propertyId}`);
  return response.data;
};

export const getCustomerProfiles = async () => {
  const response = await api.get('/customer-profiles');
  return response.data;
};

export const getPropertyComfort = async (propertyId, customerType = 'Working Adult') => {
  const response = await api.get(`/properties/${propertyId}/comfort`, {
    params: { customer_type: customerType }
  });
  return response.data;
};

export const getLatestReadings = async (propertyId) => {
  const response = await api.get(`/properties/${propertyId}/latest`);
  return response.data;
};

export const get24HourHistory = async (propertyId) => {
  const response = await api.get(`/properties/${propertyId}/history/24hour`);
  return response.data;
};

export const getMonthlyHistory = async (propertyId) => {
  const response = await api.get(`/properties/${propertyId}/history/monthly`);
  return response.data;
};

export const getYearlyHistory = async (propertyId) => {
  const response = await api.get(`/properties/${propertyId}/history/yearly`);
  return response.data;
};

export default api;

