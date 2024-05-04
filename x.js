// Handle the response to send relevant information to the user
// You can use Telegram API methods here to send messages with inline buttons
// For example, you can loop through data.results and send each anime's information with an inline button for navigation

const { results, currentPage, hasNextPage } = data;

// Loop through each anime in the results
results.forEach(anime => {
    const { id, title, image, url } = anime;

    const message = `
    Title: ${title}
    ID: ${id}
    `;
    
    bot.sendPhoto(chatId, image, { caption: message, 
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Watch Now', url: url }],
            ]
        }
    });
});

if (hasNextPage) {
    bot.sendMessage(chatId, 'Would you like to see more recent episodes?', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Next Page', callback_data: 'next_page' }]
            ]
        }
    });
}