export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, name, reason, lang, photoBase64 } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const captionText = `🔴 НОВЫЙ ЗАКАЗ (${lang.toUpperCase()})\n\nEmail: ${email}\nИмя жертвы: ${name}\nПричина: ${reason || 'Не указана'}`;

    try {
        if (photoBase64) {
            // Если есть фото: превращаем код обратно в картинку
            const base64Data = photoBase64.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const blob = new Blob([buffer], { type: 'image/jpeg' });
            
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('caption', captionText);
            formData.append('photo', blob, 'target.jpg');

            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.ok) {
                res.status(200).json({ success: true });
            } else {
                res.status(500).json({ error: 'Telegram Error', details: data });
            }

        } else {
            // Если фото нет: отправляем просто текст
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: captionText })
            });

            const data = await response.json();
            if (data.ok) {
                res.status(200).json({ success: true });
            } else {
                res.status(500).json({ error: 'Telegram Error', details: data });
            }
        }
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Server Error' });
    }
}
