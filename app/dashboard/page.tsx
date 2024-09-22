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
        if (userError || !user) {
          router.push("/");
          return;
        }

        const [{ data: githubProjects, error: githubError }, { data: customProjects, error: customError }] = await Promise.all([supabase.from("github_projects_data").select("*").eq("user_id", user.id), supabase.from("custom_projects_data").select("*").eq("user_id", user.id)]);
        if (githubError) throw githubError;
        if (customError) throw customError;

        if (githubProjects?.length > 0) {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !sessionData.session?.provider_token) {
            logout();
            setError("GitHub token is missing.");
            return;
          }
          await fetchGitHubProjects(sessionData.session.provider_token, githubProjects);
        }

        setProjects([...githubProjects, ...customProjects].filter(Boolean));
      } catch (error: any) {
        setError("An error occurred while fetching projects.");
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchGitHubProjects = async (accessToken: string, githubProjects: Project[]) => {
      try {
        const updatedProjects = await Promise.all(
          githubProjects.map(async (project) => {
            const res = await fetch(`https://api.github.com/repos/${project.repo_fullname}`, {
              headers: { Authorization: `token ${accessToken}` },
            });

            if (!res.ok) return project;
            const githubData: GithubRepo = await res.json();

            const updates = {
              repo_desc: githubData.description,
              website_link: githubData.homepage,
              stars_count: githubData.stargazers_count,
              forks_count: githubData.forks_count,
              open_issue_count: githubData.open_issues_count,
              language: githubData.language,
            };

            if (Object.values(updates).some((val, i) => val !== Object.values(project)[i])) {
              const { error: updateError } = await supabase.from("github_projects_data").update(updates).eq("id", project.id);
              if (updateError) throw updateError;
              return { ...project, ...updates };
            }

            return project;
          }),
        );
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
      <Link className="flex items-center justify-center gap-2 rounded-md border px-2 py-2 duration-150 dark:border-zinc-100 dark:hover:border-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-950 md:hidden" href="/dashboard/add-project">
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
