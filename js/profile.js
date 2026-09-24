import { isAuthenticated } from "./auth.js";
import { GraphqlQuery } from "./query.js";
import { xpPerProject, xpOverTime } from "./graphs.js"
import { getXP, getAuditRatio } from "./user-info.js";

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

    let usernameEl = document.getElementById("username");
    let emailEl = document.getElementById("email");
    let userIdEl = document.getElementById("user-id");

    usernameEl.textContent = username;
    emailEl.textContent = email;
    userIdEl.textContent = userID;

    let xpInfo = await getXP()
    console.log(xpInfo)

    let totalXp = 0

    xpInfo.data.transaction.forEach(xp => {
        totalXp += xp.amount;
    });

    totalXp /= 1000;

    console.log(Math.round(totalXp))

    let totalXpEl = document.getElementById("total-xp")
    totalXpEl.textContent = totalXp

    let auditRatioInfo = await getAuditRatio()
    let auditRatioObj = auditRatioInfo.data.user[0]
    let auditRatio = auditRatioObj.auditRatio
    let auditDone = auditRatioObj.totalUp / 1000000             // Converts to MB
    let auditRecieved = auditRatioObj.totalDown / 1000000       // Converts to MB
    console.log(auditRatio, auditDone, auditRecieved)

    let auditRatioEl = document.getElementById("audit-ratio");
    auditRatioEl.textContent = auditRatio.toFixed(2)

    let xpGraphData = await xpPerProject();
    let xpGraphArray = xpGraphData.data.transaction;
    console.log(xpGraphArray);

    const svg = document.getElementById("bar-chart");
    const baselineY = 250;
    const maxGraphHeight = 200
    const barWidth = 50;
    const barSpacing = 10;
    const startX = 40;

    const maxValue = Math.max(...xpGraphArray.map(obj => obj.amount))
    let svgContent = ``

    xpGraphArray.forEach((obj, index) => {
        // Calculate x position for each bar
        const x = startX + index * (barWidth + barSpacing);

        // Calculate vertical size using the scaling ratio
        const pixelHeight = (obj.amount / maxValue) * maxGraphHeight;

        // Flipped Y coordinate logic: baseline floor minus the bar's height
        const y = baselineY - pixelHeight;

        const projectName = obj.path.split("/").pop() // pops the project name out of the path

        svgContent += `
            <!-- Dynamic Bar -->
            <rect x="${x}" y="${y}" width="${barWidth}" height="${pixelHeight}" />

            <!-- Value Text Label centered above the bar -->
            <text x="${x + barWidth / 2}" y="${y-8}" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#666">${obj.amount}</text>

            <!-- Axis Category Label centered below the baseline -->
            <text x="${x + barWidth / 2}" y="${baselineY + 20}" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#666">${projectName}</text>
        `
    })

    svg.innerHTML += svgContent;

    let xpOverTimeData = await xpOverTime();
    let xpOverTimeArray = xpOverTimeData.data.transaction
    console.log(xpOverTimeArray)
}




function redirectToLogin() {
    window.location.href = "../templates/index.html";
}