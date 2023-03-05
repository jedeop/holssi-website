export interface Response<T> {
  success: boolean,
  data: T
}
export interface Project {
    project_id: string,
    status: 'Created' | 'Uploaded' | 'Building' | 'Success' | 'Failed',
    created: string,
}

export async function create(): Promise<Project> {
  const result = await fetchJSON<unknown, Project>(`/project/create`, {});

  return result;
}

export async function upload(project_id: string, file: File): Promise<boolean> {
  const url = await fetchGET<string>(`/project/${project_id}/ent_signed?file_name=${file.name}`);

  const result = fetchS3(url, file);

  return result;
}

export async function status(project_id: string): Promise<Project> {
  const status = await fetchGET<Project>(`/project/${project_id}/status`);

  return status;
}

export async function download_url(project_id: string): Promise<string> {
  const url = await fetchGET<string>(`/project/${project_id}/executable_download`);

  return url;
}

export interface BuildData {
  name: string;
  nameEn: string;
  author: string;
  version: string;
  desc: string;
}
export async function runBuild(project_id: string, data: BuildData): Promise<Project> {

  const result = await fetchJSON<unknown, Project>(`/project/${project_id}/build`, data);

  return result;
}

async function fetcher<T>(key: string, body: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${key}`, body);

  if (res.status !== 200 && res.status !== 400 && res.status !== 500) {
    throw new Error(`Fetch Error: ${res.status} / ${res.statusText} / ${await res.text()}`);
  }

  const result: Response<T> = await res.json();

  if (!result.success) {
    throw new Error(`Fetch Error: ${res.status} / ${res.statusText} / ${result.data}`);
  }

  return result.data;
}
async function fetchJSON<U, T>(key: string, data: U): Promise<T> {
  return fetcher<T>(key, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    }
  })
}
async function fetchGET<T>(key: string): Promise<T> {
  return fetcher<T>(key, {
    method: "GET",
  })
}

async function fetchS3(key: string, file: File): Promise<boolean> {
  const res = await fetch(key, {
    method: "PUT",
    body: file,
  });

  if (res.status == 200) {
    return true;
  } else {
    return false;
  }
}