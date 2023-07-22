// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { kv } from '@vercel/kv';

// this is the API route that is called by the SismoConnectButton
export default async function handler(req, res) {
  
  const sismoConnectResponse = JSON.parse(req.body);
  console.log("user verified", sismoConnectResponse);

  const proofs = sismoConnectResponse['proofs'];
  console.log(proofs);

  const contractIds = new Set();

  for (var i = 0; i < proofs.length; i++) {
      const proofData = proofs[i]['proofData'];
      const proofDataContracts = await kv.get(proofData);
      console.log("contract data kv", proofDataContracts)
      if (proofDataContracts) {
        for (var j = 0; j < proofDataContracts.length; j++) {
          contractIds.add(proofDataContracts[j]['contractId']);
        }
      }
  }

  res.status(200).json({
    'contractIds': Array.from(contractIds),
    'proofs': proofs
  });
  res.send();
}