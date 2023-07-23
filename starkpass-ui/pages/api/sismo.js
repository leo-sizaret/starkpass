// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { kv } from '@vercel/kv';

// this is the API route that is called by the SismoConnectButton
export default async function handler(req, res) {
  
  const sismoConnectResponse = JSON.parse(req.body);
  console.log("user verified", sismoConnectResponse);

  const proofs = sismoConnectResponse['proofs'];
  console.log(proofs);

  const contractIds = new Set();

  if (proofs) {

    for (var i = 0; i < proofs.length; i++) {
        const auths = proofs[i]['auths'];
        for (var j = 0; j < auths.length; j++) {
          const userId = auths[j]['userId'];
          const userIdContracts = await kv.get(userId);
          console.log("contract data kv", userIdContracts)
          if (userIdContracts) {
            for (var k = 0; k < userIdContracts.length; k++) {
              contractIds.add(userIdContracts[k]['contractId']);
            }
          }
        }
    }
  }

  res.status(200).json({
    'contractIds': Array.from(contractIds),
    'proofs': proofs
  });
  res.send();
}