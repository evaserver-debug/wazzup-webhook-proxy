const express = require('express');
const axios = require('axios'); // Для виконання HTTP-запитів до основного додатка
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000; // Render надасть змінну PORT

// URL вашого основного додатка, куди будуть пересилатися тільки повідомлення
const MAIN_APP_WEBHOOK_URL = process.env.https://hook.eu2.make.com/jq47qrrjinc0lyi4k6fl2qji43n9w4bc || ;

// Використовуємо body-parser для читання JSON тіла запиту
app.use(bodyParser.json());

// Головний ендпоінт для отримання вебхуків від Wazzup
app.post('/wazzup-webhook', async (req, res) => {
    const data = req.body;
    console.log('Received webhook from Wazzup:', JSON.stringify(data, null, 2));

    try {
        // Wazzup надсилає масив "bundles" або "statuses"
        // На основі вашого прикладу, він надсилає "statuses"
        // Але якщо будуть також і "messages", потрібно перевірити наявність відповідних полів
        // Wazzup API досить гнучке, тому перевіряємо, чи є ключ "statuses" або "messages"

        let isStatusUpdate = false;
        if (data.statuses && Array.isArray(data.statuses)) {
            // Це пачка оновлень статусів
            isStatusUpdate = true;
            console.log('Detected status update, ignoring.');
        } else if (data.messages && Array.isArray(data.messages)) {
            // Це пачка нових повідомлень
            // Wazzup може надсилати "messages" у вигляді масиву
            // Або ж окреме поле "type": "message" як обговорювали раніше, залежить від конфігурації
            const firstMessage = data.messages[0]; // Припустимо, що нас цікавить перший об'єкт у масиві
            if (firstMessage && firstMessage.type === 'message') {
                console.log('Detected new message, forwarding...');
                await axios.post(MAIN_APP_WEBHOOK_URL, data); // Пересилаємо весь отриманий бандл
                console.log('Message forwarded successfully.');
            } else {
                console.log('Detected other type of message/event, ignoring or forwarding if needed.');
                // Ви можете додати логіку для інших типів повідомлень тут, якщо вони є і вас цікавлять
            }
        } else if (data.type === 'message') {
            // Якщо Wazzup надсилає окремі події з полем "type"
            console.log('Detected individual message, forwarding...');
            await axios.post(MAIN_APP_WEBHOOK_URL, data);
            console.log('Message forwarded successfully.');
        } else if (data.type === 'status') {
            console.log('Detected individual status update, ignoring.');
            isStatusUpdate = true;
        } else {
            console.log('Unknown webhook type received, ignoring or handling as needed:', data);
        }

        // Завжди відповідаємо 200 OK, щоб Wazzup знав, що ми отримали запит
        res.status(200).send('Webhook received and processed');

    } catch (error) {
        console.error('Error processing webhook or forwarding:', error.message);
        // Важливо: Навіть при помилці, краще повернути 200 OK до Wazzup,
        // інакше Wazzup може повторювати запити або деактивувати вебхук.
        // Обробляйте помилки перенаправлення внутрішньо.
        res.status(200).send('Webhook received but an internal error occurred');
    }
});

// Запускаємо сервер
app.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
    console.log(`Forwarding messages to: ${MAIN_APP_WEBHOOK_URL}`);
});
