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
  connectWallet,
  removeWalletChangeListener,
  getConnectedWallet,
} from './services/wallet-service'
import { getEvents, buyTicket } from './services/contract-service';

import {
  starknetEvents
} from './event'

const session = require('express-session')

const sismoConnectConfig = {
  appId: process.env.NEXT_PUBLIC_SISMO_APP_ID,
  vault: {
    // For development purposes insert the identifier that you want to impersonate here
    // Never use this in production
    impersonate: [
      "dhadrien.sismo.eth",
      "telegram:dhadrien",
    ],
  },
};

// Draws 500 astronauts on the screen when wallet is connected :)
function drawEmojiOnCanvas() {
  const emoji = ['👨‍🚀', '🚀'];
  const totalEmojiCount = 500;

  let continueDraw = false;
  let context = null;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let emojies = [];

  function initializeCanvas() {
    const canvas = document.getElementsByClassName('emoji-canvas')[0];
    context = canvas.getContext( '2d' );
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.scale(2, 2);
    
    generateCanvasSize(canvas);
    generateEmojis();
  }

  function generateCanvasSize(canvas) {
    const coord = canvas.getBoundingClientRect();
    canvasWidth = coord.width;
    canvasHeight = coord.height;
  }

  function generateEmojis() {
    if (continueDraw === true) return;
    emojies = [];
    
    for (let iterate = 0; iterate < totalEmojiCount; iterate++) {
      const x = Math.floor(Math.random() * canvasWidth);
      const offsetY = Math.abs(Math.floor(Math.random() * 300));
      const fontSize = Math.floor(Math.random() * 40) + 20;

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
  // wallet
  const [hasInitialized, setHasInitialized] = useState(true);
  const [view, changeView] = useState("default");
  const [address, setAddress] = useState("");

  // sismo
  const [sismoLoading, setSismoLoading] = useState(false);
  const [sismoError, setSismoError] = useState();
  const [sismoToken, setSismoToken] = useState();

  const [events, setEvents] = useState([]);

  // button events
  var buttonsStatesVar = {}
  for (let i = 0; i < starknetEvents.length; i++) {
    buttonsStatesVar[starknetEvents[i].contractId] = false
  }
  const [buttonStates, setButtonState] = useState(buttonsStatesVar);


  async function onSismoConnectResponse(response) {
    setSismoLoading(true);
    try {
      const res = await fetch("/api/sismo", {
        method: "POST",
        body: JSON.stringify(response),
      });
      if (!res.ok) {
        const sismoError = await res.json();
        setSismoError(sismoError);
        return;
      }
      const contractsWithProofs = await res.json();

      for (let i = 0; i < contractsWithProofs['contractIds'].length; i++) {
        buttonStates[contractsWithProofs['contractIds'][i]] = true;
      }
      
      setSismoToken(contractsWithProofs['proofs'])
    } catch (err) {
      setSismoError(err.message);
    } finally {
      setSismoLoading(false);
    }
  }  

  const onSignIn = useCallback(() => {
    async function getWallet () {
      const wallet = await connectWallet();
      if (!wallet) {
        toast("Rejected wallet selection or silent connect found nothing");
      }
      drawEmojiOnCanvas()
      setAddress(wallet.account.address);
      changeView("signedIn");
      setHasInitialized(wallet.isConnected);

      const events = await getEvents();
      setEvents(events)
      console.log('======= EVENTS =======');
      console.log(events);
    }

    getWallet()

    // toast('🦄 Auth request successful!');
  }, [events]);

  const onBuyTicket = useCallback(async e => {
    const tx = await buyTicket(address);
    
    //sismoToken has sismo proof.
    // Need to send to POST https://starkpass-brown.vercel.app/api/events
    // '{"contractId": "0x00001", "proofs": [], "transactionId": "0x11111"}'

    // it is awful but works, sorry
    e.target.innerHTML = 'You are in!!!'
    e.target.onClick = ''

    // Update button states anyways
    const state = buttonStates
    state[e.target.id] = true
    setButtonState(state)
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
          {!sismoToken ? (
              <>
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
                verifying={sismoLoading}
              /></>
          ): (
              <p className="py-6">Time to buy tickets!  </p>
          )}
          {view === "default" && (
            <p className="py-4">
              <button className="hover:bg-white-500 text-white-700 font-semibold py-2 px-4 border hover:border-transparent border-white-500 rounded"
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
      {starknetEvents.map((event) => (
          <div key={event.title} className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <a href={event.link} target="_blank" rel="noopener noreferrer">
              <h2 className={`mb-3 text-2xl font-semibold`}>
              {event.title}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  -&gt;
                </span>
              </h2>
            </a>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              {event.date}
              {event.description}
            </p>
            <p className="py-4">
              <button className="bg-transparent hover:bg-white-500 text-white-700 font-semibold py-2 px-4 border border-white-500 hover:border-transparent rounded"
                      onClick={onBuyTicket}>
                Buy a ticket ({event.price})
              </button>
            </p>
          </div>
      ))}
      </div>
    </main>
  )
}
