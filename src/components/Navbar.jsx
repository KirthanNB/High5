"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation"; // For detecting active route
import { AiFillHome, AiOutlineFileText, AiOutlineBook, AiOutlineQuestionCircle, AiOutlineTeam, AiOutlineInfoCircle } from "react-icons/ai";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", text: "Home", icon: <AiFillHome size={20} /> },
    { href: "/publication", text: "Publication", icon: <AiOutlineFileText size={20} /> },
    { href: "/resources", text: "Resources", icon: <AiOutlineBook size={20} /> },
    { href: "/quiz", text: "Quiz", icon: <AiOutlineQuestionCircle size={20} /> },
    { href: "/community", text: "Community", icon: <AiOutlineTeam size={20} /> },
    { href: "/missionplanner", text: "Mission Planner", icon: <AiOutlineTeam size={20} /> },
    { href: "/missions", text: "Missions", icon: <AiOutlineTeam size={20} /> },
    { href: "/about", text: "About", icon: <AiOutlineInfoCircle size={20} /> },
  ];

  return (
    <nav className="bg-[#0b0f19]/90 backdrop-blur-md shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-blue-900/40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo and Title */}
        <Link
          href="/"
          className="flex items-center space-x-3 text-2xl font-semibold text-blue-400 hover:text-blue-300 transition"
        >
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={42}
            height={42}
            className="rounded-full border border-blue-400"
          />
          <span>Space Bio Search Engine</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              text={item.text}
              icon={item.icon}
              isActive={pathname === item.href}
            />
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden text-blue-300 hover:text-white transition text-2xl relative`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span
            className={`block transition-transform duration-300 transform ${isOpen ? "rotate-90" : ""}`}
          >
            ☰
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0b0f19]/95 border-t border-blue-900/40 shadow-lg">
          <div className="px-6 py-3 space-y-3 flex flex-col items-center">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                text={item.text}
                icon={item.icon}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, text, icon, isActive }) {
  return (
    <Link
      href={href}
      className={`
        group flex items-center space-x-2 text-lg font-medium relative transition-transform transform hover:-translate-y-1
        ${isActive ? "text-blue-400" : "text-gray-300"} 
      `}
    >
      {icon && (
        <span className="transition-transform duration-300 group-hover:scale-125 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
          {icon}
        </span>
      )}
      <span className="relative">
        {text}
        <span className={`absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full`}></span>
      </span>
    </Link>
  );
}
