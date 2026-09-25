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

    xpGraphArray.sort((a, b) => b.amount - a.amount) // Sorts the array by least xp to most

    const svg = document.getElementById("bar-chart");
    const baselineX = 140;
    const maxBarWidth = 400
    const barHeight = 25;
    const barSpacing = 10;
    const startY = 40;

    const maxValue = Math.max(...xpGraphArray.map(obj => obj.amount))

    // Set svg height to fit all bars, stacked vertically
    const totalHeight = startY + xpGraphArray.length * (barHeight + barSpacing) + 20;
    svg.setAttribute("height", totalHeight)

    let svgContent = `<line x1="${baselineX}" y1="10" x2="${baselineX}" y2="${totalHeight - 10}" stroke="#333" stroke-width="2" />`;

    xpGraphArray.forEach((obj, index) => {
        // Calculate y position for each bar (stacked top to bottom)
        const y = startY + index * (barHeight + barSpacing);

        // Calculate vertical size using the scaling ratio
        const pixelWidth = (obj.amount / maxValue) * maxBarWidth;

        const projectName = obj.path.split("/").pop() // pops the project name out of the path

        svgContent += `
            <!-- Dynamic Bar -->
            <rect x="${baselineX}" y="${y}" width="${pixelWidth}" height="${barHeight}" />

            <!-- Value Text Label at the end of the bar -->
            <text x="${baselineX + pixelWidth + 8}" y="${y + barHeight / 2}" font-size="12" font-family="sans-serif" fill="#666">${obj.amount}</text>

            <!-- Project name label to the left of the axis -->
            <text x="${baselineX - 10}" y="${y + barHeight / 2 + 4}" text-anchor="end" font-size="12" font-family="sans-serif" fill="#666">${projectName}</text>
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