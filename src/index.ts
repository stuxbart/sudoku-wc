class SudokuCell extends HTMLElement {
	private _input: HTMLInputElement;
	private _value: number = 0;
	private _row: number;
	private _col: number;
	private _err: boolean = false;

	constructor(row: number, col: number) {
		super();
		this._input = document.createElement("input");
		this.appendChild(this._input);
		this.setValue(0);
		this._input.addEventListener("blur", () => this._onBlur());
		this._input.addEventListener("click", () => this._input.select());
		this._row = row;
		this._col = col;
		this._setInputStyle();
	}

	public get value() {
		return this._value;
	}

	public setValue(value: number): void {
		if (value) {
			this._input.value = value + "";
		} else {
			this._input.value = ""; // empty cell if 0
		}
		this._value = value;
	}

	public setSize(width: number, height: number): void {
		this._input.style.width = width + "px";
		this._input.style.height = height + "px";
		this._input.style.fontSize = height * 0.5 + "px";
	}

	private _onBlur(): void {
		const newValue = this._input.value;
		if (newValue === "") {
			this.setValue(0);
			this._updateValue();
			this._clearError();
			return;
		}

		const num = parseInt(newValue);
		if (num < 10 && num > 0) {
			this.setValue(num);
			this._updateValue();
			this._clearError();
		} else {
			this._setError();
		}
	}

	private _updateValue(): void {
		try {
			const parent = this.parentElement as Sudoku;
			parent.setValue(this._row, this._col, this._value);
		} catch (err: any) {
			throw new Error("Cell element outside of sudoku-game element");
		}
	}

	private _setError(): void {
		this._err = true;
		this._input.style.color = "red";
	}

	private _clearError(): void {
		this._err = false;
		this._input.style.color = "black";
	}

	private _setInputStyle(): void {
		this._input.style.width = "20px";
		this._input.style.height = "20px";
		this._input.style.border = "none";
		this._input.style.outline = "none";
		this._input.style.padding = "0";
		this._input.style.margin = "0";
		this._input.style.textAlign = "center";
		this.style.border = "1px solid black";
		if (this._row === 2 || this._row === 5) {
			this.style.borderBottom = "2px solid black";
		} else if (this._row === 3 || this._row === 6) {
			this.style.borderTop = "2px solid black";
		}

		if (this._col === 2 || this._col === 5) {
			this.style.borderRight = "2px solid black";
		} else if (this._col === 3 || this._col === 6) {
			this.style.borderLeft = "2px solid black";
		}
	}
}

class Sudoku extends HTMLElement {
	private _grid: number[][] = [];
	private _cellSize: number = 40;
	private _size: number = 300;

	constructor() {
		super();
		if (this.hasAttribute("size")) {
			this._size = parseInt(this.getAttribute("size"));
		}
		this._cellSize = this._size / 9;

		for (let i = 0; i < 9; i++) {
			const row = [];
			for (let j = 0; j < 9; j++) {
				row.push(0);
				const cell = new SudokuCell(i, j);
				this.appendChild(cell);
				cell.setSize(this._cellSize, this._cellSize);
			}
			this._grid.push(row);
		}

		this.style.display = "grid";
		this.style.gridTemplateRows = `repeat(9, 1fr)`;
		this.style.gridTemplateColumns = `repeat(9, 1fr)`;
		this.style.border = "3px solid black";
		this.style.width = this._size + 28 + "px";
		this.style.height = this._size + 28 + "px";
		this.style.boxSizing = "border-box";
	}

	public check(): boolean {
		const isValid = this.isValid();
		if (isValid) {
			this.style.borderColor = "black";
		} else {
			this.style.borderColor = "red";
		}
		return isValid;
	}

