-- מערכת מכירת בשר - מסד נתונים

-- טבלת לקוחות
CREATE TABLE Customers (
    CustomerId SERIAL PRIMARY KEY,
    Phone VARCHAR(20) NOT NULL,
    Email VARCHAR(255) UNIQUE,
    FullName VARCHAR(255) NOT NULL,
    Address TEXT,
    DistributionStation VARCHAR(255)
);

-- טבלת מוצרים
CREATE TABLE Products (
    ProductId SERIAL PRIMARY KEY,
    ProductName VARCHAR(255) NOT NULL,
    AvgWeight DECIMAL(10,2),
    PricePerKg DECIMAL(10,2) NOT NULL
);

-- טבלת הזמנות ללקוחות
CREATE TABLE Orders (
    OrderId SERIAL PRIMARY KEY,
    CustomerId INT NOT NULL,
    OrderDate TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_orders_customer FOREIGN KEY (CustomerId)
        REFERENCES Customers (CustomerId) ON DELETE CASCADE
);

-- טבלת מוצרים בהזמנה
CREATE TABLE OrderProducts (
    OrderProductId SERIAL PRIMARY KEY,
    ProductId INT NOT NULL,
    OrderId INT NOT NULL,
    FinalWeight DECIMAL(10,2),
    PaidPrice DECIMAL(10,2),
    UpdatedBy VARCHAR(100),
    UpdatedAt TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_orderproducts_product FOREIGN KEY (ProductId)
        REFERENCES Products (ProductId) ON DELETE CASCADE,
    CONSTRAINT fk_orderproducts_order FOREIGN KEY (OrderId)
        REFERENCES Orders (OrderId) ON DELETE CASCADE
);

-- נתוני דוגמה
INSERT INTO Customers (Phone, Email, FullName, Address, DistributionStation) VALUES
('050-1234567', 'cohen@example.com', 'יוסי כהן', 'רחוב הרצל 15, תל אביב', 'תחנה מרכז'),
('052-9876543', 'levi@example.com', 'שרה לוי', 'שדרות רוטשילד 25, תל אביב', 'תחנה צפון');

INSERT INTO Products (ProductName, AvgWeight, PricePerKg) VALUES
('אנטריקוט', 1.2, 120.00),
('פילה בקר', 0.8, 180.00),
('כתף טלה', 2.5, 95.00);

INSERT INTO Orders (CustomerId) VALUES (1), (2);

INSERT INTO OrderProducts (ProductId, OrderId, PaidPrice) VALUES
(1, 1, 144.00), -- אנטריקוט לפי משקל ממוצע
(2, 1, 144.00), -- פילה בקר
(3, 2, 237.50); -- כתף טלה