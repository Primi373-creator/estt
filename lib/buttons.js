const startKeyboard = [
    [{ text: 'Anime 🎥' }, { text: 'Manga 📚' },{ text: 'Books 📖' }],
    [{ text: 'Movies 🎬' }, { text: 'Light Novels 📜' },{ text: 'Comics 📰' }],
    [{ text: 'Meta 🛠️' }, { text: 'News 📰' }, { text: 'Help 🆘' }]
];

const helpKeyboard = [
    [{ text: 'Admin 👑' }, { text: 'About 👑' }, { text: 'Report 🚨' }],
    [{ text: 'Back ⬅️' }]
];

const AnimeActionsKeyboard = [
        [{ text: `Search 🔍` }, { text: `Fetch Recent Episodes 📺` }],
        [{ text: `Fetch Top Airing 🚀` }, { text: `Fetch Anime List 📜` }],
        [{ text: `Fetch Anime Info ℹ️` }, { text: `Fetch Episode Sources 📡` }],
        [{ text: `Fetch Episode Servers 🖥️` }],
        [{ text: 'Back ⬅️' }, { text: 'Home 🏠' }]
    ];

const adminKeyboard = [
    [{ text: 'Ban 🚫' }, { text: 'Unban ✅' }, { text: 'Ping 🏓' }],
    [{ text: 'Broadcast 📢' }, { text: 'Status ℹ️' }],
    [{ text: 'All Users 👤' }],
    [{ text: 'Back ⬅️' }]
];

const errorKeyboard = [
    [{ text: 'Back ⬅️' }, { text: 'Report 🚨' }]
];

module.exports = {
    startKeyboard,
    errorKeyboard,
    adminKeyboard,
    helpKeyboard,
    AnimeActionsKeyboard
};
