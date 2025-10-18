import penSvg from '../img/pen.svg';

function Comments({ commentsVisible, toggle }) {
  return (
    <>
      <button className="comments-button" onClick={toggle}>
        <img className="pen-svg" src={penSvg} alt="penSvg" style={{ width: 20, height: 20 }} />
      </button>
      <div className={`comments-container ${commentsVisible ? 'visible' : ''}`}>
        <h3 className="comments-header">Comments</h3>
        <p>Comments implementation goes here...</p>
      </div>
    </>
  );
}

export default Comments;
