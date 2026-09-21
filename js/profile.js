import { isAuthenticated } from "./auth.js";
import { GraphqlQuery } from "./query.js";

loadProfile()



async function loadProfile() {
    const jwt = sessionStorage.getItem("jwt");

    if (!jwt || !(await isAuthenticated(jwt))) {
        redirectToLogin();
        console.log("invalid jwt token")
        return
    }

    const logoutDiv = document.getElementById("logout-div");
    const logoutButton = logoutDiv.querySelector("button")
    logoutButton.addEventListener("click", (e) => {
        sessionStorage.removeItem("jwt");
        redirectToLogin()
    })

    let userInfoQuery = `{user{id login email}}`
    let userInfo = await GraphqlQuery(userInfoQuery)
    console.log(userInfo)

    let userObj = userInfo.data.user[0]
    console.log(userObj)
    let userID =  userObj.id
    console.log(userID)

    let username = userObj.login
    let email = userObj.email

    console.log("username:", username, " email:", email)

    let xpInfo = await getXP()
    console.log(xpInfo)

    let totalXp = 0

    xpInfo.data.transaction.forEach(xp => {
        totalXp += xp.amount;
    });

    totalXp /= 1000;
    
    console.log(Math.round(totalXp))
    
}

async function getXP() {
    let xpQuery = `{
    
        transaction(
            where: {
                type: { _eq: "xp" },
                path: {
                    _regex: "^/bahrain/bh-module/([^/]+|checkpoint/[^/]+)$"
                }
            }
        ) {
            amount
        }
    }`

    let xp = await GraphqlQuery(xpQuery);

    return xp
}

async function getAuditRatio(){
    let auditRatioQuery = ``
}

function redirectToLogin() {
    window.location.href = "../templates/index.html";
}