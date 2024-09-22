"use client";

import { useEffect, useState } from "react";
import { AiOutlineMoon } from "react-icons/ai";
import { FaGithub } from "react-icons/fa";
import { FiSun } from "react-icons/fi";

export default function Footer() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    return savedDarkMode ? JSON.parse(savedDarkMode) : true;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4">
      <div className="flex gap-2">
        <a className="group" target="_blank" href="https://github.com/Oslonline/opensource-hub">
          <FaGithub className="duration-150 group-hover:text-zinc-400" fontSize={24} />
        </a>
        <button onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? <AiOutlineMoon fontSize={25} /> : <FiSun fontSize={25} />}</button>
      </div>
      <div className="text-sm">
        Opensource Hub - {new Date().getFullYear()} -{" "}
        <a href="https://oslo418.com" className="underline">
          by Oslo418
        </a>
      </div>
    </div>
  );
}
