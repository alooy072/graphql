import { apiUrl } from "./login"


export async function isAuthenticated(jwt) {

    const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query })
    })

    const response = await res.json()

    console.log(response)
}