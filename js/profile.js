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
    document.getElementById("audit-done").textContent = auditDone.toFixed(2) + " MB";
    document.getElementById("audit-received").textContent = auditRecieved.toFixed(2) + " MB";
    auditRatioEl.textContent = auditRatio.toFixed(2)

    let xpGraphData = await xpPerProject();
    let xpGraphArray = xpGraphData.data.transaction;
    xpGraphArray.forEach(obj => {
        obj.amount = obj.amount / 1000
    })
    console.log(xpGraphArray);

    xpGraphArray.sort((a, b) => b.amount - a.amount) // Sorts the array by least xp to most

    const svg = document.getElementById("bar-chart");
    const baselineX = 140;
    const maxBarWidth = 400
    const barHeight = 20;
    const barSpacing = 10;
    const startY = 40;

    const maxValue = Math.max(...xpGraphArray.map(obj => obj.amount))

    // Set svg height to fit all bars, stacked vertically
    const totalHeight = startY + xpGraphArray.length * (barHeight + barSpacing) + 20;
    svg.setAttribute("height", totalHeight)
    svg.setAttribute("viewBox", `0 0 600 ${totalHeight}`)

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
            <text x="${baselineX + pixelWidth + 8}" y="${y + barHeight / 2 + 4}" text-anchor="start">${Math.round(obj.amount)} kB</text>

            <!-- Project name label to the left of the axis -->
            <text x="${baselineX - 10}" y="${y + barHeight / 2 + 4}" text-anchor="end">${projectName}</text>
        `
    })

    svg.innerHTML += svgContent;

    let xpOverTimeData = await xpOverTime();
    let xpOverTimeArray = xpOverTimeData.data.transaction
    xpOverTimeArray.forEach(obj => {
        obj.amount = obj.amount / 1000
    })
    console.log(xpOverTimeArray)

    let runningTotal = 0;
    const cumulativePoints = xpOverTimeArray.map(tx => {
        runningTotal += tx.amount;
        return { date: new Date(tx.createdAt), total: runningTotal };
    })
    console.log(cumulativePoints)

    const lineSvg = document.getElementById("line-chart");
    const chartWidth = 1000;
    const chartHeight = 550;
    const marginLeft = 60;
    const marginBottom = 40;
    const marginTop = 20;

    const maxTotal = cumulativePoints[cumulativePoints.length - 1].total;
    const minDate = cumulativePoints[0].date.getTime()
    const maxDate = cumulativePoints[cumulativePoints.length - 1].date.getTime();

    // Maps a point to pixel coordinates
    function toX(date) {
        return marginLeft + ((date.getTime() - minDate) / (maxDate - minDate)) * (chartWidth - marginLeft - 20);
    }

    function toY(total) {
        return (chartHeight - marginBottom) - (total / maxTotal) * (chartHeight - marginBottom - marginTop);
    }

    // Formats a cumulative kB value as "153 kB" for axis labels
    function formatKB(value) {
        return `${Math.round(value)} kB`;
    }

    // Formats a date as "Sept 2025" for the x-axis
    function formatMonthYear(date) {
        return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }

    // Build the path data
    let pathD = cumulativePoints
        .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.date).toFixed(1)},${toY(p.total).toFixed(1)}`)
        .join(" ");

    let lineContent = `
    <!-- Axes -->
    <line x1="${marginLeft}" y1="${marginTop}" x2="${marginLeft}" y2="${chartHeight - marginBottom}" />
    <line x1="${marginLeft}" y1="${chartHeight - marginBottom}" x2="${chartWidth - 20}" y2="${chartHeight - marginBottom}" />
`;

    // Horizontal gridlines + Y axis labels, evenly spaced (0 to max, 4 steps)
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
        const value = (maxTotal / steps) * i;
        const y = toY(value);

        lineContent += `
        <line x1="${marginLeft}" y1="${y.toFixed(1)}" x2="${chartWidth - 20}" y2="${y.toFixed(1)}" />
        <text x="${marginLeft - 12}" y="${(y + 4).toFixed(1)}" text-anchor="end">${formatKB(value)}</text>
    `;
    }

    // The cumulative XP line
    lineContent += `<path d="${pathD}" />`;

    // Add a dot at each transaction point
    cumulativePoints.forEach(p => {
        lineContent += `<circle cx="${toX(p.date).toFixed(1)}" cy="${toY(p.total).toFixed(1)}" />`;
    });

    // Start and end date labels
    lineContent += `
    <text x="${marginLeft}" y="${chartHeight - marginBottom + 20}" text-anchor="start">${formatMonthYear(cumulativePoints[0].date)}</text>
    <text x="${chartWidth - 20}" y="${chartHeight - marginBottom + 20}" text-anchor="end">${formatMonthYear(cumulativePoints[cumulativePoints.length - 1].date)}</text>
`;

    lineSvg.innerHTML += lineContent;
}



function redirectToLogin() {
    window.location.href = "../templates/index.html";
}