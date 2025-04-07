# Используем образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем всё содержимое папки backend в контейнер
COPY . .

# Открываем порт 5000
EXPOSE 5000

# Указываем команду запуска
<<<<<<< HEAD
CMD ["npm", "run", "start"]
=======
CMD ["npm", "run", "dev"]
>>>>>>> c0de413dc1865264c2ef241c20aa63fec52080b1
