// index.js

// Підключаємо необхідні бібліотеки
const express = require('express');
const axios = require('axios');
require('dotenv').config(); // Для використання змінних оточення (наприклад, для локального тестування)

// Створюємо Express-додаток
const app = express();
// Додаємо middleware для парсингу JSON-тіла запитів
app.use(express.json());

// Отримуємо URL вебхука Make.com зі змінних оточення
// Це критично важливо для безпеки та гнучкості
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

// Створюємо основний маршрут (endpoint), який буде слухати Wazzup
// Наприклад, /api/webhook
app.post('/webhook', async (req, res) => {
  console.log('Отримано вебхук від Wazzup:', JSON.stringify(req.body, null, 2));

  // --- ЛОГІКА ФІЛЬТРАЦІЇ ---
  // Ми перевіряємо, чи існує в тілі запиту ключ "messages"
  // і чи цей масив не є порожнім.
  // Статуси приходять з ключем "statuses", тому вони не пройдуть цю перевірку.
  if (req.body.messages && req.body.messages.length > 0) {
    console.log('Це нове повідомлення. Пересилаємо в Make.com...');

    try {
      // Пересилаємо оригінальний запит на вебхук Make.com
      await axios.post(MAKE_WEBHOOK_URL, req.body);
      console.log('Успішно переслано в Make.com.');
    } catch (error) {
      console.error('Помилка при пересиланні в Make.com:', error.message);
      // Тут можна додати логіку для сповіщення про помилки
    }
  } else {
    // Якщо це не нове повідомлення (наприклад, статус), просто ігноруємо його
    console.log('Це статус або інша подія. Ігноруємо.');
  }

  // В будь-якому випадку відповідаємо Wazzup статусом 200 OK.
  // Це означає, що ми успішно отримали їхній вебхук.
  // Якщо цього не зробити, Wazzup буде вважати, що наш сервіс не працює.
  res.sendStatus(200);
});

// Запускаємо сервер на порту, який надає Render, або на 3000 для локального тестування
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Проксі-сервер запущено на порту ${PORT}`);
});
