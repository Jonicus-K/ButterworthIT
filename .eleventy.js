module.exports = function(eleventyConfig) {
    // Copy CSS and Assets directly to the output folder
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/assets");

    return {
        dir: {
            input: "src",
            includes: "../_includes",
            output: "_site"
        }
    };
};