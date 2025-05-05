import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

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
    <div className="home-container">
      <h1 className="home-title">
        Welcome
        <span className="bounce">✨</span>
      </h1>
      <br />
      <div className="info-card">
        <p>
          <span className="sparkle">Dijkstra's algorithm</span> is a classic
          method used to determine the shortest path between nodes in a graph.
          It operates using a <span className="sparkle">greedy</span> approach,
          where at each step, it selects the node with the smallest tentative
          distance—this is efficiently managed with a{" "}
          <span className="sparkle">priority queue</span>. When applied to an
          n*m grid, the algorithm may need to evaluate every cell, leading to a
          worst-case time complexity of{" "}
          <span className="sparkle">O((n*m) log(n*m))</span>.
        </p>
        <p style={{ marginTop: "1rem" }}>
          <span className="sparkle">Time Complexity:</span>{" "}
          <span className="sparkle">O((n*m) log(n*m))</span>
        </p>
      </div>
      <button onClick={handleStart} className="start-button">
        Start
      </button>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}

export default Home;
