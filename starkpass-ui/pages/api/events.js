// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log(req.body)
    const reqBody = req.body
    const contractId = reqBody['contractId']
    const proofs = reqBody['proofs']
    const transactionId = reqBody['transactionId']

    console.log(proofs)

    if (transactionId) {
        const data = await kv.get(contractId);
        const dataParsed = proofs

        if (data) {
          const dataParsed = data.concat(proofs)
        }
        console.log(dataParsed)

        kv.hset(contractId, dataParsed); 
    }

    res.status(200)
    res.send()
  } 
}