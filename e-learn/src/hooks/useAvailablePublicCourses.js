import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setCourses } from "../features/activeCoursesSlice";
import { getPublishedPublicCourses } from "../utils/publicCourseCatalog";

export default function useAvailablePublicCourses() {
  const dispatch = useDispatch();
  const courses = useSelector((state) => state.activeCourses.courses);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchCourses = async () => {
      try {
        setStatus("loading");
        setError("");
        const response = await axios.get("/api/courses/available", {
          withCredentials: true,
        });
        const fetchedCourses = Array.isArray(response?.data?.data) ? response.data.data : [];
        if (ignore) return;
        dispatch(setCourses(fetchedCourses));
        setStatus("success");
      } catch (fetchError) {
        if (ignore) return;
        console.error("Failed to fetch public courses:", fetchError);
        setError(fetchError?.response?.data?.message || "Unable to load courses right now.");
        setStatus("error");
      }
    };

    fetchCourses();

    return () => {
      ignore = true;
    };
  }, [dispatch]);

  const publicCourses = useMemo(
    () => getPublishedPublicCourses(courses),
    [courses]
  );

  return {
    publicCourses,
    status,
    error,
  };
}
