import { GAME_PIECE_TYPE, PIECE_TYPE_IMAGES, piecesInfo } from "@src/types"
import '@src/components/About/index.css'

export default () => {
  return (
    <section>
      <h2 className="h2">About the Game</h2>
      <div className="accordion" id="accordionExample">
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
              <strong>How the game works</strong>
            </button>
          </h2>
          <div id="collapseTwo" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
            <div className="accordion-body">
              The pieces are in <strong>hexagonal</strong> shape and can be placed besides one another. Each piece is a insect and the board is a <strong>HIVE!</strong>
              <p>You can move freely respecting the movement of the pieces. Each one of them has it's own movement.</p>
              <p>You can move the board clicking on its border. Another way to move the board is to drag a piece of the board to it's border, the board is going to move!</p>
            </div>
          </div>
        </div>
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-controls="collapseOne">
            <strong>How the pieces move?</strong> 
            </button>
          </h2>
          <div id="collapseOne" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
            <div className="accordion-body">
              <p>You have two possible moves: pieces form <strong>hand</strong> to <strong>board</strong> and <strong>board</strong> to <strong>board</strong>.</p>
              <ol className="list-group list-group">
                <li className="list-group-item d-flex justify-content-between align-items-start">
                  <span className="badge text-bg-success rounded-pill">1</span>
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">Moving a piece from Hand to Board</div>
                    It is only possible to place a piece on the side of your own piece, you can't have enemies pieces around the place you want to position.
                    <p className="text-warning">The only exception is when you are making the first move.</p>
                    <p className="text-primary">Obs: If you are with the white pieces, you can position your piece on any position from the board. 
                      And, if you have the black ones, you can position your piece on the side of an enemy.</p>
                  </div>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-start">
                  <span className="badge text-bg-success rounded-pill">2</span>
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">Moving a piece from Board to Board</div>
                    You must move the piece respecting its own type of movement, each one of them has an unique movement.
                    <p className="text-success">To move a piece, you must have the <code>Queen</code> on the board.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-controls="collapseFour">
            <strong>Insects</strong> 
            </button>
          </h2>
          <div id="collapseFour" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
            <div className="accordion-body">
            {
                Object.values(GAME_PIECE_TYPE).map(p => {
                  const pieceInfos = {
                    info: piecesInfo[p],
                    img: PIECE_TYPE_IMAGES[p],
                  }
                  return (
                    <div key={p} className="card" style={{width: "80%", margin: "10px auto"}}>
                      <div className="card-img-container">
                        <pieceInfos.img />
                      </div>
                      <div className="card-body">
                        <h5 className="card-title">{pieceInfos.info.title}</h5>
                        <p className="card-text">{pieceInfos.info.subtitle}</p>
                        <p className="card-text"><strong>Movement</strong>: {pieceInfos.info.movement}</p>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-controls="collapseThree">
            <strong>What you have to do for win?</strong> 
            </button>
          </h2>
          <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
            <div className="accordion-body">
              The objective of the game is to lock up the <code>Queen</code>, if your's is locked you lose!
              <p>If both Queens are trapped at the same time or either of the players have valid move, the game ends with a tie.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}