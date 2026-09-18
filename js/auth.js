const apiUrl = "https://learn.reboot01.com/api/graphql-engine/v1/graphql"
const authURL = "https://learn.reboot01.com/api/auth/signin"

const query = `
query user{
id
}`


const credentials = btoa(`${identifier}:${password}`);



// const res = await fetch(apiUrl, {
//     method: "POST",
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({query: query})
// })

// const response = await res.json()

// console.log(response)

const resp = await fetch(authURL, {
    method: "POST",
    headers: {
        'Authorization': `Basic ${credentials}`
    }
})

const response = await resp.json();

console.log(response);