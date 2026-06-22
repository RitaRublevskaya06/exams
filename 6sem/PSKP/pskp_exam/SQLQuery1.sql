USE testdb;
GO

-- Для 38, 41
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    age INT,
    created_at DATETIME DEFAULT GETDATE()
);

-- Для 39, 40
CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10, 2),
    stock INT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);


USE testdb;
GO

-- Удаляем старую таблицу
IF OBJECT_ID('products', 'U') IS NOT NULL DROP TABLE products;
GO

-- Создаем новую таблицу БЕЗ created_at и updated_at
CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10, 2),
    stock INT
);
GO

-- Добавляем тестовые данные
INSERT INTO products (name, price, stock) VALUES
('Laptop', 999.99, 10),
('Mouse', 29.99, 50),
('Keyboard', 59.99, 30);
GO

-- Проверяем
SELECT * FROM products;
GO































-- Добавим тестовые данные
IF NOT EXISTS (SELECT * FROM products)
BEGIN
    INSERT INTO products (name, price, stock) VALUES
    ('Laptop', 999.99, 10),
    ('Mouse', 29.99, 50),
    ('Keyboard', 59.99, 30);
    PRINT 'Test data added';
END
GO

SELECT * FROM products;
GO


-- Пересоздаем таблицу без временных меток
USE testdb;
GO

IF OBJECT_ID('products', 'U') IS NOT NULL DROP TABLE products;
GO

CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10, 2),
    stock INT
);
GO

INSERT INTO products (name, price, stock) VALUES
('Laptop', 999.99, 10),
('Mouse', 29.99, 50),
('Keyboard', 59.99, 30);
GO


USE testdb;
GO

-- Добавляем колонку updated_at если её нет
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('products') AND name = 'updated_at')
BEGIN
    ALTER TABLE products ADD updated_at DATETIME DEFAULT GETDATE();
    PRINT 'Column updated_at added';
END
ELSE
    PRINT 'Column updated_at already exists';
GO

-- Проверяем структуру
SELECT * FROM products;
GO



SELECT * FROM products;
GO