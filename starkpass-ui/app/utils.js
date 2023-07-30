import {Buffer} from 'buffer';

export function feltToString(felt) {
    const newStrB = Buffer.from(felt.toString(16), 'hex');
    return newStrB.toString();
}

export function stringToFelt(str) {
    return "0x" + Buffer.from(str).toString('hex');
}

// Draws 500 astronauts on the screen when wallet is connected :)
export function drawEmojiOnCanvas() {
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