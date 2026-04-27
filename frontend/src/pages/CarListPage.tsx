import React, { useState, useEffect } from 'react';
import { Car, getAllCars, searchCars } from '../api/carApi';
import { SearchFilter } from '../components/SearchFilter';
import { CarCard } from '../components/CarCard';

export const CarListPage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // โหลดรถทั้งหมด เมื่อหน้าโหลด
  useEffect(() => {
    const loadCars = async () => {
      setLoading(true);
      try {
        const data = await getAllCars();
        setCars(data);
        setFilteredCars(data);
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลรถยนต์');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, []);

  // ค้นหารถตามเงื่อนไข
  const handleSearch = async (filters: {
    brand?: string;
    model?: string;
    year?: number;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    setLoading(true);
    try {
      // ถ้าไม่มี filter ให้แสดงรถทั้งหมด
      if (
        !filters.brand &&
        !filters.model &&
        !filters.year &&
        !filters.minPrice &&
        !filters.maxPrice
      ) {
        setFilteredCars(cars);
        setLoading(false);
        return;
      }

      // ค้นหาจาก API
      const results = await searchCars(filters.brand, filters.model, filters.year);

      // Filter ตามราคา ถ้าระบุ
      let filtered = results;
      if (filters.minPrice || filters.maxPrice) {
        filtered = results.filter((car) => {
          const meetsMinPrice = !filters.minPrice || car.price >= filters.minPrice;
          const meetsMaxPrice = !filters.maxPrice || car.price <= filters.maxPrice;
          return meetsMinPrice && meetsMaxPrice;
        });
      }

      setFilteredCars(filtered);
    } catch (err) {
      setError('ค้นหาไม่สำเร็จ');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-blue-600">🚗 Car Marketplace</h1>
          <p className="text-gray-600 mt-1">ค้นหาและเปรียบเทียบราคารถยนต์ทั้งหมด</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Filter */}
        <SearchFilter onSearch={handleSearch} />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : filteredCars.length === 0 ? (
          /* No Results */
          <div className="text-center py-12">
            <p className="text-2xl text-gray-500 mb-2">😔</p>
            <p className="text-gray-600">ไม่พบรถยนต์ที่ตรงกับเงื่อนไข</p>
          </div>
        ) : (
          /* Cars Grid */
          <>
            <div className="mb-4 text-gray-600">
              <p>
                พบรถยนต์ทั้งหมด{' '}
                <span className="font-bold text-blue-600">{filteredCars.length}</span>{' '}
                คัน
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center">© 2026 Car Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
