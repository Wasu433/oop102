INSERT INTO cars (brand, model, year, price, color, fuel, mileage) VALUES

-- Toyota
('Toyota','Camry',    2024,1759000,'ขาว',   'hybrid', 0),
('Toyota','Camry',    2023,1689000,'ดำ',    'hybrid', 8500),
('Toyota','Yaris',    2024, 679000,'แดง',   'petrol', 0),
('Toyota','Yaris',    2023, 629000,'เงิน',  'petrol', 12000),
('Toyota','Corolla',  2024, 929000,'ขาว',   'hybrid', 0),
('Toyota','Corolla',  2023, 879000,'น้ำเงิน','hybrid', 7200),
('Toyota','Fortuner', 2024,1789000,'ดำ',    'diesel', 0),
('Toyota','Fortuner', 2023,1699000,'เทา',   'diesel', 15000),
('Toyota','Hilux',    2024,1029000,'ขาว',   'diesel', 0),
('Toyota','Hilux',    2023, 979000,'ดำ',    'diesel', 22000),
('Toyota','C-HR',     2024,1179000,'แดง',   'hybrid', 0),
('Toyota','C-HR',     2023,1099000,'ขาว',   'hybrid', 9800),

-- Honda
('Honda','Civic',  2024,1199000,'ดำ',    'petrol', 0),
('Honda','Civic',  2023,1099000,'ขาว',   'petrol', 11000),
('Honda','City',   2024, 729000,'แดง',   'petrol', 0),
('Honda','City',   2023, 679000,'เงิน',  'petrol', 14000),
('Honda','HR-V',   2024,1099000,'ขาว',   'petrol', 0),
('Honda','HR-V',   2023, 999000,'น้ำเงิน','petrol', 8800),
('Honda','CR-V',   2024,1649000,'เทา',   'hybrid', 0),
('Honda','CR-V',   2023,1549000,'ดำ',    'hybrid', 6500),

-- BMW
('BMW','320d',   2024,2690000,'ขาว',   'diesel', 0),
('BMW','520d',   2024,3590000,'เทา',   'diesel', 0),
('BMW','X1',     2024,2490000,'ดำ',    'petrol', 0),
('BMW','X3',     2024,3290000,'ขาว',   'diesel', 0),
('BMW','X5',     2023,5990000,'เทา',   'diesel', 12000),

-- Mercedes-Benz
('Mercedes-Benz','C220d',   2024,3290000,'ดำ',  'diesel', 0),
('Mercedes-Benz','E220d',   2024,4590000,'เงิน','diesel', 0),
('Mercedes-Benz','GLC 300', 2024,4190000,'ขาว', 'petrol', 0),
('Mercedes-Benz','A200',    2023,2590000,'แดง',  'petrol', 9000),

-- Mazda
('Mazda','Mazda3',  2024, 979000,'เทา', 'petrol', 0),
('Mazda','CX-3',    2024, 899000,'ขาว', 'petrol', 0),
('Mazda','CX-5',    2024,1399000,'แดง', 'petrol', 0),
('Mazda','CX-5',    2023,1299000,'เทา', 'petrol', 7800),
('Mazda','CX-8',    2024,1799000,'ดำ',  'diesel', 0),

-- Isuzu
('Isuzu','D-Max',    2024, 889000,'ขาว', 'diesel', 0),
('Isuzu','D-Max',    2023, 829000,'ดำ',  'diesel', 18000),
('Isuzu','MU-X',     2024,1299000,'เงิน','diesel', 0),
('Isuzu','MU-X',     2023,1199000,'ขาว', 'diesel', 10500),

-- Ford
('Ford','Ranger',    2024, 949000,'ดำ',  'diesel', 0),
('Ford','Ranger',    2023, 889000,'ขาว', 'diesel', 20000),
('Ford','Everest',   2024,1799000,'เทา', 'diesel', 0),
('Ford','Ranger Raptor',2023,1799000,'สีส้ม','diesel', 5000),

-- Nissan
('Nissan','Almera',  2024, 679000,'ขาว', 'petrol', 0),
('Nissan','Almera',  2023, 629000,'เงิน','petrol', 16000),
('Nissan','Terra',   2024,1399000,'ดำ',  'diesel', 0),
('Nissan','X-Trail', 2024,1599000,'ขาว', 'petrol', 0),
('Nissan','Navara',  2024, 879000,'เทา', 'diesel', 0),

-- Mitsubishi
('Mitsubishi','Pajero Sport',2024,1549000,'ดำ',   'diesel', 0),
('Mitsubishi','Pajero Sport',2023,1449000,'เงิน',  'diesel', 13000),
('Mitsubishi','Outlander',   2024,1699000,'ขาว',   'petrol', 0),
('Mitsubishi','Triton',      2024, 849000,'แดง',   'diesel', 0),

-- MG
('MG','ZS EV',  2024, 899000,'ขาว',   'electric', 0),
('MG','ZS EV',  2023, 799000,'น้ำเงิน','electric', 21000),
('MG','EP',     2024, 679000,'เทา',   'electric', 0),
('MG','HS',     2024, 999000,'ขาว',   'petrol',   0),
('MG','MG5',    2024, 599000,'แดง',   'electric', 0),

-- BYD
('BYD','Atto 3', 2024,1190000,'ขาว',  'electric', 0),
('BYD','Atto 3', 2023,1090000,'เทา',  'electric', 8000),
('BYD','Dolphin',2024, 899000,'น้ำเงิน','electric', 0),
('BYD','Seal',   2024,1490000,'ดำ',   'electric', 0),

-- Tesla
('Tesla','Model 3', 2024,2190000,'ขาว', 'electric', 0),
('Tesla','Model 3', 2023,1990000,'แดง', 'electric', 9500),
('Tesla','Model Y', 2024,2690000,'ดำ',  'electric', 0)

ON CONFLICT (brand, model, year, price, color, fuel, mileage) DO NOTHING;
