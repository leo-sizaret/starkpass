// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { contractId } = req.query
    const data = await kv.hgetall('contractId:'+ contractId);

    res.status(200).json({
        'data': data
    })
    res.send()
  } 
  if (req.method === 'POST') {
    console.log(req.body)
    const reqBody = req.body
    const contractId = reqBody['contractId']
    const proofs = reqBody['proofs']
    const transactionId = reqBody['transactionId']

    console.log(proofs)

    if (transactionId) {
        const dataKv = 'contractId '+ contractId + ' proofs ' + JSON.stringify(proofs)
        console.log(dataKv)
        await kv.hset(dataKv);
    }

    res.status(200)
    res.send()
  } 
}