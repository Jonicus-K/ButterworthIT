module.exports = function(eleventyConfig) {
    // Copy the CSS folder straight through to the final build
    eleventyConfig.addPassthroughCopy("src/css");

    return {
        dir: {
            input: "src",
            includes: "../_includes",
            output: "_site"
        }
    };
};