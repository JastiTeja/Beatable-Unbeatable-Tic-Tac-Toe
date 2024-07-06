
/**LOOK CLOSELY: the following method contains all the AI-magic needed for TicTacToe!

The maximizing player tries to maximize the score, the minimizing player tries to minimize the score -> that's where the name comes from ;) This way the AI always selects the best move, for itself and its opponent!
Make sure to watch the video linked in the Pen Description if you are not yet familiar with the minimax algorithm.
**/

/** Returns the best move in the current situation for the current player using the minimax-algorithm. */
function minimax(board, depth, isMaximizing) {
    let winner = getWinner();
    if (winner != null) {
      return { score: scoreOf(winner) };
    }
  
    if (depth == 0) {
      //is not used in this game, because it's so simple and we can calculate all possible situations
      //normally you would want to stop at a certain depth (e.g. 10) and calculate "how good" the current situation is
    }
  
    let score = isMaximizing ? -Infinity : Infinity;
    let move;
  
    /*
    For every available cell, set the symbol of the current player, calculate the score and decide which is the best move from here on. The score and the move is then returned.
    The maximizing player is the ai, the minimizing player is the human playing the game.
    */
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        if (board[x][y] == null) {
          //Try and calculate score
          if (isMaximizing) {
            board[x][y] = maxPlayer;
            let nextScore = minimax(board, depth - 1, !isMaximizing).score;
            if (nextScore > score) {
              score = nextScore;
              move = { x, y };
            }
            //This is for some extra randomness, when multiple moves achieve the same score, randomly decide which to choose.
            else if (nextScore == score && Math.random() > 0.9) {
              move = { x, y };
            }
          } else {
            board[x][y] = minPlayer;
            let nextScore = minimax(board, depth - 1, !isMaximizing).score;
            if (nextScore < score) {
              score = nextScore;
              move = { x, y };
            }
          }
          //Revert
          board[x][y] = null;
        }
      }
    }
    //Return the best score and the best move
    return { score, move };
  }
  
  /**
  THAT'S IT!
  From here on it's just variables, initialization, game logic, ui controlling and helper methods. The magic is within the MINIMAX itself! ;)
  **/
  
  // PROPS UI
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  const end = document.getElementById("end");
  const start = document.getElementById("start");
  const aiSwitch = document.getElementById("aiSwitch");
  const playAgain = document.getElementById("playAgain");
  const winnerHeader = document.getElementById("winnerHeader");
  const winnerText = document.getElementById("winnerText");
  const tooltip = document.getElementById("tooltip");
  const tooltipText = document.getElementById("tooltipText");
  
  const buttonX = document.getElementById("buttonX");
  const buttonO = document.getElementById("buttonO");
  
  const WINNING_TEXT = "THE WINNER IS:";
  const TIE_TEXT = "NO WINNER THIS TIME!";
  
  var uiEnabled = false;
  
  // PROPS DRAWING
  var contextWidth = 0;
  var contextHeight = 0;
  var cellWidth = 0;
  var cellHeight = 0;
  var contentSize = 0;
  let strokeWidth = 0;
  
  // PROPS GAME LOGIC
  var currentSymbol = null;
  const SYMBOLS = ["X", "O"];
  const STARTING_SYMBOL = "X";
  
  const X = createCell("X");
  const O = createCell("O");
  const TIE = createCell("TIE");
  
  var aiEnabled = false;
  var maxPlayer;
  var minPlayer;
  
  var board = null;
  
  // AI
  
  function initAi(aiCell, humanCell) {
    aiEnabled = true;
    maxPlayer = aiCell;
    minPlayer = humanCell;
  }
  
  function makeBestMove() {
    if (countEmptyCells() == 0) {
      return;
    }
  
    uiEnabled = false;
    let bestMove = minimax(board, 0, true).move;
    // Simulate "ai is thinking of next turn"
    setTimeout(function () {
      addSymbol(bestMove.x, bestMove.y);
      uiEnabled = true;
    }, 500);
  }
  
  function scoreOf(winner) {
    if (winner == maxPlayer.symbol) {
      return 1;
    }
    if (winner == minPlayer.symbol) {
      return -1;
    }
    return 0;
  }
  
  // GAME LOGIC
  
  function createCell(symbol) {
    return { symbol: symbol, animationOffset: 0, isWinning: false };
  }
  
  function init() {
    board = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];
    currentSymbol = null;
    toggleCurrentSymbol();
  
    resize();
  
    if (aiEnabled && maxPlayer.symbol == STARTING_SYMBOL) {
      makeBestMove();
    } else {
      uiEnabled = true;
    }
    next();
  }
  
  function startGame(button) {
    let enableAi = aiSwitch.checked;
    if (enableAi) {
      if (button == buttonX) {
        initAi(O, X);
      } else {
        initAi(X, O);
      }
    }
    init();
    hideStartScreen();
  }
  
  function restartGame() {
    init();
  }
  
  function next() {
    checkWinner();
    draw();
  }
  
  /** Returns the winning symbol */
  function getWinner() {
    let winnerCells = getWinnerCells();
    return winnerCells == null ? null : winnerCells[0].symbol;
  }
  
  /** Returns all winning cells */
  function getWinnerCells() {
    let winningCells = [];
    //horizontal
    for (let i = 0; i < 3; i++) {
      if (equals3(board[i][0], board[i][1], board[i][2])) {
        winningCells.push(board[i][0], board[i][1], board[i][2]);
      }
    }
  
    //vertical
    for (let i = 0; i < 3; i++) {
      if (equals3(board[0][i], board[1][i], board[2][i])) {
        winningCells.push(board[0][i], board[1][i], board[2][i]);
      }
    }
  
    //diagonal
    if (equals3(board[0][0], board[1][1], board[2][2])) {
      winningCells.push(board[0][0], board[1][1], board[2][2]);
    }
    if (equals3(board[2][0], board[1][1], board[0][2])) {
      winningCells.push(board[2][0], board[1][1], board[0][2]);
    }
  
    if (countEmptyCells() == 0 && winningCells.length == 0) {
      return [TIE];
    }
  
    return winningCells.length > 0 ? winningCells : null;
  }
  
  function countEmptyCells() {
    let emptyCells = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] == null) {
          emptyCells++;
        }
      }
    }
    return emptyCells;
  }
  
  // GAME LOGIC HELPERS
  
  function addSymbol(x, y) {
    if (board[x][y] == null) {
      board[x][y] = createCell(currentSymbol);
      toggleCurrentSymbol();
      next();
      return true;
    }
    return false;
  }
  
  function toggleCurrentSymbol() {
    if (currentSymbol == null) {
      currentSymbol = STARTING_SYMBOL;
    } else {
      currentSymbol = currentSymbol == SYMBOLS[0] ? SYMBOLS[1] : SYMBOLS[0];
    }
    tooltipText.innerHTML = currentSymbol;
    if (aiEnabled && currentSymbol == minPlayer.symbol) {
      tooltipText.innerHTML += " (YOU)";
    }
  }
  
  function equals3(a, b, c) {
    if (a == null || b == null || c == null) {
      return false;
    }
    return a.symbol == b.symbol && b.symbol == c.symbol;
  }
  
  function setWinning(cells) {
    cells.forEach(function (winner) {
      winner.isWinning = true;
    });
  }
  
  // UI
  
  window.addEventListener("resize", resize, false);
  canvas.addEventListener("click", handleClick, false);
  playAgain.addEventListener("click", restartGame, false);
  
  function resize() {
    contextWidth = canvas.offsetWidth;
    contextHeight = canvas.offsetHeight;
    canvas.width = contextWidth;
    canvas.height = contextHeight;
    cellWidth = contextWidth / 3;
    cellHeight = contextHeight / 3;
    contentSize = Math.min(cellWidth, cellHeight) / 3;
    strokeWidth = contentSize / 6;
    next();
  }
  
  function checkWinner() {
    let winners = getWinnerCells();
    if (winners != null) {
      setWinning(winners);
      createEndScreenForWinner(winners[0]);
      toggleEndScreen(true);
      uiEnabled = false;
    } else {
      toggleEndScreen(false);
    }
    return false;
  }
  
  function createEndScreenForWinner(winner) {
    winnerHeader.innerHTML = winner == TIE ? TIE_TEXT : WINNING_TEXT;
    winnerText.innerHTML = winner.symbol;
  }
  
  function toggleEndScreen(visible) {
    end.style.visibility = visible ? "visible" : "hidden";
    end.style.opacity = visible ? "1" : "0";
  }
  
  function hideStartScreen() {
    start.style.visibility = "hidden";
    tooltip.style.visibility = "visible";
  }
  
  function handleClick(e) {
    if (uiEnabled) {
      var xPosition = e.clientX - canvas.getBoundingClientRect().left;
      var yPosition = e.clientY - canvas.getBoundingClientRect().top;
      var xIndex = Math.floor(xPosition / cellWidth);
      var yIndex = Math.floor(yPosition / cellHeight);
      let valid = addSymbol(xIndex, yIndex);
      if (valid && aiEnabled) {
        makeBestMove();
      }
    }
  }
  
  // DRAWING
  
  function draw() {
    context.clearRect(0, 0, contextWidth, contextHeight);
    addGridToCanvas();
    addSymbolsToCanvas();
  }
  
  function addGridToCanvas() {
    context.strokeStyle = "gray";
    context.lineWidth = strokeWidth / 2;
    line(cellWidth, 0, cellWidth, contextHeight);
    line(cellWidth * 2, 0, cellWidth * 2, contextHeight);
    line(0, cellHeight, contextWidth, cellHeight);
    line(0, cellHeight * 2, contextWidth, cellHeight * 2);
  }
  
  function line(x1, y1, x2, y2) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  }
  
  function addSymbolsToCanvas() {
    context.strokeStyle = "black";
    context.lineWidth = strokeWidth;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let centerX = i * cellWidth + cellWidth / 2;
        let centerY = j * cellHeight + cellHeight / 2;
  
        let cell = board[i][j];
        if (cell != null) {
          if (cell.symbol == O.symbol) {
            drawCircle(cell, centerX, centerY);
          } else if (cell.symbol === X.symbol) {
            drawLine(cell, centerX, centerY);
          }
        }
      }
    }
  }
  
  function setColor(cell) {
    if (cell != null) {
      if (cell.isWinning) {
        context.strokeStyle = getGradient();
      } else {
        context.strokeStyle = "black";
      }
    }
  }
  
  function getGradient() {
    var gradient = context.createLinearGradient(
      0,
      0,
      contextWidth,
      contextHeight / 2
    );
    gradient.addColorStop("0", "#4ECDC4");  
    gradient.addColorStop("0.1", "#6DCFF6");
    gradient.addColorStop("0.2", "#87D9F2");
    gradient.addColorStop("0.3", "#A2E3EF");
    gradient.addColorStop("0.4", "#1b1b1e");
    gradient.addColorStop("0.6", "#A2E3EF");
    gradient.addColorStop("0.7", "#87D9F2");
    gradient.addColorStop("0.8", "#6DCFF6");
    gradient.addColorStop("1.0", "#4ECDC4");
    
    return gradient;
  }
  
  function drawCircle(cell, centerX, centerY) {
    setColor(cell);
    clearDrawBox(centerX, centerY);
    context.beginPath();
    context.arc(
      centerX,
      centerY,
      contentSize,
      0,
      cell.animationOffset * 2 * Math.PI
    );
    context.stroke();
  
    if (cell.animationOffset < 1) {
      cell.animationOffset += 0.05;
      requestAnimationFrame(function (timestamp) {
        drawCircle(cell, centerX, centerY);
      });
    }
  }
  
  function drawLine(cell, centerX, centerY) {
    setColor(cell);
    clearDrawBox(centerX, centerY);
    let firstOffset = Math.min(cell.animationOffset, 0.5) * contentSize * 4;
    let secondOffset = Math.max(cell.animationOffset - 0.5, 0) * contentSize * 4;
    line(
      centerX - contentSize,
      centerY - contentSize,
      centerX - contentSize + firstOffset,
      centerY - contentSize + firstOffset
    );
    line(
      centerX - contentSize + secondOffset,
      centerY + contentSize - secondOffset,
      centerX - contentSize,
      centerY + contentSize
    );
  
    if (cell.animationOffset < 1) {
      cell.animationOffset += 0.05;
      requestAnimationFrame(function (timestamp) {
        drawLine(cell, centerX, centerY);
      });
    }
  }
  
  function clearDrawBox(centerX, centerY) {
    context.clearRect(
      centerX - contentSize - strokeWidth,
      centerY - contentSize - strokeWidth,
      contentSize * 2 + strokeWidth * 2,
      contentSize * 2 + strokeWidth * 2
    );
  }
  
  function toggleCheckboxLabel() {
    const aiSwitch = document.getElementById("aiSwitch");
    const offLabel = document.getElementById("offLabel");
    const onLabel = document.getElementById("onLabel");
  
    if (aiSwitch.checked) {
      buttonO.style.display = "initial";
      onLabel.classList.add("selected");
      offLabel.classList.remove("selected");
    } else {
      buttonO.style.display = "none";
      onLabel.classList.remove("selected");
      offLabel.classList.add("selected");
    }
  }
  