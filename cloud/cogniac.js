Parse.Cloud.define("cogniac", async (req) => {
    console.log(' -=-=-=-= cogniac -=-=-')
    console.log('req.params: ', req.params)
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
