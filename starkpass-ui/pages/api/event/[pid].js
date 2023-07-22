import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method === 'GET') {
      const { pid } = req.query
      const contractId = pid
      console.log(contractId)

      if (contractId) {
        const data = await kv.get(contractId);
  
        res.status(200).json({
            'data': data
        })
        res.send()
      } else {
        res.send(200)
      }
    } 
}