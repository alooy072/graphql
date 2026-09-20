export const apiUrl = "https://learn.reboot01.com/api/graphql-engine/v1/graphql"
export const authURL = "https://learn.reboot01.com/api/auth/signin"

const query = `
query user{
id
}`



const credentials = btoa(`${identifier}:${password}`);





const resp = await fetch(authURL, {
    method: "POST",
    headers: {
        'Authorization': `Basic ${credentials}`
    }
});

const jwt = await resp.json();
console.log(jwt)
sessionStorage.setItem("jwt", jwt);

window.location.href = "../templates/profile.html"

console.log(jwt);