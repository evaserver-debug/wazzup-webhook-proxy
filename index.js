// index.js

const express = require('express');
const axios = require('axios');

// Завантажуємо змінні з .env файлу тільки якщо ми НЕ на продакш-сервері
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();
app.use(express.json());

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

app.post('/webhook', async (req, res) => {
  console.log('Отримано вебхук від Wazzup:', JSON.stringify(req.body, null, 2));

  if (req.body.messages && req.body.messages.length > 0) {
    console.log('Це нове повідомлення. Пересилаємо в Make.com...');

    // Перевіряємо, чи є URL для Make.com
    if (!MAKE_WEBHOOK_URL) {
      console.error('Помилка: змінна MAKE_WEBHOOK_URL не встановлена!');
      // Відповідаємо Wazzup, щоб він не намагався відправити запит знову
      return res.sendStatus(200); 
    }
    
    try {
      await axios.post(MAKE_WEBHOOK_URL, req.body);
      console.log('Успішно переслано в Make.com.');
    } catch (error) {
      console.error('Помилка при пересиланні в Make.com:', error.message);
    }
  } else {
    console.log('Це статус або інша подія. Ігноруємо.');
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Проксі-сервер запущено на порту ${PORT}`);
  // Цей лог допоможе перевірити, чи правильно підтягнулася змінна
  console.log(`Повідомлення пересилаються на: ${MAKE_WEBHOOK_URL ? MAKE_WEBHOOK_URL.substring(0, 30) + '...' : 'URL НЕ ВСТАНОВЛЕНО'}`);
});
