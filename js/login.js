import { authenticate } from "./auth.js";

let form = document.getElementById("login-form");

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let identifier = form.querySelector('[name="identifier"]');
    let password = form.querySelector('[name="password"]')

    const jwt = await authenticate(identifier.value, password.value)

    const errorDiv = document.getElementById("error-div")
    if (jwt == "error") {
        errorDiv.style.display = "block"
        return
    }
    sessionStorage.setItem("jwt", jwt);

    // Get the repository name dynamically from the URL path
    const pathSegments = window.location.pathname.split('/');
    const repoName = pathSegments[1]; // Gets 'your-repo-name'

    if (window.location.hostname.includes("github.io")) {
        // GitHub Pages redirect
        window.location.href = `/${repoName}/templates/profile.html`;
    } else {
        // Local development redirect (e.g., Live Server)
        window.location.href = "/templates/profile.html";
    }

})
