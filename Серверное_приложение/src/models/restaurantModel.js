/**
 * Модель ресторана
 * Обрабатывает все операции с базой данных, связанные с ресторанами
 */

const pool = require('../config/database');

/**
 * Класс для работы с ресторанами
 */
class RestaurantModel {
    constructor() {
        // Планирование проверки столбцов на следующий тик, чтобы позволить завершиться инициализации базы данных
        process.nextTick(() => {
            this.ensureColumnsExist().catch(err => {
                console.log('Warning: Initial column check failed, will retry when used:', err.message);
            });
        });
    }
    
    /**
     * Убедиться, что все необходимые столбцы существуют в таблице ресторанов
     * Этот метод запускается при первой инициализации модели
     */
    async ensureColumnsExist() {
        try {
            // Проверим информацию о столбцах таблицы
            const [columns] = await pool.execute(`
                SHOW COLUMNS FROM restaurants
            `);
            
            // Создаем список имен существующих столбцов
            const existingColumns = columns.map(col => col.Field);
            
            // Список столбцов, которые нужно добавить
            const columnsToAdd = [];
            
            // Проверяем каждый столбец и добавляем его в список, если он отсутствует
            if (!existingColumns.includes('category')) {
                columnsToAdd.push('ADD COLUMN category ENUM("italian", "asian", "russian", "seafood", "french", "georgian", "mexican", "american") NOT NULL DEFAULT "russian"');
            }
            
            if (!existingColumns.includes('price_range')) {
                columnsToAdd.push('ADD COLUMN price_range VARCHAR(10)');
            }
            
            if (!existingColumns.includes('min_price')) {
                columnsToAdd.push('ADD COLUMN min_price VARCHAR(20)');
            }
            
            if (!existingColumns.includes('delivery_time')) {
                columnsToAdd.push('ADD COLUMN delivery_time VARCHAR(20)');
            }
            
            // Если есть столбцы для добавления, выполняем запрос ALTER TABLE
            if (columnsToAdd.length > 0) {
                await pool.execute(`
                    ALTER TABLE restaurants 
                    ${columnsToAdd.join(', ')}
                `);
                console.log('Добавлены новые столбцы в таблицу restaurants:', columnsToAdd);
            } else {
                console.log('Все необходимые столбцы уже существуют в таблице restaurants');
            }
        } catch (error) {
            console.error('Error ensuring restaurant table columns exist:', error);
            throw error; // Re-throw to allow caller to handle
        }
    }

    /**
     * Убедиться, что ensureColumnsExist выполнен перед операциями с базой данных
     */
    async ensureColumnsExistBeforeOperation() {
        try {
            await this.ensureColumnsExist();
        } catch (error) {
            console.error('Failed to ensure columns exist before operation:', error.message);
            // Продолжаем операцию, даже если она может все еще быть успешной
        }
    }
    
