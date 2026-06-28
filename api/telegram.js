export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { date, time } = request.body;

    if (!date || !time) {
      return response.status(400).json({ error: "Missing date or time" });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const message = `🌸 Bel accepted the date invitation!\n\n📅 ${date}\n🕖 ${time}\n\nTime to plan. ❤️`;

    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });

    if (!telegramResponse.ok) {
      throw new Error("Telegram request failed");
    }

    return response.status(200).json({ success: true });
  } catch (error) {
    return response.status(500).json({ error: "Failed to send Telegram message" });
  }
}
