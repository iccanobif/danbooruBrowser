const async = require("async");
const { getPostsFromTag } = require("./danbooru.js");


module.exports.getUrlList = (tags, md5Blacklist) => {
  return new Promise((resolve, reject) => {
    // Grab 10 pages' worth of posts
    async.map(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      (page, callback) => {
        getPostsFromTag(tags, 200, page)
          .then((posts) => {
            callback(
              null,
              posts.filter((post) => {
                const output = !md5Blacklist.has(post.md5);
                
                return output;
              })
            );
          })
          .catch((err) => {
            callback(err);
          });
      },
      (err, results) => {
        try {
          if (err) reject(err);
          else {
            const completeList = results
              .reduce((
                acc,
                curr // Flatten arrays
              ) => {
                return acc.concat(curr);
              }, [])
              .filter(x => x.id) // skip deleted posts that have no id
              .map((x) => "https://danbooru.donmai.us/posts/" + x.id);

            resolve(completeList);
          }
        } catch (exc) {
          reject(exc);
        }
      }
    );
  });
};

module.exports.imagePagesIterator = async function* (md5Blacklist) {
  // TODO: gestire "tag" che in realta' sono una coppia di tag
  const tags = ["nail_polish", "legs"];
  let page = 1;

  while (true) {
    console.log("inizio loop");
    for (const tag of tags) {
      console.log(tag, page);
      const posts = await getPostsFromTag(tag, 20, page)
      for (const post of posts.filter((p) => !md5Blacklist.has(p.md5))) {
        const url = "https://danbooru.donmai.us/posts/" + post.id;
        console.log(url);
        yield url;
      }
    }
    page++;
  }
};

// async function kek() {
//   for await (const val of module.exports.imagePagesIterator()) {
//     console.log(val);
//   }
// }

// kek().catch(console.error);