    /**
     * Создать новый ресторан
     * @param {Object} restaurantData - Данные ресторана
     * @returns {Promise<Object>} - Информация о созданном ресторане
     */
    async create(restaurantData) {
        try {
            await this.ensureColumnsExistBeforeOperation();
            
            console.log('=== RestaurantModel.create called ===');
            console.log('Входные данные:', JSON.stringify(restaurantData, null, 2));
            
            const {
                name,
                address,
                description,
                imageUrl,
                website,
                contactPhone,
                criteria = {},
                slug,
                category = 'russian', // Default to Russian cuisine if not specified
                price_range,
                min_price,
                delivery_time,
                hours
            } = restaurantData;
            
            // Проверка обязательных полей
            const requiredFields = {
                'Название ресторана': name,
                'Категория кухни': category,
                'Ценовой диапазон': price_range,
                'Время доставки': delivery_time,
                'Минимальная цена заказа': min_price
            };

            const missingFields = Object.entries(requiredFields)
                .filter(([_, value]) => !value)
                .map(([fieldName]) => fieldName);

            if (missingFields.length > 0) {
                throw new Error(`Пожалуйста, заполните следующие поля: ${missingFields.join(', ')}`);
            }

            // Validate category
            const validCategories = ['italian', 'asian', 'russian', 'seafood', 'french', 'georgian', 'mexican', 'american'];
            if (!validCategories.includes(category)) {
                throw new Error(`Неверная категория. Допустимые категории: ${validCategories.join(', ')}`);
            }

            // Дополнительная валидация
            if (typeof min_price !== 'number' || min_price < 0) {
                throw new Error('Пожалуйста, укажите минимальную цену заказа в виде положительного числа');
            }

            // Validate delivery time format (min-max)
            if (!delivery_time || typeof delivery_time !== 'string') {
                throw new Error('Пожалуйста, укажите время доставки в формате "минимум-максимум" (например: "30-60")');
            }

            const [minTime, maxTime] = delivery_time.split('-').map(t => parseInt(t, 10));
            if (isNaN(minTime) || isNaN(maxTime) || minTime < 0 || maxTime < 0) {
                throw new Error('Пожалуйста, укажите время доставки в минутах. Оба значения должны быть положительными числами');
            }

            if (minTime >= maxTime) {
                throw new Error('Минимальное время доставки должно быть меньше максимального. Например: "30-60"');
            }

            if (!name || name.trim() === '') {
                throw new Error('Пожалуйста, укажите название ресторана');
            }

            // Генерируем базовый slug из названия
            let finalSlug = this.generateSlug(name);
            
            // Если slug все еще пустой, генерируем случайный
            if (!finalSlug || finalSlug.trim() === '') {
                finalSlug = `restaurant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }

            // Проверяем уникальность slug
            let isUnique = false;
            let attempts = 0;
            let currentSlug = finalSlug;

            while (!isUnique && attempts < 5) {
                const existing = await this.getBySlug(currentSlug);
                if (!existing) {
                    isUnique = true;
                    finalSlug = currentSlug;
                } else {
                    currentSlug = `${finalSlug}-${Date.now()}-${attempts}`;
                    attempts++;
                }
            }

            // Если все попытки исчерпаны, генерируем полностью случайный slug
            if (!isUnique) {
                finalSlug = `restaurant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }

            // Финальная проверка перед вставкой
            if (!finalSlug || finalSlug.trim() === '') {
                throw new Error('Не удалось сгенерировать корректный slug для ресторана');
            }
            
            console.log('=== Подготовленные данные для SQL ===');
            console.log('Имя:', name);
            console.log('Финальный слаг:', finalSlug);
            console.log('Категория:', category);
            console.log('Ценовой диапазон:', price_range);
            console.log('Минимальная цена:', min_price);
            console.log('Время доставки:', delivery_time);
            console.log('Время работы:', hours);
            console.log('============================');
            
            const [result] = await pool.execute(
                `INSERT INTO restaurants 
                (name, address, description, image_url, website, contact_phone, criteria, slug, category, price_range, min_price, delivery_time, hours) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    name,
                    address || null,
                    description || null,
                    imageUrl || null,
                    website || null,
                    contactPhone || null,
                    JSON.stringify(criteria),
                    finalSlug,
                    category,
                    price_range || null,
                    min_price || null,
                    delivery_time || null,
                    hours || null
                ]
            );
            
            console.log('=== Результат выполнения SQL ===');
            console.log('Insert ID:', result.insertId);
            console.log('===========================');
            
            return { 
                id: result.insertId, 
                ...restaurantData,
                slug: finalSlug
            };
        } catch (error) {
            console.error('Ошибка в RestaurantModel.create:', error);
            console.error('Код ошибки SQL:', error.code);
            console.error('Сообщение ошибки SQL:', error.message);
            console.error('Ошибка SQL:', error.sql);
            throw error;
        }
    }
    
    /**
     * Генерирует URL-дружественный slug из названия
     * @param {string} name - Название ресторана
     * @returns {string} - Сгенерированный slug
     */
    generateSlug(name) {
        // Если имя пустое или undefined, сразу возвращаем уникальный идентификатор
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return `restaurant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        // Таблица транслитерации для русских букв
        const transliteration = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
            'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
            'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd', 'Е': 'e', 'Ё': 'yo',
            'Ж': 'zh', 'З': 'z', 'И': 'i', 'Й': 'y', 'К': 'k', 'Л': 'l', 'М': 'm',
            'Н': 'n', 'О': 'o', 'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't', 'У': 'u',
            'Ф': 'f', 'Х': 'h', 'Ц': 'ts', 'Ч': 'ch', 'Ш': 'sh', 'Щ': 'sch', 'Ъ': '',
            'Ы': 'y', 'Ь': '', 'Э': 'e', 'Ю': 'yu', 'Я': 'ya'
        };

        try {
            // Транслитерация и очистка
            let slug = name.trim()
                .split('')
                .map(char => transliteration[char] || char)
                .join('')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            // Если после всех преобразований slug пустой или слишком короткий
            if (!slug || slug.length < 3) {
                return `restaurant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }

            return slug;
        } catch (error) {
            console.error('Ошибка при генерации slug:', error);
            // В случае любой ошибки возвращаем гарантированно уникальный slug
            return `restaurant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
    }
    
    /**
     * Получить все рестораны
     * @param {Object} options - Опции запроса
     * @param {boolean} options.isActive - Фильтр по активным ресторанам
     * @param {string} options.category - Фильтр по категории
     * @returns {Promise<Array>} - Список ресторанов
     */
    async getAll(options = {}) {
        try {
            await this.ensureColumnsExistBeforeOperation();
            
            let query = `
                SELECT 
                    r.*,
                    COALESCE(AVG(rv.rating), 0) as avg_rating,
                    COUNT(DISTINCT rv.id) as review_count
                FROM restaurants r
                LEFT JOIN reviews rv ON r.id = rv.restaurant_id
                WHERE 1=1
            `;
            
            const params = [];
            
            // Фильтр по активности
            if (options.isActive !== undefined) {
                query += ' AND r.is_active = ?';
                params.push(options.isActive);
            }
            
            // Фильтр по категории
            if (options.category && options.category !== 'all') {
                query += ' AND r.category = ?';
                params.push(options.category);
                console.log('Filtering by category:', options.category);
            }
            
            query += ' GROUP BY r.id ORDER BY avg_rating DESC';
            
            console.log('SQL Query:', query);
            console.log('Params:', params);
            
            const [restaurants] = await pool.execute(query, params);
            
            console.log('Found restaurants:', restaurants.length);
            
            return restaurants.map(restaurant => ({
                ...restaurant,
                avg_rating: parseFloat(restaurant.avg_rating) || 0,
                review_count: parseInt(restaurant.review_count) || 0
            }));
        } catch (error) {
            console.error('Error getting restaurants:', error);
            throw error;
        }
    }
    
    /**
     * Получить ресторан по ID
     * @param {number} id - ID ресторана
     * @returns {Promise<Object|null>} - Объект ресторана или null
     */
    async getById(id) {
        await this.ensureColumnsExistBeforeOperation();
        
        const [rows] = await pool.execute(
            'SELECT * FROM restaurants WHERE id = ?',
            [id]
        );
        
        return rows.length > 0 ? rows[0] : null;
    }
    
    /**
     * Получить ресторан по слагу
     * @param {string} slug - Слаг ресторана
     * @returns {Promise<Object|null>} - Объект ресторана или null
     */
    async getBySlug(slug) {
        await this.ensureColumnsExistBeforeOperation();
        
        const [rows] = await pool.execute(
            'SELECT * FROM restaurants WHERE slug = ?',
            [slug]
        );
        
        return rows.length > 0 ? rows[0] : null;
    }
    
    /**
     * Получить ресторан по имени
     * @param {string} name - Название ресторана
     * @returns {Promise<Object|null>} - Объект ресторана или null
     */
    async getByName(name) {
        await this.ensureColumnsExistBeforeOperation();
        
        const [rows] = await pool.execute(
            'SELECT * FROM restaurants WHERE name = ?',
            [name]
        );
        
        return rows.length > 0 ? rows[0] : null;
    }
    
    /**
     * Обновить данные ресторана
     * @param {number} id - ID ресторана
     * @param {Object} restaurantData - Новые данные ресторана
     * @returns {Promise<boolean>} - Результат обновления
     */
    async update(id, restaurantData) {
        try {
            await this.ensureColumnsExistBeforeOperation();
            
            console.log('=== RestaurantModel.update called ===');
            console.log('Restaurant ID:', id);
            console.log('Input data:', JSON.stringify(restaurantData, null, 2));
            
            const {
                name,
                address,
                description,
                imageUrl,
                website,
                contactPhone,
                criteria,
                isActive,
                category,
                price_range,
                min_price,
                delivery_time,
                hours
            } = restaurantData;
            
            // Построение предложения set и массива параметров для SQL-запроса
            const setClauses = [];
            const params = [];
            
            if (name !== undefined) {
                setClauses.push('name = ?');
                params.push(name);
            }
            
            if (address !== undefined) {
                setClauses.push('address = ?');
                params.push(address);
            }
            
            if (description !== undefined) {
                setClauses.push('description = ?');
                params.push(description);
            }
            
            // Обработка URL-адреса изображения правильно
            if (imageUrl !== undefined) {
                setClauses.push('image_url = ?');
                params.push(imageUrl);
            }
            
            if (website !== undefined) {
                setClauses.push('website = ?');
                params.push(website);
            }
            
            if (contactPhone !== undefined) {
                setClauses.push('contact_phone = ?');
                params.push(contactPhone);
            }
            
            if (criteria !== undefined) {
                setClauses.push('criteria = ?');
                params.push(JSON.stringify(criteria));
            }
            
            if (isActive !== undefined) {
                setClauses.push('is_active = ?');
                params.push(isActive ? 1 : 0);
            }
            
            if (category !== undefined) {
                setClauses.push('category = ?');
                params.push(category);
            }
            
            if (price_range !== undefined) {
                setClauses.push('price_range = ?');
                params.push(price_range);
            }
            
            if (min_price !== undefined) {
                setClauses.push('min_price = ?');
                params.push(min_price);
            }
            
            if (delivery_time !== undefined) {
                setClauses.push('delivery_time = ?');
                params.push(delivery_time);
            }

            if (hours !== undefined) {
                setClauses.push('hours = ?');
                params.push(hours);
            }
            
            // Добавление условия where и параметра
            params.push(id);
            
            // Если нет предложений set, возвращаем false
            if (setClauses.length === 0) {
                console.log('Нет полей для обновления');
                return false;
            }
            
            // Выполнение запроса на обновление
            const sqlQuery = `UPDATE restaurants SET ${setClauses.join(', ')} WHERE id = ?`;
            console.log('SQL Query:', sqlQuery);
            console.log('Params:', params);
            
            await pool.execute(sqlQuery, params);
            
            // Получение обновленного ресторана для возврата
            const [rows] = await pool.execute(
                'SELECT * FROM restaurants WHERE id = ?',
                [id]
            );
            
            return rows.length > 0 ? rows[0] : false;
        } catch (error) {
            console.error('Ошибка при обновлении ресторана:', error);
            throw error;
        }
    }
    
    /**
     * Удалить ресторан
     * @param {number} id - ID ресторана
     * @returns {Promise<boolean>} - Результат удаления
     */
    async delete(id) {
        await this.ensureColumnsExistBeforeOperation();
        
        await pool.execute('DELETE FROM restaurants WHERE id = ?', [id]);
        return true;
    }
    
    /**
     * Обновить критерии ресторана
     * @param {number} id - ID ресторана
     * @param {Object} criteria - Объект с критериями
     * @returns {Promise<boolean>} - Результат обновления
     */
    async updateCriteria(id, criteria) {
        await this.ensureColumnsExistBeforeOperation();
        
        await pool.execute(
            'UPDATE restaurants SET criteria = ?, updated_at = NOW() WHERE id = ?',
            [JSON.stringify(criteria), id]
        );
        
        return true;
    }
    
    /**
     * Обновить слаг ресторана
     * @param {number} id - ID ресторана
     * @param {string} slug - Новый слаг
     * @returns {Promise<boolean>} - Результат обновления
     */
    async updateSlug(id, slug) {
        await this.ensureColumnsExistBeforeOperation();
        
        const cleanSlug = slug
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Удаление не-словарных символов
            .replace(/[\s_-]+/g, '-') // Замена пробелов и подчеркиваний на дефисы
            .replace(/^-+|-+$/g, ''); // Удаление начальных/конечных дефисов
            
        await pool.execute(
            'UPDATE restaurants SET slug = ?, updated_at = NOW() WHERE id = ?',
            [cleanSlug, id]
        );
        
        return true;
    }
    
    /**
     * Поиск ресторанов
     * @param {string} query - Поисковый запрос
     * @param {string} category - Категория для фильтрации (опционально)
     * @returns {Promise<Array>} - Результаты поиска
     */
    async search(query, category = null) {
        await this.ensureColumnsExistBeforeOperation();
        
        // Подготовка поискового запроса с подстановочными знаками для операции LIKE
        const searchParam = `%${query}%`;
        
        let sql = `
            SELECT 
                r.*,
                COALESCE(AVG(rv.rating), 0) as avg_rating,
                COUNT(DISTINCT rv.id) as review_count
            FROM restaurants r
            LEFT JOIN reviews rv ON r.id = rv.restaurant_id
            WHERE (
                r.name LIKE ? 
                OR r.address LIKE ? 
                OR r.description LIKE ?
            )
            AND r.is_active = true
        `;
        
        const params = [searchParam, searchParam, searchParam];
        
        // Добавляем фильтр по категории, если она указана
        if (category && category !== 'all') {
            sql += ' AND r.category = ?';
            params.push(category);
        }
        
        sql += `
            GROUP BY r.id
            ORDER BY 
                CASE 
                    WHEN r.name LIKE ? THEN 0 
                    WHEN r.name LIKE ? THEN 1
                    ELSE 2 
                END,
                avg_rating DESC,
                r.name
        `;
        
        params.push(`${query}%`, `%${query}%`);
        
        const [rows] = await pool.execute(sql, params);
        
        return rows.map(restaurant => ({
            ...restaurant,
            avg_rating: parseFloat(restaurant.avg_rating) || 0,
            review_count: parseInt(restaurant.review_count) || 0
        }));
    }

    /**
     * Обновить категорию ресторана
     * @param {number} id - ID ресторана
     * @param {string} category - Новая категория
     * @returns {Promise<boolean>} - Результат обновления
     */
    async updateCategory(id, category) {
        try {
            await this.ensureColumnsExistBeforeOperation();
            
            console.log('Updating category for restaurant:', id, 'to:', category);
            
            const [result] = await pool.execute(
                'UPDATE restaurants SET category = ? WHERE id = ?',
                [category, id]
            );
            
            console.log('Update result:', result);
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating restaurant category:', error);
            throw error;
        }
    }
}

module.exports = new RestaurantModel(); 