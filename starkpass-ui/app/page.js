'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { 
  SismoConnectButton, 
  AuthType,
  ClaimType,
} from '@sismo-core/sismo-connect-react';

import { truncateAddress } from './services/address-service'
import {
  addWalletChangeListener,
  chainId,
  connectWallet,
  removeWalletChangeListener,
  silentConnectWallet,
} from './services/wallet-service'
import { buyTicket } from './services/contract-service';

const sismoConnectConfig = {
  appId: "0x2e4b0b020662622f0fd32d496be3beca",
  vault: {
    // For development purposes insert the identifier that you want to impersonate here
    // Never use this in production
    impersonate: [
      "dhadrien.sismo.eth",
      "telegram:dhadrien",
    ],
  },
};

export default function EventsList() {
  const [hasInitialized, setHasInitialized] = useState(true);
  const [view, changeView] = useState("default");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  async function onSismoConnectResponse(response) {
    setLoading(true);
    try {
      const res = await fetch("/api/sismo", {
        method: "POST",
        body: JSON.stringify(response),
      });
      if (!res.ok) {
        const error = await res.json();
        setError(error);
        return;
      }
      const user = await res.json();
      setUser(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }  

  const onSignIn = useCallback(async () => {
    const starknet = await connectWallet()
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

    setAddress(starknet.account.address);
    changeView("signedIn");
    setHasInitialized(starknet.isConnected);
  },[]);

  const onBuyTicket = useCallback(async () => {
    console.log(address);
    await buyTicket(address);
  }, [address]);

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ToastContainer />
      
      <SismoConnectButton
        // the client config created
        config={sismoConnectConfig}
        // the auth request we want to make
        // here we want the proof of a Sismo Vault ownership from our users
        auths={[
          { authType: AuthType.VAULT },
          { authType: AuthType.TELEGRAM },
        ]}
        // we ask the user to sign a message
        signature={{ message: "Sign to get a ticket", isSelectableByUser: true }}
        // onResponseBytes calls a 'setResponse' function with the responseBytes returned by the Sismo Vault
        onResponse={(response) => {
          onSismoConnectResponse(response);
        }}
        verifying={loading}
      />

      <div width="100%" height="100%" className="place-self-end">
        {view === "default" && (
          <p className="py-4">
            <button className="hover:bg-white-500 text-white-700 font-semibold hover:text-black py-2 px-4 border border-white-500 rounded"
                    onClick={onSignIn}
                    disabled={!hasInitialized}
            >
              Connect a wallet
            </button>
          </p>
        )}
        {view === "signedIn" && (
          <p className="py-4">Connected: {truncateAddress(address)}</p>
        )}
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
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <a
            href="https://www.meetup.com/starknet-london/events/294803596/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
            Starknet London Meetup #6: Unveiling StarknetCC Highlights{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
          </a>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            July 26, 2023
            Mark your calendar for the week following ETHCC & StarknetCC as we present the next Starknet London meet-up, proudly hosted by Argent and Nethermind ​​🇬🇧
          </p>
          <p className="py-4">
          <button className="bg-transparent hover:bg-white-500 text-white-700 font-semibold hover:text-black py-2 px-4 border border-white-500 hover:border-transparent rounded"
                  onClick={onBuyTicket}
          >
            Buy a ticket
          </button>
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <a
            href="https://ethglobal.com/events/paris2023"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              ETHGlobal Paris{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
          </a>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            July 21-23, 2023
            Join the ETHGlobal Hackathon in Paris! Bring your laptop and let&apos;s code!
          </p>
          <p className="py-4">
          <button className="bg-transparent hover:bg-white-500 text-white-700 font-semibold hover:text-black py-2 px-4 border border-white-500 hover:border-transparent rounded"
                  onClick={buyTicket}
          >
            Buy a ticket
          </button>
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <a
            href="https://www.meetup.com/starknet-amsterdam/events/294390075/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Data Analytics on Starknet with Apibara: StarknetNL Workshop #1{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
          </a>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            July 6, 2023
            Join us on a summer evening for the first Starknet workshop in Amsterdam!
            ZK-rollups like Starknet create huge amounts of data as they grow. Enter Apibara, an open-source web3 platform to stream and combine on-chain data.
          </p>
          <p className="py-4">
          <button className="bg-transparent hover:bg-white-500 text-white-700 font-semibold hover:text-black py-2 px-4 border border-white-500 hover:border-transparent rounded"
                  onClick={buyTicket}
          >
            Buy a ticket
          </button>
          </p>
        </div>
      </div>
    </main>
  )
}
