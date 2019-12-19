Parse.Cloud.define("initConfig", async (req, res) => {
    const optionsMasterKey = {useMasterKey:true}
    console.log(' -=-=-=-= initConfig -=-=-')
    console.log('req.params: ', req.params)
    const {username, password} = req.params
    
    
    const login = (username, password) => {
        // var user = new Parse.User();
        // user.set("username", username);
        // user.set("password", password);
        // return user.logIn();
        return Parse.User.logIn(username, password)
    }

    const createRoleForUser = (existedUser, roleName) => {
        const roleACL = new Parse.ACL();
        roleACL.setPublicReadAccess(false);
        const role = new Parse.Role(roleName, roleACL);
        role.getUsers().add(existedUser);
        return role.save();
    }
    const createAclForRole = (roleObj) => {
        const acl = new Parse.ACL();
        acl.setRoleReadAccess(roleObj, true);
        acl.setRoleWriteAccess(roleObj, true);
        return acl
    }

    const createCogConfig = async (loginUser, {title, acl = null, cogAccountObj}) => {
        // -=-=-=-=-= create cogConfig
        const CogConfig = Parse.Object.extend("CogConfig")
        const cc = new CogConfig();
        cc.set("title", title);
        cc.set("owner", loginUser);
        cc.set("cogAccount", cogAccountObj);
        cc.setACL(acl);
        cc.relation("owners").add(loginUser)
        return cc.save()
    }
    const createCogAccount = (loginUser, {title, acl = null}) => {
        // -=-=-=-=-= create CogAccount
        const CogAccount = Parse.Object.extend("CogAccount")
        const cc = new CogAccount();
        cc.set("title", title)
        cc.set("owner", loginUser);
        cc.setACL(acl)
        cc.relation("owners").add(loginUser)
        return cc.save()
    }

    const getCogConfig = (id) => {
        var CogConfig = Parse.Object.extend("CogConfig");
        var cc = new Parse.Query(CogConfig);
        return cc.get(id, optionsMasterKey)
    }

    try {
        // -=-=-=-=-= Login
        const title = `project-${new Date().getTime()}`

        const loginUser = req.user
        const roleUser = await createRoleForUser(loginUser, title)
        const acl = await createAclForRole(roleUser)

        const cogAccountObj = await createCogAccount(loginUser, {title, acl})
        const resCc = await createCogConfig(loginUser, {title, acl, cogAccountObj})
        console.log('created: resCc: ', resCc)
        const getCc = await getCogConfig(resCc.id)
        console.log('created: getCc: ', getCc)

        return {
            CogAccount: cogAccountObj,
            CogConfig: resCc,
        }
        
    } catch (error) {
        console.log("Error: " + error.code + " " + error.message)
        throw error
    }    
});
