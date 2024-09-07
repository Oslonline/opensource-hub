"use client";

import React, { useState, useEffect } from "react";
import EditProjectForm from "@/components/forms/EditProjectForm";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const EditProjectPage: React.FC = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");
  const supabase = createClient();
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndProject = async () => {
      if (!projectId) return;

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setError("Failed to get the current user.");
        return;
      }
      const userId = userData.user.id;
      const { data: project, error: projectError } = await supabase.from("projects").select("user_id, type").eq("id", projectId).eq("user_id", userId).single();

      if (projectError || !project) {
        setError("Project not found or you are not authorized to edit this project.");
        return;
      }

      let projectDetails;
      if (project.type === "github") {
        const { data, error } = await supabase.from("github_projects_data").select("*").eq("project_id", projectId).single();
        if (error) throw error;
        projectDetails = data;
      } else {
        const { data, error } = await supabase.from("custom_projects_data").select("*").eq("project_id", projectId).single();
        if (error) throw error;
        projectDetails = data;
      }

      if (!projectDetails) {
        setError("Unable to fetch project details.");
        return;
      }

      setProjectData({
        ...projectDetails,
        type: project.type,
      });
    };

    fetchUserAndProject();
  }, [projectId]);

  if (!projectId) return <p>No project selected for editing</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-4xl font-bold">Edit project</h1>
        <p>Edit your project infos. Note that you cannot edit infos that coming from github if your project is imported from github.</p>
      </div>
      {projectData && <EditProjectForm projectData={projectData} />}
    </div>
  );
};

export default EditProjectPage;
