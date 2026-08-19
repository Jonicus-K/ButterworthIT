module.exports = function(eleventyConfig) {
    // 1. Passthrough copies for static assets
    eleventyConfig.addPassthroughCopy({ "src/css": "css" });
    eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
    eleventyConfig.addPassthroughCopy({ "src/sw.js": "sw.js" });

    // Optional config files (copies if present, ignores if absent)
    eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
    eleventyConfig.addPassthroughCopy({ "src/ads.txt": "ads.txt" });
    eleventyConfig.addPassthroughCopy({ "src/manifest.json": "manifest.json" });

    // 2. Global tools collection sorted by order index
    eleventyConfig.addCollection("tools", function(collectionApi) {
        return collectionApi.getAll()
            .filter(item => Boolean(item.data.category) && Boolean(item.data.title))
            .sort((a, b) => (Number(a.data.order) || 99) - (Number(b.data.order) || 99));
    });

    return {
        templateFormats: ["html", "njk", "md"],
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk",
        dataTemplateEngine: "njk",
        dir: {
            input: "src",
            includes: "../_includes",
            output: "_site"
        }
    };
};