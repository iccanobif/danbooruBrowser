const fs = require("fs")
const BLACKLIST_FILE_NAME = "blacklist.csv"

module.exports.getBlacklist = () =>
{
    return new Promise((resolve, reject) =>
    {
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

            try
            {
                var data = fs.readFileSync(BLACKLIST_FILE_NAME)
            }
            catch (exc)
            {
                console.error(exc)
                var data = ""
            }

            data.split("\n").forEach(x =>
            {
                md5Blacklist.add(x)
            })

            resolve(md5Blacklist)
        })
    })
}

module.exports.addToBlacklist = (md5) => 
{
    fs.appendFileSync(BLACKLIST_FILE_NAME, md5 + "\n")
}