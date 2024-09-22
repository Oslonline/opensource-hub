import React from "react";
import { FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4">
      <div>
        <a className="group" target="_blank" href="https://github.com/Oslonline/opensource-hub">
          <FaGithub className="duration-150 group-hover:text-zinc-400" fontSize={24} />
        </a>
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
