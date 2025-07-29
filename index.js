const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;
const BOT_CHANNEL_ID = '82a122a6-f059-424e-ba4a-6b218b0ff788'; // ID бота

app.post('/webhook', async (req, res) => {
  console.log('Отримано вебхук від Wazzup:', JSON.stringify(req.body, null, 2));

  const messages = req.body.messages;

  if (messages && messages.length > 0) {
    // 🔍 Відфільтровуємо повідомлення тільки з потрібного каналу і які не є echo
    const userMessages = messages.filter(
      msg => msg.channelId === BOT_CHANNEL_ID && msg.isEcho !== true
    );

    if (userMessages.length > 0) {
      console.log('Це нове повідомлення від користувача. Пересилаємо в Make.com...');

      if (!MAKE_WEBHOOK_URL) {
        console.error('Помилка: змінна MAKE_WEBHOOK_URL не встановлена!');
        return res.sendStatus(200);
      }

      try {
        await axios.post(MAKE_WEBHOOK_URL, { ...req.body, messages: userMessages });
        console.log('✅ Успішно переслано в Make.com.');
      } catch (error) {
        console.error('❌ Помилка при пересиланні в Make.com:', error.message);
      }
    } else {
      console.log('🔕 Повідомлення або echo, або з іншого каналу. Ігноруємо.');
    }
  } else {
    console.log('Це статус або інша подія. Ігноруємо.');
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Проксі-сервер запущено на порту ${PORT}`);
  console.log(`Повідомлення пересилаються на: ${MAKE_WEBHOOK_URL ? MAKE_WEBHOOK_URL.substring(0, 30) + '...' : 'URL НЕ ВСТАНОВЛЕНО'}`);
});
