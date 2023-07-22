// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const reqBody = req.body;
    const contractId = reqBody['contractId'];
    const proofs = reqBody['proofs'];
    const transactionId = reqBody['transactionId'];

    console.log(proofs);

    if (transactionId) {
      for (var i = 0; i < proofs.length; i++) {
        const proofData = proofs[i]['proofData'];
        const proofDataContracts = await kv.get(proofData);

        const proofDataContractsToPush = [{
          'auths': proofs[i]['auths'],
          'contractId': contractId,
        }];

        console.log(proofDataContractsToPush);

        if (proofDataContracts) {
          kv.set(proofData, proofDataContracts.concat(proofDataContractsToPush));
        } else {
          kv.set(proofData, proofDataContractsToPush); 
        } 
      }
    }

    res.status(200);
    res.send();
  } 
}