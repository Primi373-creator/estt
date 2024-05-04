const axios = require("axios");
const config = require('../../config.js');

const RecentEpisodes = async (page = 1, type = 1) => {
    try {
        const url = `${config.BASE_URL}anime/gogoanime/recent-episodes`;
        const { data } = await axios.get(url, { params: { page, type } });
        return data;
    } catch (err) {
        throw new Error(err.message);
    }
};

const getAnimeInfo = async (id) => {
    try {
        const url = `${config.BASE_URL}anime/gogoanime/info/${id}`;
        const { data } = await axios.get(url);
        return data;
    } catch (err) {
        throw new Error(err.message);
    }
};

const getAnimedl = async (id) => {
    try {
        const url = `${config.BASE_URL}anime/gogoanime/watch/${id}`;
        const { data } = await axios.get(url);
        return data;
    } catch (err) {
        throw new Error(err.message);
    }
};

const getAnimeserver = async (id) => {
    try {
        const url = `${config.BASE_URL}anime/gogoanime/servers/${id}`;
        const { data } = await axios.get(url);
        return data;
    } catch (err) {
        throw new Error(err.message);
    }
};


module.exports = {
    RecentEpisodes,
    getAnimeInfo,
    getAnimedl,
    getAnimeserver
};