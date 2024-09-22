import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { GithubRepo } from "@/types/types";
import { programmingLanguages } from "@/utils/languages";
import { useNotification } from "@/context/NotificationContext";
import { BsInfoSquare } from "react-icons/bs";
import { FaGithub, FaLink } from "react-icons/fa";

interface AddProjectFormProps {
  repo: GithubRepo | null;
  isManual: boolean;
}

const AddProjectForm: React.FC<AddProjectFormProps> = ({ repo, isManual }) => {
  const [projectName, setProjectName] = useState<string>("");
  const [projectShortDesc, setProjectShortDesc] = useState<string>("");
  const [projectFullDesc, setProjectFullDesc] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [codeLink, setCodeLink] = useState<string>("");
  const [websiteLink, setWebsiteLink] = useState<string>("");
  const [instagramLink, setInstagramLink] = useState<string>("");
  const [documentationLink, setDocumentationLink] = useState<string>("");
  const supabase = createClient();
  const router = useRouter();
  const { setNotification } = useNotification();
  const languages = programmingLanguages;

  useEffect(() => {
    if (repo) {
      setProjectName(repo.full_name);
      setProjectShortDesc(repo.description || "");
      setCodeLink(repo.html_url);
      setSelectedLanguage(repo.language || "");
      setWebsiteLink(repo.homepage || "");
      setInstagramLink("");
      setDocumentationLink("");
    } else {
      setProjectName("");
      setProjectShortDesc("");
      setCodeLink("");
      setProjectFullDesc("");
      setSelectedLanguage("");
      setWebsiteLink("");
      setInstagramLink("");
      setDocumentationLink("");
    }
  }, [repo]);

  const handleLanguageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { user } = (await supabase.auth.getUser()).data;
    if (!user) return;

    try {
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert([{ user_id: user.id, type: repo ? "github" : "custom", user_by: user.user_metadata.user_name }])
        .select("id")
        .single();

      if (projectError) {
        throw projectError;
      }

      const projectId = projectData?.id;

      if (repo && projectId) {
        const { error: githubError } = await supabase.from("github_projects_data").insert([
          {
            project_id: projectId,
            repo_owner: user.user_metadata.user_name,
            repo_name: repo.name,
            repo_fullname: repo.full_name,
            repo_url: repo.html_url,
            repo_desc: repo.description,
            full_desc: projectFullDesc,
            stars_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            open_issue_count: repo.open_issues_count,
            language: repo.language,
            website_link: repo.homepage,
            instagram_link: instagramLink,
            documentation_link: documentationLink,
          },
        ]);

        if (githubError) {
          throw githubError;
        }
      } else if (isManual && projectId) {
        const { error: customError } = await supabase.from("custom_projects_data").insert([
          {
            project_id: projectId,
            name: projectName,
            full_desc: projectFullDesc,
            short_desc: projectShortDesc,
            code_url: codeLink,
            language: selectedLanguage,
            website_link: websiteLink,
            instagram_link: instagramLink,
            documentation_link: documentationLink,
          },
        ]);

        if (customError) {
          throw customError;
        }
      }

      router.push("/dashboard");
      setNotification({
        type: "success",
        message: "Project added successfully!",
      });
    } catch (error: any) {
      setNotification({
        type: "error",
        message: `Error adding project: ${error.message}`,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-md border-2 p-4">
      <p className="text-end text-sm italic">
        <span className="text-red-500"> * </span>: Required fields
      </p>
      <div className="flex flex-col">
        <h2 className="flex items-center gap-2 pb-1 text-xl font-semibold">
          <BsInfoSquare />
          Project informations:
        </h2>
        <div className="flex w-full flex-col justify-between gap-2 pb-2 md:flex-row">
          <div className="flex w-full flex-col">
            <label>
              Project Name:<span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              readOnly={!!repo}
              className={`appearance-none rounded-md px-2 py-1 caret-emerald-500 focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-emerald-500 dark:bg-zinc-100 dark:text-zinc-900 ${repo ? "cursor-not-allowed select-none opacity-60 ring-0 focus:outline-transparent" : ""}`}
            />
          </div>
          <div className="flex w-full flex-col">
            <label>
              {repo ? "Repository link" : "Link to your project code:"}
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="url"
              required
              value={codeLink}
              onChange={(e) => setCodeLink(e.target.value)}
              readOnly={!!repo}
              className={`appearance-none rounded-md px-2 py-1 caret-emerald-500 focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-emerald-500 dark:bg-zinc-100 dark:text-zinc-900 ${repo ? "cursor-not-allowed select-none opacity-60 ring-0 focus:outline-transparent" : ""}`}
            />
          </div>
        </div>
        <div className="flex w-full flex-col items-end justify-between gap-2 pb-2 md:flex-row">
          <div className="flex w-full flex-col">
            <label>
              {repo ? "Repository description:" : "Short description (max 100 characters):"}
              <span className="text-red-500"> *</span>
            </label>
            <input
              type="text"
              required
              value={projectShortDesc}
              onChange={(e) => setProjectShortDesc(e.target.value)}
              maxLength={100}
              readOnly={!!repo?.description}
              className={`appearance-none rounded-md px-2 py-1 caret-emerald-500 focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-emerald-500 dark:bg-zinc-100 dark:text-zinc-900 ${repo?.description ? "cursor-not-allowed select-none opacity-60 ring-0 focus:outline-transparent" : ""}`}
            />
          </div>
          <div className="w-full">
            <label>
              {repo ? "Repository language:" : "Project language"}
              <span className="text-red-500"> *</span>
            </label>
            <select
              onChange={handleLanguageSelect}
              value={selectedLanguage}
              disabled={!!repo}
              className={`w-full rounded-md border px-2 py-[4.9px] duration-150 dark:focus:bg-zinc-100 dark:focus:text-zinc-900 ${repo ? "cursor-not-allowed select-none opacity-60 ring-0 focus:outline-transparent dark:bg-zinc-100 dark:text-zinc-900" : "dark:bg-zinc-950 dark:hover:bg-zinc-100 dark:hover:text-zinc-900"}`}
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
            className="min-h-16 appearance-none rounded-md px-2 py-1 caret-emerald-500 focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-emerald-500 dark:bg-zinc-100 dark:text-zinc-900"
          />
        </div>
      </div>

      {repo && (
        <div className="flex flex-col">
          <h3 className="flex items-center gap-2 pb-1 text-xl font-semibold">
            <FaGithub />
            Github infos:
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col justify-between">
              <p>Stars: {repo.stargazers_count}</p>
              <p>Forks: {repo.forks_count}</p>
              <p>Issues: {repo.open_issues_count}</p>
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
            <label>{repo ? "Repository website link:" : "Website Link"}</label>
            <input
              type="url"
              value={websiteLink}
              onChange={(e) => setWebsiteLink(e.target.value)}
              readOnly={!!repo?.homepage}
              className={`appearance-none rounded-md px-2 py-1 caret-emerald-500 focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-emerald-500 dark:bg-zinc-100 dark:text-zinc-900 ${repo?.homepage ? "cursor-not-allowed select-none opacity-60 ring-0 focus:outline-transparent" : ""}`}
            />
          </div>
          <div className="flex w-full flex-col">
            <label>Documentation website link</label>
            <input
              type="url"
              value={documentationLink}
              onChange={(e) => setDocumentationLink(e.target.value)}
              maxLength={80}
              className={`appearance-none rounded-md px-2 py-1 caret-emerald-500 focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-emerald-500 dark:bg-zinc-100 dark:text-zinc-900`}
            />
          </div>
          <div className="flex w-full flex-col">
            <label>Instagram profile link</label>
            <input
              type="url"
              value={instagramLink}
              onChange={(e) => setInstagramLink(e.target.value)}
              maxLength={80}
              className={`appearance-none rounded-md px-2 py-1 caret-emerald-500 focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-emerald-500 dark:bg-zinc-100 dark:text-zinc-900`}
            />
          </div>
        </div>
      </div>

      <button type="submit" className="rounded-md bg-teal-500 px-4 py-2 text-white hover:bg-teal-600">
        Save Project
      </button>
    </form>
  );
};

export default AddProjectForm;
