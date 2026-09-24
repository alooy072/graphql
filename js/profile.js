import { isAuthenticated } from "./auth.js";
import { GraphqlQuery } from "./query.js";
import {xpPerProject, xpOverTime} from "./graphs.js"

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
    let userID = userObj.id
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
    
    let auditRatioInfo = await getAuditRatio()
    let auditRatioObj = auditRatioInfo.data.user[0]
    let auditRatio = auditRatioObj.auditRatio
    let auditDone = auditRatioObj.totalUp / 1000000             // Converts to MB
    let auditRecieved = auditRatioObj.totalDown / 1000000       // Converts to MB
    console.log(auditRatio , auditDone , auditRecieved)

    let xpGraphData = await xpPerProject();
    let xpGraphArray = xpGraphData.data.transaction;
    console.log(xpGraphArray);

    let xpOverTimeData = await xpOverTime();
    let xpOverTimeArray = xpOverTimeData.data.transaction
    console.log(xpOverTimeArray)
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

async function getAuditRatio() {
    let auditRatioQuery = `{
        user {
        id
        auditRatio
        totalUp
        totalDown
        }
    }`

    let auditRatioInfo =  await GraphqlQuery(auditRatioQuery);
    return auditRatioInfo
}


function redirectToLogin() {
    window.location.href = "../templates/index.html";
}