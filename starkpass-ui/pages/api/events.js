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
        const auths = proofs[i]['auths'];
        for (var j = 0; j < auths.length; j++) {
          const userId = auths[j]['userId']; 
          const userIdContracts = await kv.get(userId);

          const userIdContractsToPush = [{
            'proofData': proofs[i]['proofData'],
            'contractId': contractId,
          }];

          console.log(userIdContractsToPush);

          if (userIdContracts) {
            kv.set(userId, userIdContracts.concat(userIdContractsToPush));
          } else {
            kv.set(userId, userIdContractsToPush); 
          } 
        }
      }
    }

    res.status(200);
    res.send();
  } 
}