export type Project = {
    id: string;
    project_id: string;
    name: string
    repo_name: string;
    repo_fullname: string;
    short_desc: string;
    repo_desc: string;
    repo_url: string;
    code_url: string;
    full_desc: string;
    language: string;
    stars_count: number;
    forks_count: number;
    open_issue_count: number;
    website_link: string;
    instagram_link: string;
    documentation_link: string;
}

export type GithubRepo = {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    language: string;
    homepage: string;
};

export type DashboardCardProps = {
    id: string;
    project_id: string;
    repo_name?: string;
    repo_fullname: string;
    short_desc: string;
    repo_desc: string;
    stars_count?: number;
    forks_count?: number;
    name?: string;
    language: string;
}

export type HomeCardProps = {
    id: string;
    project_id: string;
    name?: string;
    repo_name?: string;
    repo_fullname: string;
    short_desc: string;
    repo_desc: string;
    stars_count?: number;
    forks_count?: number;
    open_issue_count?: number;
    language: string
}

export type EditProjectFormProps = {
    projectData: {
        project_id: string;
        name: string;
        repo_fullname: string;
        repo_desc: string;
        short_desc: string;
        full_desc: string;
        repo_url: string;
        code_url: string;
        language: string;
        stars_count?: number;
        forks_count?: number;
        open_issue_count?: number;
        website_link: string;
        instagram_link: string;
        documentation_link: string;
        type: "github" | "custom";
    };
}