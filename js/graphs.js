import { GraphqlQuery } from "./query.js";

export async function xpPerProject(){
    let xpPerProjectQuery = `{
    
        transaction(
            where: {
                type: { _eq: "xp" },
                path: {
                    _regex: "^/bahrain/bh-module/[^/]+$"
                }
            }
        ) {
            amount
    				path
    				
        }
    }`

    let response = await GraphqlQuery(xpPerProjectQuery)
    return response;
}

export async function xpOverTime(){
    let xpOverTimeQuery = `{
    
        transaction(
            where: {
                type: { _eq: "xp" },
                path: {
                    _regex: "^/bahrain/bh-module/([^/]+|checkpoint/[^/]+)$"
                }
            }
          	order_by: {createdAt: asc}
        ) {
            amount
    				path
    				createdAt
        }
    }`;

    let response = await GraphqlQuery(xpOverTimeQuery);
    return response;
}