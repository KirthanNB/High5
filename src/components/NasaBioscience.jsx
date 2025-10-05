"use client";

import { useEffect, useState, useMemo } from "react";
import Papa from "papaparse";

/* ---------- config ---------- */
const MOON_KEYS = /moon|luna|apollo|chang['']?e|surveyor|chandrayaan|grail|lcross|ladee|smart|selene|kaguya|hiten|beresheet/i;
const MARS_KEYS = /mars|mangalyaan|maven|insight|perseverance|curiosity|opportunity|spirit|phoenix|viking|mariner|pathfinder/i;

/* ---------- helpers ---------- */
const parseCsv = (file) =>
  new Promise((res) =>
    Papa.parse(file, { download: true, header: true, complete: (r) => res(r.data) })
  );

/* ---------- sub-components ---------- */
const StatCard = ({ label, value, icon }) => (
  <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-all">
    <div className="text-4xl mb-2">{icon}</div>
    <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
      {value}
    </div>
    <div className="text-sm text-gray-400 font-semibold">{label}</div>
  </div>
);

const Pie = ({ data }) => {
  const total = data.reduce((a, b) => a + b.value, 0);
  let acc = 0;
  const cols = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"]; // cyan, blue, purple, pink
  
  return (
    <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
      <h3 className="text-white font-bold mb-4 text-center">Mission Outcomes</h3>
      <svg viewBox="0 0 100 100" className="w-full h-48 mx-auto">
        {data.map((d, i) => {
          const prev = acc;
          acc += d.value;
          const a0 = 2 * Math.PI * (prev / total) - Math.PI / 2;
          const a1 = 2 * Math.PI * (acc / total) - Math.PI / 2;
          const x0 = 50 + 35 * Math.cos(a0);
          const y0 = 50 + 35 * Math.sin(a0);
          const x1 = 50 + 35 * Math.cos(a1);
          const y1 = 50 + 35 * Math.sin(a1);
          const large = a1 - a0 > Math.PI ? 1 : 0;
          return (
            <path
              key={i}
              d={`M 50 50 L ${x0} ${y0} A 35 35 0 ${large} 1 ${x1} ${y1} Z`}
              fill={cols[i % cols.length]}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}
      </svg>
      <div className="mt-4 space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cols[i % cols.length] }}></div>
              <span className="text-gray-300">{d.label}</span>
            </div>
            <span className="text-cyan-400 font-bold">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RefModal = ({ id, map, close }) => {
  if (!id) return null;
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={close}
    >
      <div 
        className="bg-gray-900 border-2 border-cyan-500/50 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto shadow-2xl shadow-cyan-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📚</span>
          Reference Details
        </h3>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
          <div className="text-sm text-gray-400 mb-2">Reference ID: <span className="text-cyan-400 font-bold">[{id}]</span></div>
          <p className="text-gray-200 leading-relaxed">{map[id] || "Reference not found"}</p>
        </div>
        <button
          onClick={close}
          className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};

/* ---------- main component ---------- */
export default function NasaBioscience() {
  const [raw, setRaw] = useState([]);
  const [refs, setRefs] = useState({});
  const [tab, setTab] = useState("moon");
  const [search, setSearch] = useState("");
  const [refId, setRefId] = useState(null);

  useEffect(() => {
    Promise.all([parseCsv("/Missions.csv"), parseCsv("/References.csv")]).then(
      ([m, r]) => {
        setRaw(m.filter((x) => x.Spacecraft)); // drop empty
        setRefs(Object.fromEntries(r.map((x) => [x.Id, x.Reference])));
      }
    );
  }, []);

  const { moon, mars } = useMemo(() => {
    const moon = [];
    const mars = [];
    raw.forEach((row) => {
      const str = `${row.Spacecraft} ${row.Payload} ${row["Mission Type"]}`;
      if (MOON_KEYS.test(str)) moon.push(row);
      if (MARS_KEYS.test(str)) mars.push(row);
    });
    return { moon, mars };
  }, [raw]);

  const active = tab === "moon" ? moon : mars;
  const filtered = useMemo(() => {
    if (!search) return active;
    const q = search.toLowerCase();
    return active.filter((r) =>
      `${r.Spacecraft} ${r.Payload} ${r.Country} ${r.Description}`.toLowerCase().includes(q)
    );
  }, [active, search]);

  const stats = useMemo(() => {
    const total = active.length;
    const success = active.filter((r) => /success/i.test(r.Outcome)).length;
    const failure = active.filter((r) => /failure/i.test(r.Outcome)).length;
    const partial = total - success - failure;
    return { total, success, failure, partial };
  }, [active]);

  const pieData = [
    { label: "Success", value: stats.success },
    { label: "Failure", value: stats.failure },
    { label: "Partial", value: stats.partial },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
            <span className="text-4xl">🚀</span>
            NASA BioScience Missions
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Explore Moon and Mars exploration missions with detailed data and references</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all ${
                tab === "moon"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-2 border-gray-700 hover:border-cyan-500/50"
              }`}
              onClick={() => setTab("moon")}
            >
              <span className="text-2xl">🌙</span>
              <span>Moon Missions</span>
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all ${
                tab === "mars"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-2 border-gray-700 hover:border-cyan-500/50"
              }`}
              onClick={() => setTab("mars")}
            >
              <span className="text-2xl">🔴</span>
              <span>Mars Missions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard label="Total Missions" value={stats.total} icon="🎯" />
          <StatCard label="Successful" value={stats.success} icon="✅" />
          <StatCard label="Failed" value={stats.failure} icon="❌" />
          <StatCard label="Partial" value={stats.partial} icon="⚠️" />
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Pie data={pieData} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Filter missions by spacecraft, payload, country, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border-2 border-gray-800 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Missions Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-800 to-gray-900 border-b-2 border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Spacecraft</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Payload</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Launch</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Mission</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Outcome</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-cyan-400 uppercase tracking-wider">Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="text-4xl mb-3">🔭</div>
                      <p className="text-white font-semibold mb-1">No missions found</p>
                      <p className="text-gray-400 text-sm">Try different search keywords</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-white font-semibold">{r.Spacecraft}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{r.Payload}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{r["Launch Date"]}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{r.Country}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{r["Mission Type"]}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          /success/i.test(r.Outcome)
                            ? "bg-green-500/20 text-green-400"
                            : /failure/i.test(r.Outcome)
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {r.Outcome}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 max-w-md">
                        <div className="line-clamp-2">{r.Description}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-1 flex-wrap">
                          {(r.References?.match(/\d+/g) || []).map((id) => (
                            <button
                              key={id}
                              onClick={() => setRefId(id)}
                              className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs font-bold hover:bg-cyan-500/30 transition-colors"
                            >
                              [{id}]
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RefModal id={refId} map={refs} close={() => setRefId(null)} />
    </div>
  );
}
