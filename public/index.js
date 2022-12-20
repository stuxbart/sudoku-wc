const solveButton = document.getElementById("solve");
const checkButton = document.getElementById("check");
const resetButton = document.getElementById("reset");
const randomButton = document.getElementById("random");

solveButton.addEventListener("click", () => {
	const sud = document.getElementsByTagName("sudoku-game");
	const game = sud[0];
	game.solve();
});

checkButton.addEventListener("click", () => {
	const sud = document.getElementsByTagName("sudoku-game");
	const game = sud[0];
	game.check();
});

resetButton.addEventListener("click", () => {
	const sud = document.getElementsByTagName("sudoku-game");
	const game = sud[0];
	game.reset();
});

randomButton.addEventListener("click", () => {
	const sud = document.getElementsByTagName("sudoku-game");
	const game = sud[0];
	game.random(20);
});
