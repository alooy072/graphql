import { apiUrl } from "./auth.js"


export async function GraphqlQuery(query, variables = {}) {
    const jwt = sessionStorage.getItem("jwt");

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`
        },
        body: JSON.stringify({ query, variables })
    });

    return await response.json();
}