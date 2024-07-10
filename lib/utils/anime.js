const { ANIME } = require("@consumet/extensions");
const gogoanime = new ANIME.Gogoanime();

const RecentEpisodes = async (page = 1, type = 1) => {
  try {
    const data = await gogoanime.fetchRecentEpisodes(page, type);
    return data;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getAnimeInfo = async (id) => {
  try {
    const data = await gogoanime.fetchAnimeInfo(id);
    return data;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getAnimedl = async (id) => {
  try {
    const data = await gogoanime.fetchEpisodeSources(id);
    return data;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getAnimeserver = async (id) => {
  try {
    const data = await gogoanime.fetchEpisodeServers(id);
    return data;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  RecentEpisodes,
  getAnimeInfo,
  getAnimedl,
  getAnimeserver,
};
