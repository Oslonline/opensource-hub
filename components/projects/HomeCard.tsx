import { HomeCardProps } from "@/types/types";
import { programmingLanguages } from "@/utils/languages";
import Link from "next/link";
import { FaGithub, FaRegStar } from "react-icons/fa";
import { FaCodeFork } from "react-icons/fa6";

const isColorLight = (hexColor: string) => {
  const rgb = parseInt(hexColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return brightness > 160;
};

const HomeCard: React.FC<HomeCardProps> = ({ id, project_id, repo_fullname, short_desc, repo_desc, stars_count, forks_count, name, language }) => {
  const languageColor = programmingLanguages.find((lang) => lang.name.toLowerCase() === language?.toLowerCase())?.color || "#cccccc";
  const textColor = isColorLight(languageColor) ? "#000" : "#fff";

  return (
    <Link href={`/project/?id=${project_id}`} key={id} className="flex flex-col justify-between gap-2 rounded-md border-2 border-zinc-400 bg-zinc-50 p-4 duration-150 hover:scale-[1.02] hover:border-zinc-700 dark:border-zinc-600 dark:bg-zinc-950 dark:hover:border-zinc-300">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1 font-semibold">
            {repo_fullname !== undefined && <FaGithub />} <p className="line-clamp-1">{name || repo_fullname}</p>
          </span>
          <span className="h-fit rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: languageColor, color: textColor }}>
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
    </Link>
  );
};

export default HomeCard;
