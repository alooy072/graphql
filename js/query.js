import { apiUrl } from "./auth.js"


export async function GraphqlQuery(query){ 
    const jwt = sessionStorage.getItem("jwt");

    const resp = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`
        },
        body: JSON.stringify({
            query: query    
        })
    })

    const data = await resp.json();
    return data;
}