const TelegramBot = require("node-telegram-bot-api");
const User = require("../../models/user.js");
const { RecentEpisodes } = require("../utils/anime/gogoanime.js");
const {
  startKeyboard,
  helpKeyboard,
  errorKeyboard,
  adminKeyboard,
  AnimeActionsKeyboard,
} = require("../buttons.js");

class client {
  constructor(bot) {
    this.bot = bot;
    this.currentPage = 1;
    this.currentResults = [];
    this.currentEpisodeIndex = 0;
    this.messageId = null;
    this.messageTimestamp = null;
    this.currentKeyboard = startKeyboard;
    this.previousKeyboard = null;

    this.initialize();
  }

  initialize() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const username = msg.from.username;
      await User.findOneAndUpdate({ chatId }, { username }, { upsert: true });

      this.bot.sendMessage(
        chatId,
        "Welcome to the Anime Bot! What would you like to do?",
        {
          reply_markup: {
            keyboard: startKeyboard,
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        }
      );
      this.currentKeyboard = startKeyboard;
      this.previousKeyboard = null;
    });

    this.bot.on("message", async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      switch (text) {
        case "Anime 🎥":
          this.updateKeyboards(AnimeActionsKeyboard);
          this.bot.sendMessage(chatId, "Select an option:", {
            reply_markup: {
              keyboard: AnimeActionsKeyboard,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
          break;
        case "Admin 👑":
          this.updateKeyboards(adminKeyboard);
          this.bot.sendMessage(chatId, "Welcome to the admin dashboard", {
            reply_markup: {
              keyboard: adminKeyboard,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
          break;
        case "Back ⬅️":
          this.bot.sendMessage(chatId, "Select an option", {
            reply_markup: {
              keyboard: this.previousKeyboard || startKeyboard,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
          this.currentKeyboard = this.previousKeyboard || startKeyboard;
          this.previousKeyboard = null;
          break;
        case "Help 🆘":
          this.updateKeyboards(helpKeyboard);
          this.bot.sendMessage(chatId, "Need some help?", {
            reply_markup: {
              keyboard: helpKeyboard,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
          break;
        case "Home 🏠":
          this.updateKeyboards(startKeyboard);
          this.bot.sendMessage(chatId, "What would you like to do?", {
            reply_markup: {
              keyboard: startKeyboard,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
          break;
        case "Fetch Recent Episodes 📺":
          await this.fetchRecentEpisodes(chatId);
          break;
      }
    });

    this.bot.on("callback_query", async (query) => {
      const chatId = query.message.chat.id;
      const messageId = query.message.message_id;
      const data = query.data;

      switch (data) {
        case "next_episode":
          await this.handleNextEpisode(chatId);
          break;
        case "next_page":
          await this.handleNextPage(chatId);
          break;
        default:
          await this.handleDownloadEpisode(chatId, data);
          break;
      }
    });
  }

  updateKeyboards(newKeyboard) {
    this.previousKeyboard = this.currentKeyboard;
    this.currentKeyboard = newKeyboard;
  }

  async fetchRecentEpisodes(chatId) {
    try {
      const recentEpisodes = await RecentEpisodes(this.currentPage);
      this.currentResults = recentEpisodes.results;

      if (this.currentResults.length > 0) {
        this.currentEpisodeIndex = 0;
        await this.sendEpisode(chatId);
      } else {
        this.bot.sendMessage(chatId, "No recent episodes found.", {
          reply_markup: {
            keyboard: errorKeyboard,
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      }
    } catch (err) {
      console.error(err);
      this.bot.sendMessage(chatId, "Failed to fetch recent episodes.", {
        reply_markup: {
          keyboard: errorKeyboard,
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
    }
  }

  async handleNextEpisode(chatId) {
    if (this.currentResults.length > 0) {
      this.currentEpisodeIndex =
        (this.currentEpisodeIndex + 1) % this.currentResults.length;
      await this.sendEpisode(chatId, true);
    }
  }

  async handleNextPage(chatId) {
    this.currentPage++;
    try {
      const recentEpisodes = await RecentEpisodes(this.currentPage);
      if (recentEpisodes.results.length === 0) {
        this.bot.sendMessage(chatId, "You've reached the end of the pages.", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "⬅️ Back", callback_data: "previous_page" }],
            ],
          },
        });
      } else {
        this.currentResults = recentEpisodes.results;
        this.currentEpisodeIndex = 0;
        await this.sendEpisode(chatId, true);
      }
    } catch (err) {
      console.error(err);
      this.bot.sendMessage(chatId, "Failed to fetch recent episodes.", {
        reply_markup: {
          keyboard: errorKeyboard,
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
    }
  }

  async sendEpisode(chatId, deletePrevious = false) {
    const currentTime = Math.floor(Date.now() / 1000);
    if (deletePrevious && this.messageId && this.messageTimestamp) {
      if (currentTime - this.messageTimestamp <= 1800) {
        try {
          await this.bot.deleteMessage(chatId, this.messageId);
        } catch (err) {
          console.error(`Failed to delete message: ${err.message}`);
        }
      }
    }
    const episode = this.currentResults[this.currentEpisodeIndex];
    const caption = `📺 Title: ${episode.title}\n🔢 Current Ep No: ${episode.episodeNumber}\n📄 Page: ${this.currentPage}`;
    const sentMessage = await this.bot.sendPhoto(chatId, episode.image, {
      caption,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📥 Download current ep",
              callback_data: `download_episode_${episode.episodeId}`,
            },
          ],
          [
            { text: "➡️ Next Page", callback_data: "next_page" },
            { text: "➡️ Next", callback_data: "next_episode" },
          ],
          [{ text: "📺 Anime info", url: episode.url }],
        ],
      },
    });
    this.messageId = sentMessage.message_id;
    this.messageTimestamp = currentTime;
  }

  async handleDownloadEpisode(chatId, episodeId) {
    // Implement your logic for handling episode download here
    // Example: this.bot.sendMessage(chatId, `Downloading episode ${episodeId}...`);
  }
}

module.exports = client;
