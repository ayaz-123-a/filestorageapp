import { OAuth2Client } from "google-auth-library";

const client_id =
  process.env.GOOGLE_CLIENT_ID
const client = new OAuth2Client({ client_id });

export const verifyIdToken=async(idToken)=>{
const loginTicket=await client.verifyIdToken({
    idToken,
    audience:client_id // storage applanneya access aakne orppakan
})
const userData=loginTicket.getPayload()
return userData
}

