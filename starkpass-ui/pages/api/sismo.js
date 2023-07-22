// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

  // this is the API route that is called by the SismoConnectButton
  export default async function POST(req, res) {
    
    const sismoConnectResponse = JSON.parse(req.body);
    console.log("user verified", sismoConnectResponse);
    res.status(200).json(sismoConnectResponse)
    res.send()
  }