export default async function handler(req, res) {
    // Разрешаем только POST-запросы
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Получаем данные с сайта
    const { email, name, reason, lang } = req.body;

    // Достаем секретные ключи из настроек Vercel
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Формируем сообщение
    const captionText = `🔴 НОВЫЙ ЗАКАЗ (${lang.toUpperCase()})\n\nEmail: ${email}\nИмя жертвы: ${name}\nПричина: ${reason || 'Не указана'}`;

    try {
        // Отправляем запрос в Telegram
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: captionText })
        });

        const data = await response.json();
        if (data.ok) {
            res.status(200).json({ success: true });
        } else {
            res.status(500).json({ error: 'Telegram Error' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
}
