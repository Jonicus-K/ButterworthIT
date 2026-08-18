module.exports = function(eleventyConfig) {
    // 1. Static Asset Passthroughs (Preserved & Expanded)
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy("src/robots.txt");
    eleventyConfig.addPassthroughCopy("src/ads.txt");
    eleventyConfig.addPassthroughCopy("src/sw.js");
    eleventyConfig.addPassthroughCopy("src/manifest.json");

    // 2. Automated Tools Collection
    // Automatically compiles any page containing 'category' & 'title' in frontmatter
    eleventyConfig.addCollection("tools", function(collectionApi) {
        return collectionApi.getAll()
            .filter(item => item.data.category && item.data.title)
            .sort((a, b) => (a.data.order || 99) - (b.data.order || 99));
    });

    // 3. Category Filter for Nunjucks Templates
    eleventyConfig.addFilter("filterByCategory", function(tools, categoryKey) {
        if (!Array.isArray(tools)) return [];
        return tools.filter(tool => tool.data.category === categoryKey);
    });

    // 4. Build Directories
    return {
        dir: {
            input: "src",
            includes: "../_includes",
            output: "_site"
        }
    };
};