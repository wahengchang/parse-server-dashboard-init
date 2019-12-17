Parse.Cloud.define("averageStars", async (request) => {
    console.log(' -=-=-=-= averageStars -=-=-')
    // const query = new Parse.Query("Review");
    // query.equalTo("movie", request.params.movie);
    // const results = await query.find();
    // let sum = 0;
    // for (let i = 0; i < results.length; ++i) {
    //     sum += results[i].get("stars");
    // }
    // return sum / results.length;
    return 'ok'
});