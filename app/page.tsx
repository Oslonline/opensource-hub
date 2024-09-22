"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import HomeCard from "@/components/projects/HomeCard";
import { programmingLanguages } from "@/utils/languages";
import { Project } from "@/types/types";

export default function Index() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [totalProjectsCount, setTotalProjectsCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");

  const supabase = createClient();

  useEffect(() => {
    const fetchTotalProjectsCount = async () => {
      try {
        const { count, error: countError } = await supabase.from("projects").select("id", { count: "exact", head: true });
        if (countError) throw countError;

        setTotalProjectsCount(count || 0);
      } catch (error) {
        setError("Failed to load project count.");
      } finally {
        setLoadingCount(false);
      }
    };

    fetchTotalProjectsCount();
  }, [supabase]);

  useEffect(() => {
    if (!loadingCount) {
      const fetchProjects = async () => {
        try {
          setLoading(true);

          const { data: githubProjects, error: githubError } = await supabase.from("github_projects_data").select("*").order("created_at", { ascending: false });
          if (githubError) throw githubError;

          const { data: customProjects, error: customError } = await supabase.from("custom_projects_data").select("*").order("created_at", { ascending: false });
          if (customError) throw customError;

          const combinedProjects = [...(githubProjects || []), ...(customProjects || [])];
          setProjects(combinedProjects);
          setFilteredProjects(combinedProjects);
        } catch (error) {
          setError("An unexpected error occurred.");
        } finally {
          setLoading(false);
        }
      };

      fetchProjects();
    }
  }, [loadingCount, supabase]);

  useEffect(() => {
    filterProjects();
  }, [searchQuery, selectedLanguage]);

  const filterProjects = () => {
    let filtered = projects;

    if (searchQuery) {
      filtered = filtered.filter((project) => project.repo_fullname?.toLowerCase().includes(searchQuery.toLowerCase()) || project.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedLanguage !== "All") {
      filtered = filtered.filter((project) => project.language === selectedLanguage);
    }

    setFilteredProjects(filtered);
  };

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="h-full w-full flex-col items-center justify-evenly p-4">
      <div className="my-24 text-center">
        <h1 className="text-4xl font-bold">Opensource Hub</h1>
        <p className="text-lg font-semibold">
          Discover new <span className="text-teal-500">opensource projects</span> or publish your own and get some help!
        </p>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 rounded-md border-2 bg-zinc-950 p-4 dark:border-zinc-500">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2 w-full appearance-none rounded-md px-2 py-2 caret-teal-500 focus:outline-none focus:outline-2 focus:outline-offset-0 focus:outline-teal-500 dark:bg-zinc-100 dark:text-zinc-900"
          />

          <span className="h-0.5 w-2/3 rounded-full bg-custom-radial-gradient"></span>

          <div className="w-full">
            <div className="flex flex-col gap-1">
              <p className="text-sm italic">Language</p>
              <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="w-fit rounded-md border px-3 py-[4.9px] duration-150 dark:bg-zinc-950 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 dark:focus:bg-zinc-100 dark:focus:text-zinc-900">
                <option value="All">All</option>
                {programmingLanguages.map((language, index) => (
                  <option key={index} value={language.name}>
                    {language.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {[...Array(totalProjectsCount || 8)].map((_, index) => (
              <div key={index} className="flex animate-pulse flex-col justify-between gap-2 rounded-md border-2 bg-zinc-950 p-4">
                <div className="h-6 w-2/3 rounded bg-zinc-700"></div>
                <div className="h-4 w-full rounded bg-zinc-700"></div>
                <div className="h-4 w-1/2 rounded bg-zinc-700"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filteredProjects.map((project) => (
              <HomeCard key={project.project_id} {...project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