	public reset(): void {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				this._grid[i][j] = 0;
			}
		}
		this.style.borderColor = "black";
		this._updateCells();
	}

	public random(num: number = 10): void {
		if (num > 81) {
			num = 81;
		}
		this.reset();
		let selectedNumebrs = 0;
		let maxSteps = 20000;
		while (selectedNumebrs < num && maxSteps > 0) {
			const randRow = Math.round(Math.random() * 8);
			const randCol = Math.round(Math.random() * 8);
			const randVal = Math.round(Math.random() * 8) + 1;
			if (
				!this._grid[randRow][randCol] &&
				this._canBeInserted(randRow, randCol, randVal)
			) {
				this._grid[randRow][randCol] = randVal;
				selectedNumebrs++;
			}
			maxSteps--;
		}
		this._updateCells();
	}

	public setValue(row: number, col: number, val: number): void {
		this._grid[row][col] = val;
	}

	public solve(): boolean {
		let maxSteps = 10000000;

		const _nextCell = (row: number, col: number): [number, number] => {
			const nextRow = col === 8 ? row + 1 : row;
			const nextCol = col === 8 ? 0 : col + 1;
			return [nextRow, nextCol];
		};

		const _setNext = (row: number, col: number): boolean => {
			if (maxSteps < 0) {
				return false;
			} else {
				maxSteps--;
			}
			const cell = this._grid[row][col];

			if (cell) {
				const [nextRow, nextCol] = _nextCell(row, col);
				if (nextRow === 9) {
					return true;
				}
				return _setNext(nextRow, nextCol);
			}

			let res = false;
			for (let i = 1; i < 10; i++) {
				if (!this._canBeInserted(row, col, i)) {
					continue;
				}

				this._grid[row][col] = i;
				const [nextRow, nextCol] = _nextCell(row, col);

				if (nextRow === 9) {
					return true;
				}
				res = _setNext(nextRow, nextCol);
				if (res) {
					break;
				}
			}
			if (!res) {
				this._grid[row][col] = 0;
				return false;
			} else {
				return true;
			}
		};
		_setNext(0, 0);
		const res = this.check();

		this._updateCells();
		return res;
	}

	public isValid(): boolean {
		// check rows
		for (let i = 0; i < 9; i++) {
			const required = [1, 2, 3, 4, 5, 6, 7, 8, 9];
			for (let j = 0; j < 9; j++) {
				const index = required.indexOf(this._grid[i][j]);
				if (index < 0) {
					return false;
				} else {
					required.splice(index, 1);
				}
			}
		}

		// check columns
		for (let i = 0; i < 9; i++) {
			const required = [1, 2, 3, 4, 5, 6, 7, 8, 9];
			for (let j = 0; j < 9; j++) {
				const index = required.indexOf(this._grid[j][i]);
				if (index < 0) {
					return false;
				} else {
					required.splice(index, 1);
				}
			}
		}

		// check squares
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				const required = [1, 2, 3, 4, 5, 6, 7, 8, 9];

				for (let ii = 0; ii < 3; ii++) {
					for (let jj = 0; jj < 3; jj++) {
						const index = required.indexOf(
							this._grid[i * 3 + ii][j * 3 + jj]
						);
						if (index < 0) {
							return false;
						} else {
							required.splice(index, 1);
						}
					}
				}
			}
		}
		return true;
	}

	private _updateCells(): void {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				const child = this.childNodes[i * 9 + j] as SudokuCell;
				child.setValue(this._grid[i][j]);
			}
		}
	}

	private _canBeInserted(r: number, c: number, v: number): boolean {
		const row = this._grid[r];
		for (let j = 0; j < row.length; j++) {
			if (j !== c && row[j] === v) {
				return false;
			}
		}
		for (let j = 0; j < row.length; j++) {
			if (j !== r && this._grid[j][c] === v) {
				return false;
			}
		}
		const i = Math.floor(r / 3);
		const j = Math.floor(c / 3);
		for (let ii = 0; ii < 3; ii++) {
			for (let jj = 0; jj < 3; jj++) {
				if (i * 3 + ii === r && j * 3 + jj === c) {
				} else {
					const el = this._grid[i * 3 + ii][j * 3 + jj];
					if (el === v) {
						return false;
					}
				}
			}
		}
		return true;
	}
}

customElements.define("sudoku-cell", SudokuCell);
customElements.define("sudoku-game", Sudoku);
