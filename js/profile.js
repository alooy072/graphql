import { isAuthenticated } from "./auth";

loadProfile()

userInfoQuery = `{user{id login email}}`

async function loadProfile() {
    const jwt = sessionStorage.getItem("jwt");

    if (!jwt || !isAuthenticated(jwt)) {
        redirectToLogin();
    }

    const logoutDiv = document.getElementById("logout-div");
    const logoutButton = logoutDiv.querySelector("button")
    logoutButton.addEventListener('click', (e) => {
        sessionStorage.removeItem("jwt");
        redirectToLogin()
    })

}


function redirectToLogin() {
    window.location.href = "../templates/index.html";
}