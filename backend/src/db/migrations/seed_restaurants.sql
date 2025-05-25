-- Insert sample restaurants
INSERT INTO restaurants (name, category, cuisine_type, address, description, image_url, rating, slug, is_active)
VALUES 
    ('Итальянский дворик', 'italian', 'Итальянская кухня', 'ул. Гастрономическая, 12', 'Уютный ресторан итальянской кухни с аутентичными рецептами', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4', 4.8, 'italyanskiy-dvorik', true),
    ('Азиатский бриз', 'asian', 'Азиатская кухня', 'пр. Кулинаров, 45', 'Ресторан паназиатской кухни с широким выбором суши и вок', 'https://images.unsplash.com/photo-1552566626-52f8b828add9', 4.7, 'aziatskiy-briz', true),
    ('У Михалыча', 'russian', 'Русская кухня', 'ул. Домашняя, 8', 'Традиционная русская кухня в домашней атмосфере', 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d', 4.9, 'u-mihalycha', true),
    ('Морской причал', 'seafood', 'Морепродукты', 'наб. Речная, 15', 'Ресторан морепродуктов с видом на реку', 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62', 4.4, 'morskoy-prichal', true),
    ('Французская лавка', 'french', 'Французская кухня', 'ул. Парижская, 23', 'Изысканная французская кухня и богатая винная карта', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', 4.6, 'francuzskaya-lavka', true),
    ('Грузинский дворик', 'georgian', 'Грузинская кухня', 'пр. Руставели, 7', 'Аутентичная грузинская кухня и гостеприимная атмосфера', 'https://images.unsplash.com/photo-1559058789-672da06263d8', 4.7, 'gruzinskiy-dvorik', true),
    ('Мексиканский уголок', 'mexican', 'Мексиканская кухня', 'ул. Острая, 16', 'Острые блюда мексиканской кухни и текила', 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b', 4.5, 'meksikanskiy-ugolok', true),
    ('Американский бургер', 'american', 'Американская кухня', 'пр. Свободы, 28', 'Сочные бургеры и настоящая американская атмосфера', 'https://images.unsplash.com/photo-1550547660-d9450f859349', 4.6, 'amerikanskiy-burger', true)
ON DUPLICATE KEY UPDATE
    category = VALUES(category),
    cuisine_type = VALUES(cuisine_type),
    is_active = true; 