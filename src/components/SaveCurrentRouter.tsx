import { getCachedRoute, setCacheRoute } from "@/lib/cache-route";
import { useLocation, useNavigate } from "react-router-dom";

import { useEffect } from "react";
import { useProjectStore } from "@/stores/project";

export default function SaveCurrentRouter() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const projects = useProjectStore((state) => state.projects);

  useEffect(() => {
    if (projects.length === 0 && pathname !== "/empty") {
      console.log("no projects => redirect to empty");
      navigate("/empty");
      return;
    }
  }, [projects, navigate, pathname]);

  useEffect(() => {
    if (projects.length === 0) {
      return;
    }


    if (pathname === "/") {
      const cachedRoute = getCachedRoute();
      if (cachedRoute) {
        navigate(cachedRoute);
      } else {
        console.log("no cached route => redirect to first project", projects);
        navigate(`/uml/${projects[0].id}`);
      }
      return;
    }


    if (pathname.startsWith("/uml/")) {

      setCacheRoute(pathname)
    }
  }, [pathname, navigate, projects]);

  return null;
}
