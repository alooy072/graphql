import { GraphqlQuery } from "./query.js";

export async function getXP() {
    let xpQuery = `{
    
        transaction(
            where: {
                type: { _eq: "xp" },
                path: {
                    _regex: "^/bahrain/bh-module/([^/]+|checkpoint/[^/]+)$"
                }
            }
        ) {
            amount
        }
    }`

    let xp = await GraphqlQuery(xpQuery);

    return xp
}

export async function getAuditRatio() {
    let auditRatioQuery = `{
        user {
        id
        auditRatio
        totalUp
        totalDown
        }
    }`

    let auditRatioInfo =  await GraphqlQuery(auditRatioQuery);
    return auditRatioInfo
}