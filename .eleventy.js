module.exports = function(eleventyConfig) {
    // Copy static folders & files straight to the build output
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/assets");
    eleventyConfig.addPassthroughCopy("src/robots.txt");

    return {
        dir: {
            input: "src",
            includes: "../_includes",
            output: "_site"
        }
    };
};