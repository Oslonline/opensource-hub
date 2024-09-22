"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { CiLogout } from "react-icons/ci";
import { HiOutlinePlus } from "react-icons/hi2";
import { FaGithub } from "react-icons/fa";
import ConfirmationModal from "./commons/ConfirmationModal";
import Image from "next/image";

export default function Header() {
  const { user, loginWithGitHub, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = async () => {
    setIsModalOpen(false);
    logout();
  };

  return (
    <>
      <header className="sticky left-0 top-0 z-50 w-full border-b border-zinc-300 p-4 backdrop-blur-lg dark:border-zinc-700">
        {user ? (
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-4">
              <Link className="group relative" href={"/"}>
                Home
                <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-zinc-950 transition-all duration-200 group-hover:w-full dark:bg-zinc-100"></span>
              </Link>
            </div>
            <span className="hidden items-center gap-2 md:flex">
              <Image width={500} height={500} className="h-8 w-8 rounded-full border border-zinc-500" src={user.user_metadata.avatar_url} alt="User github profile image"></Image> Welcome, {user.user_metadata.user_name}
            </span>
            <div className="flex gap-2">
              <Link className="rounded-md border border-zinc-950 px-2 py-0.5 duration-150 hover:bg-zinc-950 hover:text-zinc-100 dark:border-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-950" href="/dashboard">
                My Projects
              </Link>
              <Link className="hidden items-center gap-2 rounded-md border border-zinc-950 px-2 py-0.5 duration-150 hover:bg-zinc-950 hover:text-zinc-100 dark:border-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-950 md:flex" href="/dashboard/add-project">
                Add Project
                <HiOutlinePlus fontSize={20} />
              </Link>
              <button className="flex items-center justify-center rounded-md border border-red-700 p-0.5 text-red-700 duration-150 hover:bg-red-700 hover:text-zinc-50" onClick={() => setIsModalOpen(true)}>
                <CiLogout fontSize={25} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between">
            <Link className="group relative" href={"/"}>
              Home
              <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-zinc-950 transition-all duration-200 group-hover:w-full dark:bg-zinc-100"></span>
            </Link>
            <button onClick={loginWithGitHub} className="flex items-center gap-2 rounded-md border border-zinc-950 px-2 py-1 duration-150 hover:bg-zinc-950 hover:text-zinc-100 dark:border-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-950">
              <FaGithub />
              Sign In With Github
            </button>
          </div>
        )}
      </header>

      <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleLogout} title="Logout" message="Are you sure you want to logout? You need to sign in again to manage your projects." confirmButtonLabel="Logout" cancelButtonLabel="Cancel" />
    </>
  );
}
