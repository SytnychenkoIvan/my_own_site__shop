export const handler = async (event) => {
	// Разрешаем только POST-запросы
	if (event.httpMethod !== 'POST') {
		return {
			statusCode: 405,
			body: JSON.stringify({
				success: false,
				message: 'Method Not Allowed',
			}),
		};
	}

	try {
		// Получаем данные из формы
		const { name, phone, message } = JSON.parse(event.body);

		// Проверяем обязательные поля
		if (!name || !phone) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					success: false,
					message: 'Имя и телефон обязательны',
				}),
			};
		}

		// Формируем сообщение для Telegram
		const text = `
📩 Новая заявка с сайта

👤 Имя: ${name}
📞 Телефон: ${phone}
💬 Сообщение: ${message || '—'}
`;

		// Отправляем сообщение в Telegram
		const response = await fetch(
			`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					chat_id: process.env.TELEGRAM_CHAT_ID,
					text,
				}),
			}
		);

		// Проверяем ответ Telegram
		if (!response.ok) {
			const errorData = await response.text();

			console.error('Telegram API error:', errorData);

			return {
				statusCode: 500,
				body: JSON.stringify({
					success: false,
					message: 'Ошибка Telegram API',
				}),
			};
		}

		// Успешная отправка
		return {
			statusCode: 200,
			body: JSON.stringify({
				success: true,
				message: 'Заявка отправлена',
			}),
		};
	} catch (error) {
		console.error('Function error:', error);

		return {
			statusCode: 500,
			body: JSON.stringify({
				success: false,
				message: 'Внутренняя ошибка сервера',
			}),
		};
	}
};