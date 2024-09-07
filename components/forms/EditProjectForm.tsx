"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { programmingLanguages } from "@/utils/languages";
import { useNotification } from "@/context/NotificationContext";
import { FaGithub, FaLink } from "react-icons/fa";
import { BsInfoSquare } from "react-icons/bs";
import { EditProjectFormProps } from "@/types/types";

const EditProjectForm: React.FC<EditProjectFormProps> = ({ projectData }) => {
  const [projectName, setProjectName] = useState(projectData.name || projectData.repo_fullname || "");
  const [projectShortDesc, setProjectShortDesc] = useState(projectData.short_desc || projectData.repo_desc || "");
  const [projectFullDesc, setProjectFullDesc] = useState(projectData.full_desc || "");
  const [selectedLanguage, setSelectedLanguage] = useState(projectData.language || "");
  const [codeLink, setCodeLink] = useState(projectData.code_url || projectData.repo_url || "");
  const [websiteLink, setWebsiteLink] = useState(projectData.website_link || "");
  const [instagramLink, setInstagramLink] = useState(projectData.instagram_link || "");
  const [documentationLink, setDocumentationLink] = useState(projectData.documentation_link || "");
  const { setNotification } = useNotification();
  const supabase = createClient();
  const router = useRouter();
  const languages = programmingLanguages;

  useEffect(() => {
    setProjectName(projectData.name || projectData.repo_fullname || "");
    setProjectShortDesc(projectData.short_desc || projectData.repo_desc || "");
    setProjectFullDesc(projectData.full_desc || "");
    setCodeLink(projectData.code_url || projectData.repo_url || "");
    setSelectedLanguage(projectData.language || "");
    setWebsiteLink(projectData.website_link || "");
    setInstagramLink(projectData.instagram_link || "");
    setDocumentationLink(projectData.documentation_link || "");
  }, [projectData]);

  const handleLanguageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { user } = (await supabase.auth.getUser()).data;
    if (!user) return;

    if (projectData.type === "github") {
      const { error: githubError } = await supabase
        .from("github_projects_data")
        .update({
          full_desc: projectFullDesc,
          website_link: websiteLink,
          instagram_link: instagramLink,
          documentation_link: documentationLink,
        })
        .eq("project_id", projectData.project_id);

      if (githubError) {
        console.error("Error updating GitHub project data:", githubError);
        return;
      }
    } else {
      const { error: customError } = await supabase
        .from("custom_projects_data")
        .update({
          name: projectName,
          full_desc: projectFullDesc,
          short_desc: projectShortDesc,
          code_url: codeLink,
          language: selectedLanguage,
          website_link: websiteLink,
          instagram_link: instagramLink,
          documentation_link: documentationLink,
        })
        .eq("project_id", projectData.project_id);

      if (customError) {
        console.error("Error updating custom project data:", customError);
      }
    }

    router.push("/dashboard");
    setNotification({
      type: "success",
      message: "Project informations successfully edited!",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-md border-2 p-4">
      <div className="flex flex-col">
        <h2 className="flex items-center gap-2 pb-1 text-xl font-semibold">
          <BsInfoSquare />
          Project informations:
        </h2>
        <div className="flex w-full flex-col justify-between gap-2 pb-2 md:flex-row">
          <div className="flex w-full flex-col">
            <label>Project Name:</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              readOnly={projectData.type === "github"}
              className={`appearance-none rounded-md px-2 py-1 caret-teal-500 focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-teal-500 dark:bg-zinc-100 dark:text-zinc-900 ${projectData.type === "github" ? "cursor-not-allowed select-none opacity-60 ring-0 focus:outline-transparent" : ""}`}
            />
          </div>
          <div className="flex w-full flex-col">
            <label>{projectData.type === "github" ? "Repository link" : "Link to your project code:"}</label>
            <input
              type="url"
              value={codeLink}
              onChange={(e) => setCodeLink(e.target.value)}
              readOnly={projectData.type === "github"}
              className={`appearance-none rounded-md px-2 py-1 caret-teal-500 focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-teal-500 dark:bg-zinc-100 dark:text-zinc-900 ${projectData.type === "github" ? "cursor-not-allowed select-none opacity-60 ring-0 focus:outline-transparent" : ""}`}
            />
          </div>
        </div>
        <div className="flex w-full flex-col items-end justify-between gap-2 pb-2 md:flex-row">
          <div className="flex w-full flex-col">
            <label>{projectData.type === "github" ? "Repository description:" : "Short description (max 100 characters):"}</label>
            <input
              type="text"
              value={projectShortDesc}
              onChange={(e) => setProjectShortDesc(e.target.value)}
              maxLength={100}
              readOnly={projectData.type === "github"}
              className={`appearance-none rounded-md px-2 py-1 caret-teal-500 focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-teal-500 dark:bg-zinc-100 dark:text-zinc-900 ${projectData.type === "github" ? "cursor-not-allowed select-none opacity-60 ring-0 focus:outline-transparent" : ""}`}
            />
          </div>
          <div className="w-full">
            <label>{projectData.type === "github" ? "Repository language:" : "Project language"}</label>
            <select
              onChange={handleLanguageSelect}
              value={selectedLanguage}
              disabled={projectData.type === "github"}
              className={`w-full rounded-md border px-2 py-[4.9px] duration-150 dark:focus:bg-zinc-100 dark:focus:text-zinc-900 ${projectData.type === "github" ? "cursor-not-allowed select-none opacity-60 ring-0 focus:outline-transparent dark:bg-zinc-100 dark:text-zinc-900" : "dark:bg-zinc-950 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"}`}
            >
              <option value="">Select your project language</option>
              {languages.map((language) => (
                <option key={language.name} value={language.name}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col">
          <label>Full Description (max 500 characters):</label>
          <textarea
            value={projectFullDesc}
            onChange={(e) => setProjectFullDesc(e.target.value)}
            maxLength={500}
            className="min-h-20 appearance-none rounded-md px-2 py-1 caret-teal-500 focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-teal-500 dark:bg-zinc-100 dark:text-zinc-900"
          />
        </div>
      </div>

      {projectData.type === "github" && (
        <div className="flex flex-col">
          <h3 className="flex items-center gap-2 pb-1 text-xl font-semibold">
            <FaGithub />
            Github infos:
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col justify-between">
              <p>Stars: {projectData.stars_count}</p>
              <p>Forks: {projectData.forks_count}</p>
              <p>Issues: {projectData.open_issue_count}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <h4 className="flex items-center gap-2 pb-1 text-xl font-semibold">
          <FaLink />
          External links:
        </h4>
        <div className="flex flex-col justify-between gap-2 md:flex-row md:gap-4">
          <div className="flex w-full flex-col">
            <label>{projectData.type === "github" ? "Repository website link:" : "Website Link"}</label>
            <div className="group relative w-full">
              <input
                type="url"
                value={websiteLink}
                onChange={(e) => setWebsiteLink(e.target.value)}
                readOnly={projectData.type === "github"}
                className={`w-full appearance-none rounded-md px-2 py-1 caret-teal-500 focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-teal-500 dark:bg-zinc-100 dark:text-zinc-900 ${projectData.type === "github" ? "group cursor-not-allowed select-none opacity-60 ring-0 focus:outline-transparent" : ""}`}
              />
              {projectData.type === "github" && !projectData.website_link && <span className="absolute -top-5 right-0 select-none rounded-md px-2 text-xs text-transparent duration-300 dark:group-hover:bg-zinc-800 dark:group-hover:text-zinc-400">You need to add the link directly on GitHub.</span>}
            </div>
          </div>
          <div className="flex w-full flex-col">
            <label>Documentation website link</label>
            <input type="url" value={documentationLink} onChange={(e) => setDocumentationLink(e.target.value)} className={`appearance-none rounded-md px-2 py-1 caret-teal-500 focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-teal-500 dark:bg-zinc-100 dark:text-zinc-900`} />
          </div>
          <div className="flex w-full flex-col">
            <label>Instagram profile link</label>
            <input type="url" value={instagramLink} onChange={(e) => setInstagramLink(e.target.value)} className={`appearance-none rounded-md px-2 py-1 caret-teal-500 focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-teal-500 dark:bg-zinc-100 dark:text-zinc-900`} />
          </div>
        </div>
      </div>

      <button type="submit" className="rounded-md bg-teal-500 px-4 py-2 text-white duration-150 hover:bg-teal-600">
        Save Changes
      </button>
    </form>
  );
};

export default EditProjectForm;
