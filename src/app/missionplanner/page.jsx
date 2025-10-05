"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Sphere, Html } from "@react-three/drei";
import { motion } from "framer-motion";

export default function MissionPlanner3D() {
  const [temperature, setTemperature] = useState(22);
  const [gravity, setGravity] = useState(1);
  const [radiation, setRadiation] = useState(0);
  const [oxygen, setOxygen] = useState(21);
  const [simulationResult, setSimulationResult] = useState("");

  const runSimulation = () => {
    let result = "✅ Conditions optimal for cell growth.";
    if (temperature < 0 || temperature > 40) result = "⚠️ Temperature out of range!";
    if (gravity < 0.1) result = "⚠️ Low gravity may affect cell division!";
    if (radiation > 5) result = "⚠️ High radiation detected!";
    if (oxygen < 15) result = "⚠️ Oxygen levels too low!";
    setSimulationResult(result);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <div className="text-center py-12 px-6">
        <h1 className="text-5xl font-bold text-cyan-400 mb-3">🛰️ Space Biology Mission Planner</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Adjust environmental conditions and simulate biological experiments on Moon, Mars, and Earth habitats.
        </p>
      </div>

      {/* 3D Canvas */}
      <div className="h-[500px] w-full mb-12">
        <Canvas camera={{ position: [0, 5, 15], fov: 50 }}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />

          {/* Earth */}
          <Sphere args={[1.5, 32, 32]} position={[-5, 0, 0]}>
            <meshStandardMaterial color="#2E8B57" />
            <Html distanceFactor={10}>
              <div className="text-white text-center">🌍 Earth</div>
            </Html>
          </Sphere>

          {/* Moon */}
          <Sphere args={[0.8, 32, 32]} position={[0, 2, -3]}>
            <meshStandardMaterial color="#aaa" />
            <Html distanceFactor={10}>
              <div className="text-white text-center">🌕 Moon</div>
            </Html>
          </Sphere>

          {/* Mars */}
          <Sphere args={[1.2, 32, 32]} position={[5, -1, 0]}>
            <meshStandardMaterial color="#b7410e" />
            <Html distanceFactor={10}>
              <div className="text-white text-center">🔴 Mars</div>
            </Html>
          </Sphere>

          <OrbitControls />
        </Canvas>
      </div>

      {/* Controls */}
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Temperature */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-xl text-cyan-400 mb-2">🌡 Temperature (°C)</h2>
          <input
            type="range"
            min="-10"
            max="50"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-gray-300 mt-1">{temperature}°C</p>
        </div>

        {/* Gravity */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-xl text-cyan-400 mb-2">🪐 Gravity (g)</h2>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={gravity}
            onChange={(e) => setGravity(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-gray-300 mt-1">{gravity} g</p>
        </div>

        {/* Radiation */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-xl text-cyan-400 mb-2">☢️ Radiation Level</h2>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={radiation}
            onChange={(e) => setRadiation(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-gray-300 mt-1">{radiation}</p>
        </div>

        {/* Oxygen */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-xl text-cyan-400 mb-2">💨 Oxygen (%)</h2>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={oxygen}
            onChange={(e) => setOxygen(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-gray-300 mt-1">{oxygen}%</p>
        </div>
      </div>

      {/* Run Simulation */}
      <div className="text-center">
        <button
          onClick={runSimulation}
          className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-md font-medium text-black transition"
        >
          Run Simulation
        </button>

        {simulationResult && (
          <motion.div
            key={simulationResult}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-lg text-yellow-300 font-semibold"
          >
            {simulationResult}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 mt-16 px-6 pb-12 text-sm">
        Demo Mission Planner. Results are simulated for presentation purposes only.
      </div>
    </div>
  );
}
