import { apiUrl } from "./login"


export async function GraphqlQuery(query){ 
    const jwt = sessionStorage.getItem("jwt");

    const resp = fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`
        },
        body: JSON.stringify({
            query: query    
        })
    })

    const data = await resp.JSON();
    return data;
}