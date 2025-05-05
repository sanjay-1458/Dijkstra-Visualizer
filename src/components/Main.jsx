import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import UseHelp from "./UseHelp";

function getGridSize() {
  const w = window.innerWidth;

  if (w >= 1838) {
    return { rows: 16, cols: 16 };
  } else if (w >= 1219) {
    return { rows: 16, cols: 16 };
  } else if (w >= 1141) {
    return { rows: 15, cols: 15 };
  } else if (w >= 1073) {
    return { rows: 14, cols: 14 };
  } else if (w >= 922) {
    return { rows: 12, cols: 12 };
  } else if (w >= 748) {
    return { rows: 10, cols: 10 };
  } else if (w >= 614) {
    return { rows: 8, cols: 8 };
  } else {
    return { rows: 5, cols: 5 };
  }
}

function Main() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const createGrid = (rows, cols) => {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        isWall: false,
        isSource: false,
        isDestination: false,
        isPath: false,
        isEmpty: true,
      }))
    );
  };
  const initialSize = getGridSize();
  const [gridSize, setGridSize] = useState(initialSize);

  const [grid, setGrid] = useState(() =>
    createGrid(initialSize.rows, initialSize.cols)
  );

  const [activeGridState, setActiveGridState] = useState("empty");
  const [dijkstraInitial, setDijkstraInitial] = useState(null);
  const [dijkstraFinal, setDijkstraFinal] = useState(null);
  const [walls, setWalls] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      const newSize = getGridSize();
      setGridSize(newSize);
      setGrid(createGrid(newSize.rows, newSize.cols));

      setDijkstraInitial(null);
      setDijkstraFinal(null);
      setWalls([]);
      setActiveGridState("empty");
      setIsRunning(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  const toggleTool = (tool) => {
    setActiveGridState((prev) => (prev === tool ? "empty" : tool));
  };

  const handleCellClick = (rowIndex, colIndex) => {
    if (activeGridState === "empty") return;

    if (grid[rowIndex][colIndex].isSource && activeGridState !== "source") {
      toast.error("This cell is already marked as Source.");
      return;
    }

    if (
      grid[rowIndex][colIndex].isDestination &&
      activeGridState !== "destination"
    ) {
      toast.error("This cell is already marked as Destination.");
      return;
    }

    if (grid[rowIndex][colIndex].isWall && activeGridState === "destination") {
      toast.error("Cannot mark a wall cell as Destination.");
      return;
    }

    if (grid[rowIndex][colIndex].isWall && activeGridState === "source") {
      toast.error("Cannot mark a wall cell as Source.");
      return;
    }

    if (activeGridState === "source") {
      if (dijkstraInitial) {
        if (
          dijkstraInitial.row === rowIndex &&
          dijkstraInitial.col === colIndex
        ) {
          setGrid((prevGrid) => {
            const newGrid = prevGrid.map((row, rIdx) =>
              row.map((cell, cIdx) =>
                rIdx === rowIndex && cIdx === colIndex
                  ? { ...cell, isSource: false, isEmpty: true }
                  : cell
              )
            );
            return newGrid;
          });
          setDijkstraInitial(null);
        } else {
          toast.error("Source is already decided.");
        }
      } else {
        setGrid((prevGrid) => {
          const newGrid = prevGrid.map((row, rIdx) =>
            row.map((cell, cIdx) =>
              rIdx === rowIndex && cIdx === colIndex
                ? { ...cell, isSource: true, isEmpty: false }
                : cell
            )
          );
          return newGrid;
        });
        setDijkstraInitial({ row: rowIndex, col: colIndex });
      }
    } else if (activeGridState === "destination") {
      if (dijkstraFinal) {
        if (dijkstraFinal.row === rowIndex && dijkstraFinal.col === colIndex) {
          setGrid((prevGrid) => {
            const newGrid = prevGrid.map((row, rIdx) =>
              row.map((cell, cIdx) =>
                rIdx === rowIndex && cIdx === colIndex
                  ? { ...cell, isDestination: false, isEmpty: true }
                  : cell
              )
            );
            return newGrid;
          });
          setDijkstraFinal(null);
        } else {
          toast.error("Destination is already decided.");
        }
      } else {
        setGrid((prevGrid) => {
          const newGrid = prevGrid.map((row, rIdx) =>
            row.map((cell, cIdx) =>
              rIdx === rowIndex && cIdx === colIndex
                ? { ...cell, isDestination: true, isEmpty: false }
                : cell
            )
          );
          return newGrid;
        });
        setDijkstraFinal({ row: rowIndex, col: colIndex });
      }
    } else if (activeGridState === "wall") {
      const isWallAlready = walls.some(
        (wall) => wall.row === rowIndex && wall.col === colIndex
      );
      if (isWallAlready) {
        setWalls(
          walls.filter(
            (wall) => !(wall.row === rowIndex && wall.col === colIndex)
          )
        );
        setGrid((prevGrid) => {
          const newGrid = prevGrid.map((row, rIdx) =>
            row.map((cell, cIdx) =>
              rIdx === rowIndex && cIdx === colIndex
                ? { ...cell, isWall: false, isEmpty: true }
                : cell
            )
          );
          return newGrid;
        });
      } else {
        setWalls([...walls, { row: rowIndex, col: colIndex }]);
        setGrid((prevGrid) => {
          const newGrid = prevGrid.map((row, rIdx) =>
            row.map((cell, cIdx) =>
              rIdx === rowIndex && cIdx === colIndex
                ? { ...cell, isWall: true, isEmpty: false }
                : cell
            )
          );
          return newGrid;
        });
      }
    }
  };

  const startDijkstra = () => {
    if (!dijkstraInitial || !dijkstraFinal) {
      toast.error(
        "Please set both Source and Destination before starting Dijkstra."
      );
      return;
    }
    setActiveGridState("empty");
    setIsRunning(true);

    const dijkstraAlgorithm = () => {
      const directions = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ];

      const rows = grid.length,
        cols = grid[0].length;
      let queue = [{ ...dijkstraInitial, path: [] }];
      let visited = new Set();

      while (queue.length > 0) {
        let { row, col, path } = queue.shift();
        if (row === dijkstraFinal.row && col === dijkstraFinal.col) {
          animatePath(path);
          return path;
        }

        for (let [dx, dy] of directions) {
          let newRow = row + dx,
            newCol = col + dy;
          if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            let cellKey = `${newRow}-${newCol}`;
            if (!visited.has(cellKey) && !grid[newRow][newCol].isWall) {
              visited.add(cellKey);
              queue.push({
                row: newRow,
                col: newCol,
                path: [...path, { row: newRow, col: newCol }],
              });
            }
          }
        }
      }

      toast.error("Dijkstra failed: No valid path found.");
      setIsRunning(false);
      return null;
    };

    const animatePath = async (path) => {
      toast.success("Dijkstra's Algorithm Started 🚀", {
        duration: 5000,
        style: { background: "#4CAF50", color: "white" },
      });
      for (let i = 0; i < path.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        setGrid((prevGrid) => {
          const newGrid = prevGrid.map((row, rIdx) =>
            row.map((gridCell, cIdx) => {
              if (rIdx === path[i].row && cIdx === path[i].col) {
                return { ...gridCell, isPath: true, color: "blue" };
              }
              if (
                i > 0 &&
                rIdx === path[i - 1].row &&
                cIdx === path[i - 1].col
              ) {
                return { ...gridCell, isPath: true, color: "white" };
              }
              return gridCell;
            })
          );
          return newGrid;
        });
      }

      for (let i = 0; i < path.length - 1; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        setGrid((prevGrid) => {
          const newGrid = prevGrid.map((row, rIdx) =>
            row.map((gridCell, cIdx) => {
              if (rIdx === path[i].row && cIdx === path[i].col) {
                return { ...gridCell, isPath: false, color: "white" };
              }
              return gridCell;
            })
          );
          return newGrid;
        });
      }

      setIsRunning(false);
    };

    const path = dijkstraAlgorithm();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white text-center bg-gray-900 p-4">
      <div className="toolbar toolbar1">
        <button
          onClick={() => toggleTool("source")}
          disabled={isRunning}
          className={`button ${activeGridState === "source" ? "selected" : ""}`}
        >
          Source
        </button>
        <button
          onClick={() => toggleTool("destination")}
          disabled={isRunning}
          className={`button ${
            activeGridState === "destination" ? "selected" : ""
          }`}
        >
          Destination
        </button>
        <button
          onClick={() => toggleTool("wall")}
          disabled={isRunning}
          className={`button ${activeGridState === "wall" ? "selected" : ""}`}
        >
          Walls
        </button>
        <button onClick={() => setShowHelp(true)} className="button">
          Use?
        </button>
      </div>
      <div className="spacer" />
      <div className="bg-white-500">
        <div className="grid-container" style={{ "--cols": grid[0]?.length }}>
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={
                  cell.isSource
                    ? "cell cell-source"
                    : cell.isDestination
                    ? "cell cell-destination"
                    : cell.isWall
                    ? "cell cell-wall"
                    : cell.isPath
                    ? "cell cell-path"
                    : "cell"
                }
                onMouseDown={() => {
                  setIsMouseDown(true);
                  handleCellClick(rowIndex, colIndex);
                }}
                onMouseEnter={() => {
                  if (isMouseDown && activeGridState === "wall") {
                    handleCellClick(rowIndex, colIndex);
                  }
                }}
                onMouseUp={() => setIsMouseDown(false)}
                onTouchStart={() => {
                  setIsMouseDown(true);
                  handleCellClick(rowIndex, colIndex);
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  const target = document.elementFromPoint(
                    touch.clientX,
                    touch.clientY
                  );

                  if (target?.dataset?.row && target?.dataset?.col) {
                    const row = parseInt(target.dataset.row, 10);
                    const col = parseInt(target.dataset.col, 10);

                    if (activeGridState === "wall" && isMouseDown) {
                      handleCellClick(row, col);
                    }
                  }
                }}
                data-row={rowIndex}
                data-col={colIndex}
              />
            ))
          )}
        </div>
      </div>
      <div className="spacer" />
      <div className="down__container">
        <button
          onClick={startDijkstra}
          disabled={isRunning}
          className="button mx-2"
        >
          Start
        </button>
        <button onClick={() => navigate("/")} className="button mx-2">
          Home
        </button>
      </div>
      <Toaster position="top-right" />
      <UseHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

export default Main;
