export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    try {
        // Gumroad sends data as x-www-form-urlencoded
        let body = req.body;

        // If body is a string (URL-encoded), parse it
        if (typeof body === 'string') {
            body = Object.fromEntries(new URLSearchParams(body));
        }

        const email = body.email || body.purchaser_id || 'Unknown';
        const productName = body.product_name || body.product_permalink || 'Villain Hitting';
        const price = body.price || body.formatted_display_price || 'Unknown';

        const message = `✅ ОПЛАТА ПОДТВЕРЖДЕНА (Gumroad)\n\n` +
            `Email покупателя: ${email}\n` +
            `Продукт: ${productName}\n` +
            `Сумма: ${price}\n\n` +
            `👆 Найдите заказ с этим email выше`;

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message })
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Gumroad webhook error:", error);
        res.status(200).json({ success: true }); // Always return 200 so Gumroad doesn't retry
    }
}
