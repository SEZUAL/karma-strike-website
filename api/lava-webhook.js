export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    try {
        const body = req.body;

        // LavaTop sends JSON with payment details
        const email = body.email || body.buyer_email || body.customer_email || 'Unknown';
        const amount = body.amount || body.price || 'Unknown';
        const status = body.status || body.event || body.type || 'payment.success';

        // Only send notification for successful payments
        if (status === 'payment.failed') {
            return res.status(200).json({ success: true });
        }

        const message = `✅ ОПЛАТА ПОДТВЕРЖДЕНА (LavaTop)\n\n` +
            `Email покупателя: ${email}\n` +
            `Сумма: ${amount}\n` +
            `Статус: ${status}\n\n` +
            `👆 Найдите заказ с этим email выше`;

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message })
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("LavaTop webhook error:", error);
        res.status(200).json({ success: true }); // Always return 200
    }
}
