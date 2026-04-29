// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// ตรวจสอบว่า API key มีค่าหรือไม่
if (!API_BASE_URL) {
  console.warn('⚠️ VITE_API_BASE_URL is not configured in .env.local');
}

// Helper function - สร้าง headers พร้อม API key
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // ถ้ามี API key ให้ใส่ไปใน Authorization header
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  return headers;
};

// Helper function - fetch with error handling
const fetchWithHeaders = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });
};

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  color: string;
  fuel: string;
  mileage: number;
}

// ดึงรถทั้งหมด
export const getAllCars = async (): Promise<Car[]> => {
  try {
    const response = await fetchWithHeaders(`${API_BASE_URL}/cars`);
    if (!response.ok) throw new Error('Failed to fetch cars');
    return await response.json();
  } catch (error) {
    console.error('Error fetching cars:', error);
    return [];
  }
};

// ดึงรถตาม ID
export const getCarById = async (id: string): Promise<Car | null> => {
  try {
    const response = await fetchWithHeaders(`${API_BASE_URL}/cars/${id}`);
    if (!response.ok) throw new Error('Car not found');
    return await response.json();
  } catch (error) {
    console.error('Error fetching car:', error);
    return null;
  }
};

// ค้นหารถตามเงื่อนไข
export const searchCars = async (
  brand?: string,
  model?: string,
  year?: number
): Promise<Car[]> => {
  try {
    const params = new URLSearchParams();
    if (brand) params.append('brand', brand);
    if (model) params.append('model', model);
    if (year) params.append('year', year.toString());

    const response = await fetchWithHeaders(
      `${API_BASE_URL}/cars/search?${params.toString()}`
    );
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  } catch (error) {
    console.error('Error searching cars:', error);
    return [];
  }
};

// ค้นหารถในช่วงราคา (ถ้า backend รองรับ)
export const searchCarsByPrice = async (
  minPrice: number,
  maxPrice: number
): Promise<Car[]> => {
  try {
    const params = new URLSearchParams({
      minPrice: minPrice.toString(),
      maxPrice: maxPrice.toString(),
    });

    const response = await fetchWithHeaders(
      `${API_BASE_URL}/cars/search?${params.toString()}`
    );
    if (!response.ok) throw new Error('Price search failed');
    return await response.json();
  } catch (error) {
    console.error('Error searching cars by price:', error);
    return [];
  }
};
