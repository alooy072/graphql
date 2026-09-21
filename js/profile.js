import { isAuthenticated } from "./auth.js";
import { GraphqlQuery } from "./query.js";

loadProfile()



async function loadProfile() {
    const jwt = sessionStorage.getItem("jwt");

    if (!jwt || !(await isAuthenticated(jwt))) {
        // redirectToLogin();
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

function redirectToLogin() {
    window.location.href = "../templates/index.html";
}