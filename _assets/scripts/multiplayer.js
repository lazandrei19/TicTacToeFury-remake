(function() {
	/*
	 *	INIT
	 */
	//init vars
	var currentPlayer = 1;
	var myUser;
	var color = 'red'; //render
	var $board = $('.board');
	var $bigCells = $board.find('.big-cell');
	var $window = $(window);
	var boards = [[[0, 0, 0],[0, 0, 0],[0, 0],0], [[0, 0, 0],[0, 0, 0],[0, 0],0], [[0, 0, 0],[0, 0, 0],[0, 0],0], [[0, 0, 0],[0, 0, 0],[0, 0],0], [[0, 0, 0],[0, 0, 0],[0, 0],0], [[0, 0, 0],[0, 0, 0],[0, 0],0], [[0, 0, 0],[0, 0, 0],[0, 0],0], [[0, 0, 0],[0, 0, 0],[0, 0],0], [[0, 0, 0],[0, 0, 0],[0, 0],0], [[0, 0, 0],[0, 0, 0],[0, 0],0]];
	var activeCell = -1;
	var socket = io.connect('http://localhost:3000');
	var username = location.pathname.split('/')[2];
	var $display = $('.display');
	var $displayText = $display.find('h1');

	//init functions
	resizeBoard();
	socket.emit('username', username);

	socket.on('gameStarted', function(me) {
		myUser = me;
		var message = (myUser === 1)? 'You are first player' : 'You are second player';
		$displayText.html(message);
		$display.css('display', 'inline-block');
		setTimeout(function() {
			$display.css('display', 'none');
		}, 1000);
	});
	socket.on('opponentMove', function(oMove) {
		console.log(oMove);
		move(oMove.bigCell, oMove.smallCell, oMove.player);
	});

	//bindings
	$('.small-cell').bind('click', getMoveCoordinates);
	$window.resize(resizeBoard);

	//functions
	function resizeBoard () {
		var size = Math.floor((Math.min($window.width(), $window.height()) - 30) / 9);
		$board.css('font-size', size);
	}

	function getMoveCoordinates (e) {
		var $target = $(e.target);
		var bigCell = $bigCells.index($target.parent());
		var smallCell = $bigCells.eq(bigCell).find('.small-cell').index($target);
		if(currentPlayer == myUser) {
			socket.emit('move', {bigCell: bigCell, smallCell: smallCell, player: myUser});
			move(bigCell, smallCell, currentPlayer);
		}
	}

	function move (bigCell, smallCell, player) {
		var $bigCell = $bigCells.eq(bigCell);
		var $smallCell = $bigCell.find('.small-cell').eq(smallCell);
		if((typeof $smallCell.attr('data-player') === typeof undefined || $smallCell.attr('data-player') === false) && (activeCell === -1 || bigCell === activeCell)) { //add check also in otter form
			$smallCell.attr('data-player', currentPlayer); //render part
			analyzeMove(bigCell, smallCell, player);
			activeCell = ($bigCells.eq(smallCell).find('.small-cell[data-player="1"], .small-cell[data-player="2"]').length === 9)? -1 : smallCell;
			$board.attr('data-cell', activeCell); //render
			changePlayer();
		}
	}

	function analyzeMove (bigCell, smallCell, player) {
		var board = boards[bigCell];
		var delta = (player === 1)? 1 : -1;
		switch(smallCell) {
			case 0:
				board[0][0] += delta;
				board[1][0] += delta;
				board[2][0] += delta;
				break;
			case 1:
				board[0][0] += delta;
				board[1][1] += delta;
				break;
			case 2:
				board[0][0] += delta;
				board[1][2] += delta;
				board[2][1] += delta;
				break;
			case 3:
				board[0][1] += delta;
				board[1][0] += delta;
				break;
			case 4:
				board[0][1] += delta;
				board[1][1] += delta;
				board[2][0] += delta;
				board[2][1] += delta;
				break;
			case 5:
				board[0][1] += delta;
				board[1][2] += delta;
				break;
			case 6:
				board[0][2] += delta;
				board[1][0] += delta;
				board[2][1] += delta;
				break; 
			case 7:
				board[0][2] += delta;
				board[1][1] += delta;
				break;
			case 8:
				board[0][2] += delta;
				board[1][2] += delta;
				board[2][0] += delta;
				break;
		}
		board[3] = victoryCheck(bigCell);
		boards[bigCell] = board;
	}

	function victoryCheck (boardNumber) {
		var board = boards[boardNumber];
		if (board[3] === 0) {
			for (var i = 0; i < 3; ++i) {
				var nCheck = board[i];
				for (var j = 0; j < nCheck.length; ++j) {
					if (Math.abs(nCheck[j]) === 3) {
						if (boardNumber !== 9) {
							console.log('whyy??');
							analyzeMove(9, boardNumber, currentPlayer);
						} else {
							alert(color + " won");
						}
						$bigCells.eq(boardNumber).addClass(color); //render
						return currentPlayer;
					}
				}
			}
			return 0;
		} else {
			console.log(board[3]);
			return board[3];
		}
	}

	function changePlayer () {
		currentPlayer = (currentPlayer === 1) ? 2 : 1;
		color = (color === 'red') ? 'blue' : 'red'; //render
		$board.attr('data-color', color); //render
	}
})();