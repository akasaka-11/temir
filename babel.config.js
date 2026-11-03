module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Lets Drizzle migrations (.sql files) be imported as strings.
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
