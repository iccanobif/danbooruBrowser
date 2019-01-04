const Danbooru = require("danbooru")
const fs = require("fs")
const async = require("async")

let danbooruCredentials = undefined
try
{
    const configText = fs.readFileSync("config.json", { encoding: "utf8" })
    const { user, apiKey } = JSON.parse(configText)
    danbooruCredentials = user + ":" + apiKey
}
catch (exc)
{
    // Should report the error
    danbooruCredentials = undefined
}

const booru = new Danbooru(danbooruCredentials)

module.exports.getUrlList = (tags, md5Blacklist) =>
{
    return new Promise((resolve, reject) => 
    {
        // Grab 10 pages' worth of posts 
        async.map(
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            (page, callback) =>
            {
                booru
                    .posts({ tags: tags, limit: 200, page: page })
                    .then(posts =>
                    {
                        callback(null, posts.filter(post => 
                        {
                            const output = !md5Blacklist.has(post.md5)
                            return output
                        }
                        ))
                    })
                    .catch(err =>
                    {
                        callback(err)
                    })
            },
            (err, results) =>
            {
                try
                {
                    if (err) reject(err)
                    else
                    {
                        const completeList = results
                            .reduce((acc, curr) => // Flatten arrays
                            {
                                return acc.concat(curr)
                            }, [])
                            .map(x =>"https://danbooru.donmai.us/posts/" + x.id)

                        resolve(completeList)
                    }
                }
                catch (exc)
                {
                    reject(exc)
                }
            }
        )
    })
}