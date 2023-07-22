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

var session = require('express-session')

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

function drawEmojiOnCanvas() {
  var emoji = ['🦄'];
  // var emoji = ['💓','💕','💖','🎀','🌺','🌸']; // theme for #LetLeniLead2022
  var totalEmojiCount = 500;

  var continueDraw = false;
  var context;
  var canvasWidth;
  var canvasHeight;
  var emojies = [];

  function initializeCanvas() {
    var canvas = document.getElementsByClassName('emoji-canvas')[0];
    context = canvas.getContext( '2d' );
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.scale(2, 2);
    
    generateCanvasSize(canvas);
    generateEmojis();
  }

  function generateCanvasSize(canvas) {
    var coord = canvas.getBoundingClientRect();
    canvasWidth = coord.width;
    canvasHeight = coord.height;
  }

  function generateEmojis() {
    if (continueDraw === true) return;
    emojies = [];
    
    for (var iterate = 0; iterate < totalEmojiCount; iterate++) {
      var x = Math.floor(Math.random() * canvasWidth);
      var offsetY = Math.abs(Math.floor(Math.random() * 300));
      var fontSize = Math.floor(Math.random() * 40) + 20;

      emojies.push({
        emoji: emoji[Math.floor(Math.random() * emoji.length)],
        x,
        y: canvasHeight + offsetY,
        count: Math.floor(Math.random() * 3) + 4,
        fontSize,
      });

      if (iterate === (totalEmojiCount - 1)) {
        continueDraw = true;
        drawConfetti();
        endDraw();
      }
    }
  }

  function drawConfetti() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    emojies.forEach((emoji) => {
      drawEmoji(emoji);
      emoji.y = emoji.y - emoji.count;
    });

    if (continueDraw) {
      requestAnimationFrame(drawConfetti.bind(this));
    }
  }

  function drawEmoji(emoji) {
    context.beginPath();
    context.font = emoji.fontSize + 'px serif';
    context.fillText(emoji.emoji, emoji.x, emoji.y);
  }

  function endDraw() {
    setTimeout(() => {
      continueDraw = false;
      context.clearRect(0, 0, canvasWidth, canvasHeight);
    }, 5000);
  }

  initializeCanvas();
}

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
      const proofsJson = await res.json();
      //TODO: store in session
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }  

  const onSignIn = useCallback(async () => {
    const starknet = await connectWallet()
    if (!starknet) {
      toast("Rejected wallet selection or silent connect found nothing");
    }

    drawEmojiOnCanvas()

    // toast('🦄 Auth request successful!');

    setAddress(starknet.account.address);
    changeView("signedIn");
    setHasInitialized(starknet.isConnected);
  },[]);

  const onBuyTicket = useCallback(async () => {
    console.log(address);
    await buyTicket(address);
  }, [address]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-16">
      <canvas className="emoji-canvas"></canvas>
      <div className="z-10 w-full max-w-7xl items-center justify-between font-mono text-sm lg:flex">
        <h2 className={`pt-5 text-2xl font-semibold place-self-start justify-self-center`}>STARKPASS</h2>
        <div width="100%" height="100%" className="place-self-end flex items-center">
          <div>
            <ToastContainer />
          </div>
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
            <p className="py-6">Connected: {truncateAddress(address)}</p>
          )}
        </div>
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

      <div className="z-10 w-full max-w-7xl grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
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
