/*import JsSIP from 'jssip';

export const initVoIP = () => {
  const socket = new JsSIP.WebSocketInterface('wss://your.sip.server'); // Replace with your SIP server URL
  const configuration = {
    sockets: [socket],
    uri: 'sip:username@your.sip.server', // Replace with your SIP URI
    password: 'password' // Replace with your password
  };

  const ua = new JsSIP.UA(configuration);
  ua.start();

  ua.on('registered', () => console.log('Registered successfully.'));
  ua.on('registrationFailed', (e) => console.error('Registration failed:', e.cause));
  ua.on('newRTCSession', (e) => {
    const session = e.session;
    console.log('New RTC session initiated.');

    session.on('accepted', () => console.log('Call accepted.'));
    session.on('failed', (e) => console.error('Call failed:', e.cause));
  });
};
*/
