import { useEffect, useState } from "react";
import { Project, status } from "./fetch";

export function useProjectStatus(id: string, now: boolean): Project | null {
  let [project, setProject] = useState<Project | null>(null);
  let [lastCallback, setLastCallback] = useState<any>();

  function check() {
    console.log("checking run")
    if (!now) return;
    console.log("really checking run")
    status(id)
      .then(d => {
        setProject(d)
      })
      .finally(() => {
        let t = setTimeout(check, 15 * 1000);
        setLastCallback(t);
      })
  }

  useEffect(() => {
    if (lastCallback) clearTimeout(lastCallback);
    check();
    return () => {
      clearTimeout(lastCallback);
    }
  }, [now])

  return project;
}