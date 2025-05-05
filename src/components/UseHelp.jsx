
import React from "react";

function UseHelp({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>How to Use the Pathfinder</h2>
        <p><strong>Source:</strong> Click the “Source” button, then click a cell to place the source node.</p>
        <p><strong>Destination:</strong> Click the “Destination” button, then click a cell to place the target node.</p>
        <p><strong>Walls:</strong> Click “Walls” and drag to place wall barriers.</p>
        <p><strong>Start:</strong> Press “Start” to run Dijkstra’s algorithm and see the shortest path.</p>
        <button className="button" onClick={onClose}>Got it!</button>
      </div>
    </div>
  );
}

export default UseHelp;
