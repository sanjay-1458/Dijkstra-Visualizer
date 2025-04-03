import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function Main() {
  const navigate = useNavigate();
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

  const [grid, setGrid] = useState(createGrid(20, 20));
  const [activeGridState, setActiveGridState] = useState("empty");
  const [dijkstraInitial, setDijkstraInitial] = useState(null);
  const [dijkstraFinal, setDijkstraFinal] = useState(null);
  const [walls, setWalls] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  useEffect(() => {
    const updateGridSize = () => {
      const newGridSize = window.innerWidth < 600 ? 5 : 20;
      setGrid(createGrid(newGridSize, newGridSize));
      setDijkstraInitial(null);
      setDijkstraFinal(null);
      setWalls([]);
      setActiveGridState("empty");
      setIsRunning(false);
    };

    updateGridSize();

    window.addEventListener("resize", updateGridSize);
    return () => window.removeEventListener("resize", updateGridSize);
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

      const rows = 20,
        cols = 20;
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
    <div className="flex flex-col items-center justify-center min-h-screen text-white text-center bg-gray-900">
      <div className="flex flex-wrap justify-center gap-4 w-full p-4">
        <button
          onClick={() => toggleTool("source")}
          disabled={isRunning}
          className={`button-class text-2xl px-4 py-2 rounded-lg transition ${
            activeGridState === "source"
              ? "bg-blue-400 scale-115 transition-transform duration-300 ease-in-out"
              : "bg-blue-500"
          }`}
        >
          Source
        </button>
        <button
          onClick={() => toggleTool("destination")}
          disabled={isRunning}
          className={`button-class text-2xl px-4 py-2 rounded-lg transition ${
            activeGridState === "destination"
              ? "bg-green-400 scale-115 transition-transform duration-300 ease-in-out"
              : "bg-green-500"
          }`}
        >
          Destination
        </button>
        <button
          onClick={() => toggleTool("wall")}
          disabled={isRunning}
          className={` button-class text-2xl px-4 py-2 rounded-lg transition ${
            activeGridState === "wall"
              ? "bg-red-400 scale-115 transition-transform duration-300 ease-in-out"
              : "bg-red-500"
          }`}
        >
          Walls
        </button>
      </div>
      <div
        className="grid grid-cols-20 gap-1 border border-white"
        style={{ "--cols": grid[0]?.length }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`cell w-6 h-6 border border-gray-600 transition-all ${
                cell.isSource
                  ? "bg-blue-400"
                  : cell.isDestination
                  ? "bg-green-400"
                  : cell.isWall
                  ? "bg-red-600"
                  : cell.isPath
                  ? "bg-blue-500"
                  : "bg-gray-800"
              }`}
            ></div>
          ))
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-8 w-full p-1">
        <button
          onClick={startDijkstra}
          disabled={isRunning}
          className="text-2xl px-6 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 transition-all duration-300 
        shadow-purple-300 mt-4 scale-105 active:scale-110"
        >
          Start
        </button>
        <button
          onClick={() => navigate("/")}
          className="text-2xl px-6 py-3 rounded-lg bg-pink-500 hover:bg-pink-600 transition-all duration-300 
        shadow-purple-300 mt-4 scale-105 active:scale-110"
        >
          Home
        </button>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default Main;
