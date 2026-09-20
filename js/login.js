import { authenticate } from "./auth.js";

let form = document.getElementById("login-form");

 form.addEventListener('submit' , async (e) => {
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

    // window.location.href = "../templates/profile.html"
})
