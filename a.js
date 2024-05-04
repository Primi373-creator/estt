const RecentEpisodes = require('./lib/utils/anime');

async function fetchData() {
    const type = 1;
    const page = 1; 
    
    // Fetch data
    const data = await RecentEpisodes(page, type);
    
    // Destructure data
    const { results, currentPage, hasNextPage } = data;
    
    // Log the data
    console.log(data);
}

// Call the fetchData function
fetchData();
