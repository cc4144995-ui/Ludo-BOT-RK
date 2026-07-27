const WebSocket = require('ws');

// ================= কাস্টমাইজেশন সেকশন =================
// আপনার Ludo Star অ্যাকাউন্ট/ক্লাবের তথ্য দিয়ে নিচের মানগুলো পরিবর্তন করুন
const CONFIG = {
  // Ludo Star চ্যাট/ক্লাব সার্ভারের WebSocket URL
  SERVER_URL: process.env.SERVER_URL || 'wss://chat.ludostar.com/socket',
  
  // আপনার বোট অ্যাকাউন্টের টোকেন বা সেশন আইডি
  BOT_TOKEN: process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE',
  
  // আপনার লুডো স্টার ক্লাব বা রুম আইডি
  ROOM_ID: process.env.ROOM_ID || '4863914',
  
  // ওয়েলকাম মেসেজ
  WELCOME_MESSAGE: 'WELCOME TO 🌹MATIR MANUS🌹 CLUB!'
};
// =======================================================

function connectBot() {
  console.log('Connecting to Ludo Star Club server...');
  const ws = new WebSocket(CONFIG.SERVER_URL);

  ws.on('open', () => {
    console.log('✅ Bot successfully connected!');

    // রুমে লগইন করার রিকোয়েস্ট (Ludo Star প্রোটোকল অনুযায়ী)
    const joinPayload = JSON.stringify({
      action: 'join_room',
      roomId: CONFIG.ROOM_ID,
      token: CONFIG.BOT_TOKEN
    });

    ws.send(joinPayload);
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      // নতুন ইউজার রুমে জয়েন করলে (User Join Event)
      if (message.event === 'user_joined' || message.type === 'USER_ENTER') {
        const userName = message.user ? message.user.name : 'Friend';
        console.log(`👤 ${userName} entered the room.`);

        // ওয়েলকাম মেসেজ পাঠানো
        sendGreeting(ws, userName);
      }
    } catch (err) {
      // চ্যাট মেসেজ প্লেন টেক্সট বা অন্য ফরম্যাটে থাকলে তা হ্যান্ডেল করা
      console.log('Received raw message:', data.toString());
    }
  });

  ws.on('close', () => {
    console.log('❌ Disconnected! Reconnecting in 5 seconds...');
    setTimeout(connectBot, 5000); // সংযোগ বিচ্ছিন্ন হলে অটোমেটিক রিকানেক্ট হবে
  });

  ws.on('error', (error) => {
    console.error('⚠️ WebSocket Error:', error.message);
  });
}

function sendGreeting(socket, userName) {
  const textPayload = JSON.stringify({
    action: 'send_chat',
    roomId: CONFIG.ROOM_ID,
    text: `Hey ${userName}, ${CONFIG.WELCOME_MESSAGE}`
  });

  socket.send(textPayload);
}

// বোট রানিং শুরু
connectBot();
