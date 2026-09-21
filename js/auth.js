export const apiUrl = "https://learn.reboot01.com/api/graphql-engine/v1/graphql"
export const authURL = "https://learn.reboot01.com/api/auth/signin"

// const query = `
//     query user{
//         id
//     }`

export async function isAuthenticated(jwt) {

    const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
            query: `{ user { id } }`
        })
    })


    const authData = await res.json()

    console.log(authData);

    return !authData.errors;
}

export async function authenticate(identifier, password) {
    const credentials = btoa(`${identifier}:${password}`);


    const resp = await fetch(authURL, {
        method: "POST",
        headers: {
            'Authorization': `Basic ${credentials}`
        }
    });

    if (!resp.ok) {
        console.log("error authentication")
        return
    }
    const jwt = await resp.json();
    console.log("jwt: ", jwt)
    return jwt
}