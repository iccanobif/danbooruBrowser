const fs = require("fs");
const configText = fs.readFileSync("config.json", { encoding: "utf8" });
const { user, apiKey } = JSON.parse(configText);
const danbooruCredentials = user + ":" + apiKey;

module.exports.getPostsFromTag = async function (tags, limit, page) {
    const headers = {
        'Authorization': 'Basic ' + btoa(danbooruCredentials),
      };
    const response = await fetch("https://danbooru.donmai.us/posts.json?tags=" + tags + "&page=" + page + "&limit=" + limit, { headers });
    return await response.json()
}

