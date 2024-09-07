"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Project } from "@/types/types";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardCard from "@/components/projects/DashboardCard";
import { GithubRepo } from "@/types/types";
import { useNotification } from "@/context/NotificationContext";
import Notification from "@/components/commons/Notification";
import { HiOutlinePlus } from "react-icons/hi2";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { notification, setNotification } = useNotification();

  const router = useRouter();
  const { logout } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          router.push("/");
          return;
        }

        const { data: githubProjects, error: githubError } = await supabase.from("github_projects_data").select("*").eq("user_id", user.id);
        if (githubError) throw githubError;
        const { data: customProjects, error: customError } = await supabase.from("custom_projects_data").select("*").eq("user_id", user.id);
        if (customError) throw customError;

        if (githubProjects && githubProjects.length > 0) {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;

          const accessToken = sessionData.session?.provider_token;

          if (!accessToken) {
            await logout();
            setError("GitHub token is missing.");
            setLoading(false);
            return;
          }
          await fetchGitHubProjects(accessToken, githubProjects);
        } else {
          setProjects(customProjects || []);
        }

        if (githubProjects && customProjects) {
          setProjects([...githubProjects, ...customProjects]);
        } else if (githubProjects) {
          setProjects(githubProjects);
        } else if (customProjects) {
          setProjects(customProjects);
        }
      } catch (error: any) {
        setError("An error occurred while fetching projects.");
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchGitHubProjects = async (accessToken: string, githubProjects: Project[]) => {
      try {
        const updatedProjects: Project[] = [];
        for (const project of githubProjects) {
          const res = await fetch(`https://api.github.com/repos/${project.repo_fullname}`, {
            headers: {
              Authorization: `token ${accessToken}`,
            },
          });

          if (!res.ok) continue;
          const githubData: GithubRepo = await res.json();

          if (githubData.description !== project.repo_desc || githubData.stargazers_count !== project.stars_count || githubData.forks_count !== project.forks_count || githubData.open_issues_count !== project.open_issue_count || githubData.language !== project.language) {
            const { error: updateError } = await supabase
              .from("github_projects_data")
              .update({
                repo_desc: githubData.description,
                stars_count: githubData.stargazers_count,
                forks_count: githubData.forks_count,
                open_issue_count: githubData.open_issues_count,
                language: githubData.language,
              })
              .eq("id", project.id);

            if (updateError) throw updateError;

            updatedProjects.push({
              ...project,
              repo_desc: githubData.description,
              stars_count: githubData.stargazers_count,
              forks_count: githubData.forks_count,
              open_issue_count: githubData.open_issues_count,
              language: githubData.language,
            });
          } else {
            updatedProjects.push(project);
          }
        }

        setProjects(updatedProjects);
      } catch (error) {
        console.error("Error fetching GitHub projects:", error);
        setError("Failed to fetch GitHub projects.");
      }
    };

    fetchProjects();
  }, [supabase, router, logout]);

  return (
    <div className="flex h-full w-full flex-col gap-6 p-4">
      <div className="text-start">
        <h1 className="text-4xl font-bold">My Projects</h1>
        <p>View, edit & delete your projects here.</p>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div>
          {projects.length === 0 ? (
            <p>
              You have no projects yet.{" "}
              <Link className="text-blue-400 hover:underline" href={"/dashboard/add-project"}>
                Add one now!
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((project) => (
                <DashboardCard key={project.id} {...project} />
              ))}
            </div>
          )}
        </div>
      )}
      <Link className="flex items-center justify-center md:hidden gap-2 rounded-md border px-2 py-2 duration-150 dark:border-zinc-100 dark:hover:border-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-950" href="/dashboard/add-project">
        Add Project
        <HiOutlinePlus fontSize={20} />
      </Link>
      <div>
        <p>Each time you refresh this page, the data from your GitHub projects is fetched and updated in the database if there are any changes.</p>
        <p className="text-sm italic text-zinc-400">Please note that if you have many GitHub projects, the loading time might be longer.</p>
      </div>

      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
}
