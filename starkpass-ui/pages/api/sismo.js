// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { kv } from '@vercel/kv';

// this is the API route that is called by the SismoConnectButton
export default async function handler(req, res) {
  
  const sismoConnectResponse = JSON.parse(req.body);
  console.log("user verified", sismoConnectResponse);

  const proofs = sismoConnectResponse['proofs'];
  console.log(proofs);

  const resData = [];

  for (var i = 0; i < proofs.length; i++) {
      const proofData = proofs[i]['proofData'];
      const proofDataContracts = kv.get(proofData);
      if (proofDataContracts && proofDataContracts['contractId']) {
        resData.push(proofDataContracts['contractId']);
      }
  }

  res.status(200).json(resData);
  res.send();
}