const Danbooru = require("danbooru")
const fs = require("fs")
const async = require("async")
const booru = new Danbooru()

module.exports.getUrlList = (tags) =>
{
    return new Promise((resolve, reject) => 
    {
        //Load md5 blacklist
        fs.readdir("d:\\ero", (err, files) =>
        {
            if (err)
            {
                reject(err)
                return
            }

            const md5Blacklist = new Set(
                files
                    .map(file => file.substring(0, file.lastIndexOf("."))) // Remove extension
                    .map(file => file.substring(file.length - 32)) // Extract md5 from filename
                    .filter(file => file.length == 32) // Make sure the string that was extracted really looks like an md5
                    .filter(file => file.match(/^[0-9a-f]*$/)) // Make sure the string that was extracted really looks like an md5
            )

            // Grab 10 pages' worth of posts 
            async.map(
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                (page, callback) =>
                {
                    booru
                        .posts({ tags: tags, limit: 200, page: page })
                        .then(posts =>
                        {
                            callback(null, posts.filter(post => !md5Blacklist.has(post.md5)))
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
                                .map(x =>
                                    ({
                                        url: "https://danbooru.donmai.us/posts/" + x.id,
                                        fileUrl: x.file_url
                                    }))

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
    })
}