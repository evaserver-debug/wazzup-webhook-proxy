// index.js

const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

app.post('/webhook', async (req, res) => {
  console.log('Отримано вебхук від Wazzup:', JSON.stringify(req.body, null, 2));

  const messages = req.body.messages;

  // Перевіряємо, чи є повідомлення та чи це НЕ echo
  if (messages && messages.length > 0) {
    // Фільтруємо тільки ті повідомлення, які не є echo
    const userMessages = messages.filter(msg => msg.isEcho !== true);

    if (userMessages.length > 0) {
      console.log('Це нове повідомлення від користувача. Пересилаємо в Make.com...');

      if (!MAKE_WEBHOOK_URL) {
        console.error('Помилка: змінна MAKE_WEBHOOK_URL не встановлена!');
        return res.sendStatus(200);
      }

      try {
        await axios.post(MAKE_WEBHOOK_URL, { ...req.body, messages: userMessages });
        console.log('Успішно переслано в Make.com.');
      } catch (error) {
        console.error('Помилка при пересиланні в Make.com:', error.message);
      }
    } else {
      console.log('Усі повідомлення — це echo. Ігноруємо.');
    }
  } else {
    console.log('Це статус або інша подія. Ігноруємо.');
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Проксі-сервер запущено на порту ${PORT}`);
  console.log(`Повідомлення пересилаються на: ${MAKE_WEBHOOK_URL ? MAKE_WEBHOOK_URL.substring(0, 30) + '...' : 'URL НЕ ВСТАНОВЛЕНО'}`);
});
