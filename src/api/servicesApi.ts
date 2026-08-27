import axiosInstance from './axiosConfig';

export interface CustomField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

export interface BackendService {
  id: string;
  name: string;
  image?: string;
  prebooking_charge?: string;
  price?: string;
  custom_fields?: CustomField[];
  category?: {
    id: string;
    name: string;
  };
  rate?: number;
  pricingUnitName?: string;
}

export const fetchAllServices = async (search = '') => {
  const response = await axiosInstance.get(`/services`, { params: { search } });
  return response.data.data.services as BackendService[];
};
