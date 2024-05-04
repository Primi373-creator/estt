const TelegramBot = require('node-telegram-bot-api');
const { RecentEpisodes, getAnimeInfo, getAnimeserver, getAnimedl } = require('./lib/utils/anime');
const { startKeyboard, helpKeyboard,errorKeyboard, adminKeyboard, AnimeActionsKeyboard } = require('./lib/buttons.js');
const User = require('./models/user.js');
const mongoose = require('mongoose');
const config = require('./config.js')

const bot = new TelegramBot(config.TOKEN, { polling: true });
mongoose.connect(config.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username;
    await User.findOneAndUpdate({ chatId }, { username }, { upsert: true });

    bot.sendMessage(chatId, 'Welcome to the Anime Bot! What would you like to do?', {
        reply_markup: {
            keyboard: startKeyboard,
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
});

let currentPage = 1;
let currentResults = [];
let currentEpisodeIndex = 0;
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    switch (text) {
        case 'Anime 🎥':
            bot.sendMessage(chatId, 'Select an option:', {
                reply_markup: {
                    keyboard: AnimeActionsKeyboard,
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
            break;
        case 'Admin 👑':
            bot.sendMessage(chatId, 'Welcome to the admin dashboard', {
                reply_markup: {
                        keyboard: adminKeyboard,
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                });
            break;
        case 'Back ⬅️':
            bot.sendMessage(chatId, 'select an option', {
                reply_markup: {
                    keyboard: startKeyboard,
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
            break;
        case 'Help 🆘':
            bot.sendMessage(chatId, 'need some help?', {
                reply_markup: {
                    keyboard: helpKeyboard,
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
            break;
        case 'Home 🏠':
            bot.sendMessage(chatId, 'What would you like to do?', {
                reply_markup: {
                    keyboard: startKeyboard,
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
            break;
            case 'Fetch Recent Episodes 📺':
            try {
                const recentEpisodes = await RecentEpisodes(currentPage);
                currentResults = recentEpisodes.results;

                if (currentResults.length > 0) {
                    const episode = currentResults[currentEpisodeIndex];
                    console.log(episode)
                    bot.sendPhoto(chatId, episode.image, {
                        caption: `📺 Title: ${episode.title}\n🔢 Current Ep No: ${episode.episodeNumber}`,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '📥 Download current ep', callback_data: `download_episode_${episode.episodeId}` }],
                                [{ text: '➡️ Next Page', callback_data: 'next_page' },{ text: '➡️ Next', callback_data: 'next_episode' }],
                                [{ text: '📺 anime info', url: episode.url }]
                            ]                            
                        }
                    });
                } else {
                    bot.sendMessage(chatId, 'No recent episodes found.', {
                        reply_markup: {
                            keyboard: errorKeyboard,
                            resize_keyboard: true,
                            one_time_keyboard: true
                        }
                    });
                }
            } catch (err) {
                console.error(err);
                bot.sendMessage(chatId, 'Failed to fetch recent episodes.', {
                    reply_markup: {
                        keyboard: errorKeyboard,
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                });
            }
            break;
    }
});











bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;


    switch (data) {
        case 'next_episode':
            if (currentResults.length > 0) {
                currentEpisodeIndex = (currentEpisodeIndex + 1) % currentResults.length;
                const nextEpisode = currentResults[currentEpisodeIndex];
                bot.sendPhoto(chatId, nextEpisode.image, {
                    caption: `📺 Title: ${nextEpisode.title}\n🔢 Current Ep No: ${nextEpisode.episodeNumber}`,
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '📥 Download current ep', callback_data: `download_episode_${nextEpisode.episodeId}` }],
                            [{ text: '➡️ Next Page', callback_data: 'next_page' },{ text: '➡️ Next', callback_data: 'next_episode' }],
                            [{ text: '📺 Gogoanime info', url: nextEpisode.url }]
                        ]
                    }
                });
            }
            break;
        case 'next_page':
            currentPage++;
            try {
                const recentEpisodes = await RecentEpisodes(currentPage);
                currentResults = recentEpisodes.results;
                if (currentResults.length > 0) {
                    const episode = currentResults[0];
                    bot.sendPhoto(chatId, episode.image, {
                        caption: `📺 Title: ${episode.title}\n🔢 Current Ep No: ${episode.episodeNumber}`,
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '📥 Download current ep', callback_data: `download_episode_${episode.episodeId}` }],
                                [{ text: '➡️ Next Page', callback_data: 'next_page' },{ text: '➡️ Next', callback_data: 'next_episode' }],
                                [{ text: '📺 Gogoanime info', url: episode.url }]
                            ]
                        }
                    });
                } else {
                    bot.sendMessage(chatId, 'No more recent episodes found.', {
                        reply_markup: {
                            keyboard: errorKeyboard,
                            resize_keyboard: true,
                            one_time_keyboard: true
                        }
                    });
                }
            } catch (err) {
                console.error(err);
                bot.sendMessage(chatId, 'Failed to fetch more recent episodes.', {
                    reply_markup: {
                        keyboard: errorKeyboard,
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                });
            }
            break;    
            default:
    try {
        if (data.startsWith('download_episode_')) {
            const episodeId = data.split('_')[2];
            const animeDetails = await getAnimeserver(episodeId);
            const randomIndex = Math.floor(Math.random() * animeDetails.length);
            const Url = 'https://gredirect.info/download.php?url=aHR0cHM6LyAdeqwrwedffryretgsdFrsftrsvfsfsr96YmNhanAdrefsdsdfwerFrefdsfrersfdsrfer36343534Zyc3ViLmFuZjU5OC5jb20vdXNlcjEzNDIvYjZiYWJkZjczM2MyYzRkNzFhNGU0NDRhNjExZTM4MmYvRVAuNDgudjAuMTcxNDgwMDAwNi4zNjBwLm1wND90b2tlbj1zbWhkeFV1S3ZtRC1PaHJYVkpJdTdRJmV4cGlyZXM9MTcxNDgxNjM0MiZpZD0yMjQ5Mzg='
            console.log(Url)
            bot.sendVideo(chatId, Url).then(() => {
                bot.sendMessage(chatId, `Download the video [here](${jsonData.download})`, { parse_mode: 'Markdown' });
            }).catch(error => {
                console.error('Error sending video:', error);
                bot.sendMessage(chatId, 'Failed to send the video.');
            });
        }
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, 'Failed to process the request.');
    }
    break;
    }
});
