import React from "react";
import Home from "./components/Home";
import Main from "./components/Main";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/start" element={<Main />} />
      </Routes>
    </Router>
  );
}

export default App;
