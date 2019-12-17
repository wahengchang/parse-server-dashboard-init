(async ()=> {
    const Parse = require('parse/node')
    const APP_ID = process.env.APP_ID
    const HOST_URL = process.env.HOST_URL || 'localhost'
    
    // const MASTER_KEY = process.env.MASTER_KEY
    Parse.initialize(APP_ID);
    Parse.serverURL = `http://${HOST_URL}:1337/parse`
    
    //  -=-=-=-=--=-=-=-=--=-=-=-=--=-=-=-=--=-=-=-=--=-=-=-=-
    //  -=-=-=-=--=-=-=-=--=-=-=-=--=-=-=-=--=-=-=-=--=-=-=-=-
    //  -=-=-=-=--=-=-=-=--=-=-=-=--=-=-=-=--=-=-=-=--=-=-=-=-

    const login = (username, password) => {
        var user = new Parse.User();
        user.set("username", username);
        user.set("password", password);
        return user.logIn();
    }

    const createCogConfig = () => {

    }

    try {
        // -=-=-=-=-= Login
        const loginUser = await login("test", "password")

        // -=-=-=-=-= create cogConfig
        const CogConfig = Parse.Object.extend("CogConfig")
        const cc = new CogConfig();
        cc.set("title", `${new Date().getTime()}`);
        cc.set("owner", loginUser);
        cc.relation("owners").add(loginUser)
        const resCc = await cc.save()
        console.log('resCc: ', resCc)


    } catch (error) {
      // Show the error message somewhere and let the user try again.
      console.log("Error: " + error.code + " " + error.message);
    }    
})()