module.exports = function(eleventyConfig) {
    // Passthrough static directories and root assets
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy("src/robots.txt");
    eleventyConfig.addPassthroughCopy("src/ads.txt");
    eleventyConfig.addPassthroughCopy("src/sw.js");
    eleventyConfig.addPassthroughCopy("src/manifest.json");

    // Tools Collection: Grabs all pages with frontmatter category
    eleventyConfig.addCollection("tools", function(collectionApi) {
        return collectionApi.getAll()
            .filter(item => Boolean(item.data.category) && Boolean(item.data.title))
            .sort((a, b) => (Number(a.data.order) || 99) - (Number(b.data.order) || 99));
    });

    // Category Filter: Strict match against frontmatter category string
    eleventyConfig.addFilter("filterByCategory", function(tools, categoryKey) {
        if (!Array.isArray(tools)) return [];
        return tools.filter(tool => String(tool.data.category).toLowerCase() === String(categoryKey).toLowerCase());
    });

    return {
        dir: {
            input: "src",
            includes: "../_includes",
            output: "_site"
        }
    };
};