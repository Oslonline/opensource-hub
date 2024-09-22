"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import AddProjectForm from "@/components/forms/AddProjectForm";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { GithubRepo } from "@/types/types";
import { useAuth } from "@/context/AuthContext";

const AddProjectsPage = () => {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [isManual, setIsManual] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchRepos = async () => {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const accessToken = session?.provider_token;
        if (!accessToken) {
          await logout();
          router.push("/");
          return;
        }

        const res = await fetch("https://api.github.com/user/repos?type=public", {
          headers: {
            Authorization: `token ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch repositories");

        const allRepos: GithubRepo[] = await res.json();
        const { data: existingProjects } = await supabase.from("github_projects_data").select("repo_fullname").eq("user_id", user.id);
        const importedRepoNames = existingProjects?.map((project) => project.repo_fullname) || [];
        const filteredRepos = allRepos.filter((repo) => !importedRepoNames.includes(repo.full_name));

        const reposWithLanguages = await Promise.all(
          filteredRepos.map(async (repo) => {
            const langRes = await fetch(`https://api.github.com/repos/${repo.full_name}/languages`, {
              headers: {
                Authorization: `token ${accessToken}`,
              },
            });

            const languages = await langRes.json();
            return { ...repo, languages };
          }),
        );

        setRepos(reposWithLanguages);
      } catch (err: any) {
        setError("An error occurred while fetching repositories.");
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [supabase, router, user, logout]);

  const handleRepoSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRepo = repos.find((repo) => repo.full_name === event.target.value) || null;
    setSelectedRepo(selectedRepo);
    setIsManual(false);
  };

  const handleManualAdd = () => {
    setSelectedRepo(null);
    setIsManual(true);
  };

  return (
    <div className="relative flex flex-col gap-8 p-4">
      <div>
        <div className="text-center md:text-start">
          <h1 className="text-4xl font-bold">Add a new project</h1>
          <p>Add a new open-source project to the collection. You can import your project directly from GitHub or add it manually.</p>
        </div>
        <div className="mt-4 flex w-full flex-col justify-center gap-2 md:mt-2 md:w-fit md:flex-row">
          <button
            onClick={handleManualAdd}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-950 px-2 py-2 duration-150 hover:bg-zinc-950 hover:text-zinc-100 dark:border-zinc-100 dark:hover:border-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-950 md:w-fit md:justify-start"
          >
            <HiOutlinePencilAlt fontSize={20} /> Add manually
          </button>
          <select
            onChange={handleRepoSelect}
            value={selectedRepo ? selectedRepo.full_name : ""}
            className="h-full rounded-md border border-zinc-950 bg-zinc-50 px-2 py-2.5 duration-150 hover:cursor-pointer hover:bg-zinc-950 hover:text-zinc-50 focus:bg-zinc-950 focus:text-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-100 dark:border-zinc-50 dark:hover:text-zinc-900 dark:focus:bg-zinc-100 dark:focus:text-zinc-900"
          >
            <option className="flex" value="">
              Select a GitHub repository to import
            </option>
            {loading ? (
              <option>Loading repositories...</option>
            ) : error ? (
              <option>Error loading repositories</option>
            ) : repos.length > 0 ? (
              repos.map((repo) => (
                <option key={repo.id} value={repo.full_name}>
                  {repo.full_name}
                </option>
              ))
            ) : (
              <option>No repositories available</option>
            )}
          </select>
        </div>
      </div>
      {(selectedRepo || isManual) && <AddProjectForm repo={selectedRepo} isManual={isManual} />}
    </div>
  );
};

export default AddProjectsPage;
