import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Car, getCarById } from '../api/carApi';

export const CarDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCar = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getCarById(id);
        if (!data) {
          setError('ไม่พบข้อมูลรถยนต์');
        } else {
          setCar(data);
        }
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลรถยนต์');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCarIcon = (brand: string) => {
    const icons: { [key: string]: string } = {
      Toyota: '🚗',
      Honda: '🚙',
      BMW: '🏎️',
      Tesla: '⚡',
      Default: '🚗',
    };
    return icons[brand] || icons['Default'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate('/cars')}
              className="text-blue-600 hover:text-blue-700 mb-4"
            >
              ← กลับไปทั้งหมด
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-2xl text-gray-500 mb-2">😔</p>
            <p className="text-gray-600">{error || 'ไม่พบข้อมูลรถยนต์'}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/cars')}
            className="text-blue-600 hover:text-blue-700 font-semibold mb-4"
          >
            ← กลับไปดูรถทั้งหมด
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Car Image */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 text-center sticky top-8">
              <div className="text-8xl mb-4">{getCarIcon(car.brand)}</div>
              <p className="text-gray-600 text-sm">รูปภาพตัวแทน</p>
            </div>
          </div>

          {/* Car Details */}
          <div className="md:col-span-2">
            {/* Title Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {car.brand} {car.model}
              </h1>
              <p className="text-2xl text-blue-600 font-bold">
                {formatPrice(car.price)}
              </p>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📋 ข้อมูลพื้นฐาน</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">ยี่ห้อ</p>
                  <p className="text-lg font-semibold text-gray-800">{car.brand}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">รุ่น</p>
                  <p className="text-lg font-semibold text-gray-800">{car.model}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">ปี</p>
                  <p className="text-lg font-semibold text-gray-800">{car.year}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">หมายเลขรถ</p>
                  <p className="text-lg font-semibold text-gray-800">{car.id}</p>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ ข้อมูลเทคนิค</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">เชื้อเพลิง</p>
                  <p className="text-lg font-semibold text-gray-800">{car.fuel}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">สี</p>
                  <p className="text-lg font-semibold text-gray-800">{car.color}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">เลขไมล์</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {car.mileage.toLocaleString()} km
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">สถานะ</p>
                  <p className="text-lg font-semibold text-green-600">
                    {car.mileage < 100 ? '🆕 ใหม่' : 'ใช้มา'}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">💰 ราคา</h2>
              <div className="text-center">
                <p className="text-gray-600 mb-2">ราคารถยนต์</p>
                <p className="text-4xl font-bold text-blue-600">
                  {formatPrice(car.price)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                📞 ติดต่อเจ้าของ
              </button>
              <button
                onClick={() => navigate('/cars')}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                ← กลับไป
              </button>
            </div>
          </div>
        </div>
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
