import chatSvg from '../img/chat.svg';
import sendSvg from '../img/send.svg';

import { useDocumentContext } from '../document-components/DocumentContext';

function Chat({ chatVisible, toggle }) {
  const {
    chatMessages,
    setChatMessages,
    socketRef,
    clientIdRef,
    currentDocIdRef,
    chatInputValue,
    setchatInputValue
  } = useDocumentContext();


  const handleChange = (e) => {
    setchatInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const socket = socketRef.current;
    const docId = currentDocIdRef.current;
    const clientId = clientIdRef.current;
    
    if (socket && docId && clientId) {
      socket.emit("chat-message-backend", {
        id: docId,
        msg: `${clientId}: ${chatInputValue}`,
      });
  
      setchatInputValue("");
    } else {
      console.log("Error, could not send message");
    }
  };
  

  return (
    <>
      <button className="chat-button" onClick={toggle}>
        <img className="chat-svg" src={chatSvg} alt="chatSvg" style={{ width: 20, height: 20 }} />
      </button>

      <div className={`chat-container ${chatVisible ? 'visible' : ''}`}>
        <div className='chat-inner-container'>
          <h3 className="chat-header">Chat</h3>

          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
          </div>

          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={chatInputValue}
              onChange={handleChange}
              placeholder="Type your message..."
              className="chat-input"
            />

            <button type="submit" className="chat-input-button">
              <img className="send-svg" src={sendSvg} alt="sendSvg" style={{ width: 20, height: 20 }} />
            </button>
          </form>
        </div>  
      </div>
    </>
  );
}

export default Chat;
