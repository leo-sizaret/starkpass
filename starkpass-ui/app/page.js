'use client'

import Image from 'next/image'
import { useCallback, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { connect } from "@argent/get-starknet"
import { Web3Modal } from "@web3modal/standalone";

import {
  SismoConnectButton,
  SismoConnectResponse,
  SismoConnectVerifiedResult,
} from '@sismo-core/sismo-connect-react';
import { useState } from 'react';
import {
  CONFIG,
  AUTHS,
  CLAIMS,
  SIGNATURE_REQUEST,
  AuthType,
  ClaimType,
} from './sismo-connect-config';

export default function EventsList() {
  const [starknet, setStarknet] = useState(undefined);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [address, setAddress] = useState("");

  const [sismoConnectVerifiedResult, setSismoConnectVerifiedResult] = useState(undefined);
  const [sismoConnectResponse, setSismoConnectResponse] = useState(undefined);
  const [pageState, setPageState] = useState('init');
  const [error, setError] = useState('');
  
  const web3Modal = new Web3Modal({
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    walletConnectVersion: 2,
  });

  const onSignIn = useCallback(async () => {
    if (!starknet) {
      toast("Rejected wallet selection or silent connect found nothing", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
      });
    }

    await starknet.enable()

    if(starknet.isConnected) {
        // If the extension was installed and successfully connected, you have access to a starknet.js Signer object to do all kinds of requests through the user's wallet contract.
        // starknet.account.execute({ ... })
        console.log('HELO')
        console.log(starknet.account)
    } else {
        // In case the extension wasn't successfully connected you still have access to a starknet.js Provider to read starknet states and sent anonymous transactions
        // starknet.provider.callContract( ... )
    }
  }, [starknet]);

  useEffect(() => {
    const starknet = connect()
    setStarknet(starknet)
  }, []);

  // toast('🦄 Auth request successfully approved!', {
  //     position: "top-right",
  //     autoClose: 5000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //     progress: undefined,
  //     theme: "dark",
  // });

  // const [view, changeView] = useState("default");

  useEffect(() => {
    if (address) {
      setAddress(starknet.account);
      // changeView("signedIn");
    }
  }, [address]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ToastContainer />
      {pageState == "init" ? (
          <>
            <SismoConnectButton
              config={CONFIG}
              // Auths = Data Source Ownership Requests. (e.g Wallets, Github, Twitter, Github)
              auths={AUTHS}
              // Claims = prove group membership of a Data Source in a specific Data Group.
              // (e.g ENS DAO Voter, Minter of specific NFT, etc.)
              // Data Groups = [{[dataSource1]: value1}, {[dataSource1]: value1}, .. {[dataSource]: value}]
              // Existing Data Groups and how to create one: https://factory.sismo.io/groups-explorer
              claims={CLAIMS}
              // Signature = user can sign a message embedded in their zk proof
              signature={SIGNATURE_REQUEST}
              text="Prove With Sismo"
              // Triggered when received Sismo Connect response from user data vault
              onResponse={async (response) => {
                setSismoConnectResponse(response);
                setPageState("verifying");
                const verifiedResult = await fetch("/api/verify", {
                  method: "POST",
                  body: JSON.stringify(response),
                });
                const data = await verifiedResult.json();
                if (verifiedResult.ok) {
                  setSismoConnectVerifiedResult(data);
                  setPageState("verified");
                } else {
                  setPageState("error");
                  setError(data);
                }
              }}
            />
          </>
        ) : (
          <>
            <button
              onClick={() => {
                window.location.href = "/";
              }}
            >
              {" "}
              RESET{" "}
            </button>
            <br></br>
            <div className="status-wrapper">
              {pageState == "verifying" ? (
                <span className="verifying"> Verifying ZK Proofs... </span>
              ) : (
                <>
                  {Boolean(error) ? (
                    <span className="error"> Error verifying ZK Proofs: {error} </span>
                  ) : (
                    <span className="verified"> ZK Proofs verified!</span>
                  )}
                </>
              )}
            </div>
          </>
        )}
      <div width="100%" height="100%">
        {/* {view === "default" && ( */}
          <p>
            <button className="bg-transparent hover:bg-white-500 text-white-700 font-semibold hover:text-black py-2 px-4 border border-white-500 hover:border-transparent rounded"
                    onClick={onSignIn}
            >
              Connect a wallet
            </button>
          </p>
          {/* <button
            onClick={onSignIn}
            disabled={!hasInitialized}
          ></button> */}
        {/* )} */}
        {/* {view === "signedIn" && <SignedInView address={address} />} */}
      </div>
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        {/* <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">app/page.js</code>
        </p> */}
        {/* <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div> */}
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <Image
          className="relative main-picture"
          src="/main.png"
          alt="Starkpass main picture"
          width={1500}
          height={300}
          priority
        />
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://www.meetup.com/starknet-london/events/294803596/"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800 hover:dark:bg-opacity-30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Starknet London Meetup #6: Unveiling StarknetCC Highlights{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
          July 26, 2023
          Mark your calendar for the week following ETHCC & StarknetCC as we present the next Starknet London meet-up, proudly hosted by Argent and Nethermind ​​🇬🇧
          </p>
          <p>
            <button className="bg-transparent hover:bg-white-500 text-white-700 font-semibold hover:text-black py-2 px-4 border border-white-500 hover:border-transparent rounded">
              Button
            </button>
          </p>
        </a>

        <a
          href="https://ethglobal.com/events/paris2023"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            ETHGlobal Paris{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            July 21-23, 2023
            Join the ETHGlobal Hackathon in Paris! Bring your laptop and let&apos;s code!
          </p>
        </a>

        <a
          href="https://www.meetup.com/starknet-amsterdam/events/294390075/"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Data Analytics on Starknet with Apibara: StarknetNL Workshop #1{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
          JULY 6, 2023
          Join us on a summer evening for the first Starknet workshop in Amsterdam!
          ZK-rollups like Starknet create huge amounts of data as they grow. Enter Apibara, an open-source web3 platform to stream and combine on-chain data.
          </p>
        </a>
      </div>
    </main>
  )
}
