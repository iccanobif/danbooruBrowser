const fs = require("fs")
const BLACKLIST_FILE_NAME = "blacklist.csv"

function readdir(path)
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
            resolve(files)
        })
    })
}


module.exports.getBlacklist = () =>
{
    return new Promise(async (resolve, reject) =>
    {
        const files = await readdir("d:\\ero")
        const files2 = await readdir("d:\\ero\\2009")
        const files3 = await readdir("d:\\ero\\2019")
        const files4 = await readdir("d:\\ero\\smoking")

        const md5Blacklist = new Set(
            files.concat(files2).concat(files3).concat(files4)
                .map(file => file.substring(0, file.lastIndexOf("."))) // Remove extension
                .map(file => file.substring(file.length - 32)) // Extract md5 from filename
                .filter(file => file.length == 32) // Make sure the string that was extracted really looks like an md5
                .filter(file => file.match(/^[0-9a-f]*$/)) // Make sure the string that was extracted really looks like an md5
        )

        try
        {
            var data = fs.readFileSync(BLACKLIST_FILE_NAME, { encoding: "utf8" })
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
}

module.exports.addToBlacklist = (md5) => 
{
    fs.appendFileSync(BLACKLIST_FILE_NAME, md5 + "\n")
}