import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { programmingLanguages } from "@/utils/languages";
import { DashboardCardProps } from "@/types/types";
import { useRouter } from "next/navigation";
import Notification from "@/components/commons/Notification";
import ConfirmationModal from "../commons/ConfirmationModal";
import { FaRegStar } from "react-icons/fa";
import { FaCodeFork } from "react-icons/fa6";
import { useNotification } from "@/context/NotificationContext";

const isColorLight = (hexColor: string) => {
  const rgb = parseInt(hexColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return brightness > 160;
};

const DashboardCard: React.FC<DashboardCardProps> = ({ id, project_id, language, repo_fullname, short_desc, repo_desc, stars_count, forks_count, name }) => {
  const supabase = createClient();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { notification, setNotification } = useNotification();

  const languageColor = programmingLanguages.find((lang) => lang.name.toLowerCase() === language.toLowerCase())?.color || "#cccccc";
  const textColor = isColorLight(languageColor) ? "#000" : "#fff";

  const handleDelete = async () => {
    const { error } = await supabase.from("projects").delete().eq("id", project_id);
    setIsModalOpen(false);
    if (error) {
      setNotification({ type: "error", message: "Failed to delete the project." });
    } else {
      setNotification({ type: "success", message: "Project deleted successfully." });
    }
    router.refresh();
  };

  return (
    <>
      <div key={id} className="flex flex-col justify-between gap-2 rounded-md border-2 border-zinc-400 p-4 dark:border-zinc-600">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between gap-4">
            <p className="line-clamp-1 font-semibold">{name || repo_fullname}</p>
            <span className="rounded px-2 py-0.5 text-sm" style={{ backgroundColor: languageColor, color: textColor }}>
              {language}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <p className="line-clamp-2">{repo_desc || short_desc || "No short description provided"}</p>
            <div className="flex min-w-fit flex-col">
              {stars_count !== undefined && (
                <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                  <FaRegStar /> {stars_count}
                </span>
              )}
              {forks_count !== undefined && (
                <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                  <FaCodeFork /> {forks_count}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 md:justify-start">
          <Link className="rounded-md border border-zinc-950 px-4 py-1 duration-150 hover:bg-zinc-950 hover:text-zinc-100 dark:border-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-950" href={`/dashboard/edit-project?id=${project_id}`}>
            Edit
          </Link>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center rounded-md border border-red-700 p-1 px-4 text-red-700 duration-150 dark:hover:bg-zinc-100">
            Delete
          </button>
        </div>
      </div>

      <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleDelete} title="Delete project" message="Are you sure you want to delete this project? This action cannot be undone." confirmButtonLabel="Delete" cancelButtonLabel="Cancel" />

      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </>
  );
};

export default DashboardCard;
