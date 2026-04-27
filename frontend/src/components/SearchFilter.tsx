import React, { useState } from 'react';

interface SearchFilterProps {
  onSearch: (filters: {
    brand?: string;
    model?: string;
    year?: number;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch }) => {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // ยี่ห้อรถยนต์
  const brands = ['Toyota', 'Honda', 'BMW', 'Tesla', 'Audi', 'Mercedes'];

  // รุ่นรถ (ตัวอย่าง)
  const models: { [key: string]: string[] } = {
    Toyota: ['Corolla', 'Camry', 'Yaris', 'Vios'],
    Honda: ['Civic', 'Accord', 'CR-V', 'Jazz'],
    BMW: ['3 Series', '5 Series', 'X5', 'M340i'],
    Tesla: ['Model 3', 'Model S', 'Model X', 'Model Y'],
  };

  // ปีรถ
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // ค้นหา
  const handleSearch = () => {
    const filters: any = {};
    if (brand) filters.brand = brand;
    if (model) filters.model = model;
    if (year) filters.year = parseInt(year);
    if (minPrice) filters.minPrice = parseInt(minPrice);
    if (maxPrice) filters.maxPrice = parseInt(maxPrice);

    onSearch(filters);
  };

  // ล้าง filter
  const handleReset = () => {
    setBrand('');
    setModel('');
    setYear('');
    setMinPrice('');
    setMaxPrice('');
    onSearch({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">ค้นหารถยนต์</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
        {/* Brand Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ยี่ห้อ
          </label>
          <select
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setModel(''); // รีเซ็ต model เมื่อเปลี่ยน brand
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- เลือกยี่ห้อ --</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Model Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            รุ่น
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={!brand}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">-- เลือกรุ่น --</option>
            {brand &&
              models[brand as keyof typeof models]?.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
          </select>
        </div>

        {/* Year Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ปี
          </label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- เลือกปี --</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ราคาต่ำสุด
          </label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ราคาสูงสุด
          </label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          🔍 ค้นหา
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-colors"
        >
          ล้าง Filter
        </button>
      </div>
    </div>
  );
};
