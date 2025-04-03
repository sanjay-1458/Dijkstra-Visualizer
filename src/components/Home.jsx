import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/start");
    }, 800);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-white text-center bg-gray-900 p-4">
      {/* Custom CSS for color change animation */}
      <style>
        {`
          @keyframes colorChange {
            0%, 100% {
              color: #ec4899; /* pink */
            }
            40% {
              color: #3b82f6; /* blue */
            }
          }
          .sparkle {
            animation: colorChange 1s infinite;
          }
        `}
      </style>
      <h1 className="text-4xl font-bold flex items-center">
        Welcome
        <span className="ml-2 animate-bounce text-pink-500 text-3xl">✨</span>
      </h1>
      <br />
      <div className="max-w-2xl bg-gray-800 p-6 rounded-lg shadow-lg">
        <p>
          <span className="font-semibold sparkle">Dijkstra's algorithm</span> is
          a classic method used to determine the shortest path between nodes in
          a graph. It operates using a{" "}
          <span className="font-semibold sparkle">greedy</span> approach, where
          at each step, it selects the node with the smallest tentative
          distance—this is efficiently managed with a{" "}
          <span className="font-semibold sparkle">priority queue</span>. When
          applied to an n*m grid, the algorithm may need to evaluate every cell,
          leading to a worst-case time complexity of{" "}
          <span className="font-semibold sparkle">O((n*m) log(n*m))</span>. This
          efficient performance is due to the rapid retrieval of the next
          closest node provided by the priority queue. The algorithm starts from
          the source node, progressively updating the minimal distance for all
          neighboring nodes until it reaches the target or exhausts all
          reachable nodes. This makes it invaluable in real-world applications
          like navigation systems, network routing, and robotics. Its greedy
          nature ensures that at every decision point, the locally optimal
          choice is selected, which cumulatively leads to the best overall path.
        </p>
        <p className="mt-4">
          <span className="font-semibold sparkle">Time Complexity:</span>{" "}
          <span className="font-semibold sparkle">O((n*m) log(n*m))</span>
        </p>
      </div>
      <br />
      <button
        onClick={handleStart}
        className="text-2xl bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Start
      </button>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-pink-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

export default Home;
