"use client";

import React, { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Project } from "@/types/types";
import { FaGithub, FaInstagram, FaLink, FaRegStar } from "react-icons/fa";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FaCodeFork } from "react-icons/fa6";
import { LuBookMarked } from "react-icons/lu";
import { programmingLanguages } from "@/utils/languages";

const isColorLight = (hexColor: string) => {
  const rgb = parseInt(hexColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return brightness > 160;
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
};

const ProjectContent = () => {
  const projectId = useSearchParams().get("id");
  const [userBy, setUserBy] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);

        const { data: projectData, error: projectError } = await supabase.from("projects").select("*").eq("id", projectId).single();
        if (projectError) throw projectError;

        if (projectData) {
          setUserBy(projectData.user_by);
          setCreateDate(formatDate(projectData.created_at));

          const projectType = projectData.type;

          if (projectType === "github") {
            const { data: githubProject, error: githubError } = await supabase.from("github_projects_data").select("*").eq("project_id", projectId).single();
            if (githubError) throw githubError;

            setProject(githubProject);
          } else if (projectType === "custom") {
            const { data: customProject, error: customError } = await supabase.from("custom_projects_data").select("*").eq("project_id", projectId).single();
            if (customError) throw customError;

            setProject(customProject);
          } else {
            setError("Unknown project type.");
          }
        } else {
          setError("Project not found.");
        }
      } catch (error) {
        setError("An error occurred while fetching the project details.");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchProject();
  }, [projectId, supabase]);

  const languageColor = programmingLanguages.find((lang) => lang.name.toLowerCase() === project?.language.toLowerCase())?.color || "#cccccc";
  const textColor = isColorLight(languageColor) ? "#000" : "#fff";

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!project) return <p>Project not found.</p>;

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <div className="flex w-11/12 justify-between md:w-4/5 md:gap-10 xl:w-2/3">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-20">
            <h1 className="flex gap-2 text-4xl font-bold">
              {project.name || project.repo_fullname}
              <span className="h-fit rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: languageColor, color: textColor }}>
                {project.language}
              </span>
            </h1>
            {project.repo_fullname && (
              <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="duration-150 dark:hover:text-zinc-400">
                <FaGithub fontSize={30} />
              </a>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-lg">{project.repo_desc || project.short_desc || "No description available."}</p>
            <p className="w-4/5 md:w-2/3">{project.full_desc}</p>
          </div>
        </div>
      </div>
      <div className="flex w-11/12 md:w-4/5 xl:w-2/3">
        <div>
          {project.stars_count !== undefined && project.stars_count !== null && (
            <p className="flex items-center gap-2">
              <FaRegStar />
              Stars : {project.stars_count}
            </p>
          )}
          {project.forks_count !== undefined && project.forks_count !== null && (
            <p className="flex items-center gap-2">
              <FaCodeFork />
              Forks : {project.forks_count}
            </p>
          )}
          {project.open_issue_count !== undefined && project.open_issue_count !== null && (
            <p className="flex items-center gap-2">
              <AiOutlineExclamationCircle />
              Open issues : {project.open_issue_count}
            </p>
          )}
        </div>
      </div>
      <div className="flex w-11/12 flex-col gap-4 md:w-4/5 xl:w-2/3">
        <div className="flex w-full gap-2">
          {project.website_link && (
            <a href={project.website_link} target="_blank" rel="noopener noreferrer" className="flex w-fit items-center gap-2 rounded-md border-2 px-2 py-1 duration-150 dark:hover:bg-zinc-100 dark:hover:text-zinc-950">
              <FaLink />
              Website
            </a>
          )}
          {project.documentation_link && (
            <a href={project.documentation_link} target="_blank" rel="noopener noreferrer" className="flex w-fit items-center gap-2 rounded-md border-2 px-2 py-1 duration-150 dark:hover:bg-zinc-100 dark:hover:text-zinc-950">
              <LuBookMarked />
              Documentation
            </a>
          )}
          {project.instagram_link && (
            <a href={project.instagram_link} target="_blank" rel="noopener noreferrer" className="flex w-fit items-center gap-2 rounded-md border-2 px-2 py-1 duration-150 dark:hover:bg-zinc-100 dark:hover:text-zinc-950">
              <FaInstagram />
              Instagram
            </a>
          )}
        </div>
        <p className="text-xs text-zinc-500">
          by {userBy} on {createDate}
        </p>
      </div>
    </div>
  );
};

const ProjectPage = () => (
  <Suspense fallback={<p>Loading...</p>}>
    <ProjectContent />
  </Suspense>
);

export default ProjectPage;
