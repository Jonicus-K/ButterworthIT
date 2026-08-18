module.exports = function(eleventyConfig) {
    // Passthrough copies for assets and config files
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy("src/robots.txt");
    eleventyConfig.addPassthroughCopy("src/ads.txt");
    eleventyConfig.addPassthroughCopy("src/sw.js");
    eleventyConfig.addPassthroughCopy("src/manifest.json");

    // Global tools collection sorted by order
    eleventyConfig.addCollection("tools", function(collectionApi) {
        return collectionApi.getAll()
            .filter(item => Boolean(item.data.category) && Boolean(item.data.title))
            .sort((a, b) => (Number(a.data.order) || 99) - (Number(b.data.order) || 99));
    });

    return {
        dir: {
            input: "src",
            includes: "../_includes",
            output: "_site"
        }
    };
};