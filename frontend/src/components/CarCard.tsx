import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from '../api/carApi';

interface CarCardProps {
  car: Car;
}

export const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const navigate = useNavigate();

  // แปลง price เป็น format ที่อ่านง่าย (เช่น 750,000 บาท)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // ไปหน้า detail
  const handleViewDetail = () => {
    navigate(`/car/${car.id}`);
  };

  const carImageUrl = `https://loremflickr.com/640/360/${encodeURIComponent(car.brand)}+${encodeURIComponent(car.model)}+car/all?lock=${car.id}`;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {/* Car Image Section */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={carImageUrl}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src = `https://loremflickr.com/640/360/car/all?lock=${car.id}`;
          }}
        />
      </div>

      {/* Car Info Section */}
      <div className="p-4">
        {/* Brand and Model */}
        <div className="mb-2">
          <h3 className="text-lg font-bold text-gray-800">
            {car.brand} {car.model}
          </h3>
          <p className="text-sm text-gray-500">{car.year}</p>
        </div>

        {/* Car Details */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div>
            <span className="text-gray-500">เชื้อเพลิง:</span>
            <p className="font-semibold text-gray-700">{car.fuel}</p>
          </div>
          <div>
            <span className="text-gray-500">สี:</span>
            <p className="font-semibold text-gray-700">{car.color}</p>
          </div>
          <div>
            <span className="text-gray-500">เลขไมล์:</span>
            <p className="font-semibold text-gray-700">{car.mileage.toLocaleString()} km</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4 pb-4 border-t pt-4">
          <p className="text-gray-500 text-sm mb-1">ราคา</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatPrice(car.price)}
          </p>
        </div>

        {/* View Detail Button */}
        <button
          onClick={handleViewDetail}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          ดูรายละเอียด
        </button>
      </div>
    </div>
  );
};
