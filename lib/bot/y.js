const { RecentEpisodes } = require("../utils/anime/gogoanime.js");
const {
  startKeyboard,
  helpKeyboard,
  errorKeyboard,
  adminKeyboard,
  AnimeActionsKeyboard,
} = require("../buttons.js");
const User = require("../../models/user.js");

class client {
  constructor(bot) {
    this.bot = bot;
    this.currentPage = 1;
    this.currentResults = [];
    this.currentEpisodeIndex = 0;

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
    });

    this.bot.on("message", async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      switch (text) {
        case "Anime 🎥":
          this.bot.sendMessage(chatId, "Select an option:", {
            reply_markup: {
              keyboard: AnimeActionsKeyboard,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
          break;
        case "Admin 👑":
          this.bot.sendMessage(chatId, "Welcome to the admin dashboard", {
            reply_markup: {
              keyboard: adminKeyboard,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
          break;
        case "Back ⬅️":
          this.bot.sendMessage(chatId, "select an option", {
            reply_markup: {
              keyboard: startKeyboard,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
          break;
        case "Help 🆘":
          this.bot.sendMessage(chatId, "need some help?", {
            reply_markup: {
              keyboard: helpKeyboard,
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          });
          break;
        case "Home 🏠":
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
      await this.sendEpisode(chatId);
    }
  }

  async handleNextPage(chatId) {
    this.currentPage++;
    await this.fetchRecentEpisodes(chatId);
  }

  async sendEpisode(chatId) {
    const episode = this.currentResults[this.currentEpisodeIndex];
    this.bot.sendPhoto(chatId, episode.image, {
      caption: `📺 Title: ${episode.title}\n🔢 Current Ep No: ${episode.episodeNumber}`,
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
          [{ text: "📺 anime info", url: episode.url }],
        ],
      },
    });
  }

  async handleDownloadEpisode(chatId, data) {
    try {
      if (data.startsWith("download_episode_")) {
        const episodeId = data.split("_")[1];
      }
    } catch (error) {
      console.error(error);
      this.bot.sendMessage(chatId, "Failed to process the request.");
    }
  }
}

module.exports = client;
