import chatSvg from '../img/chat.svg';
import sendSvg from '../img/send.svg';


function Chat({ chatVisible, toggle }) {
  return (
    <>
      <button className="chat-button" onClick={toggle}>
        <img className="chat-svg" src={chatSvg} alt="chatSvg" style={{ width: 20, height: 20 }} />
      </button>
      <div className={`chat-container ${chatVisible ? 'visible' : ''}`}>
        <div className='chat-inner-container'>
          <h3 className="chat-header">Chat</h3>
          <p>Chat implementation goes here...</p>
          <form className="chat-form" /* onSubmit={X} */>
            <input
              type="text"
/*               value=X */
/*               onChange={X} */
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
