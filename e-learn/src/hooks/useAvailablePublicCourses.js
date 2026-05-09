import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setCourses } from "../features/activeCoursesSlice";
import { getPublishedPublicCourses } from "../utils/publicCourseCatalog";

export default function useAvailablePublicCourses(options = {}) {
  const dispatch = useDispatch();
  const courses = useSelector((state) => state.activeCourses.courses);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [pageCourses, setPageCourses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, offset: 0, limit: 12 });
  const { offset: rawOffset = 0, limit: rawLimit = 12, usePagination = false } = options || {};
  const offset = Number.isFinite(Number(rawOffset)) && Number(rawOffset) >= 0 ? Number(rawOffset) : 0;
  const limit = Number.isFinite(Number(rawLimit)) && Number(rawLimit) > 0 ? Number(rawLimit) : 12;

  useEffect(() => {
    let ignore = false;

    const fetchCourses = async () => {
      try {
        setStatus("loading");
        setError("");
        const response = await axios.get("/api/courses/available", {
          withCredentials: true, //no priror cookies needed for this endpoint,
          //  but in case we want to use session-based auth in the future, we can keep this here
          params: usePagination ? { offset, limit } : undefined,
        });
        const fetchedCourses = Array.isArray(response?.data?.data) ? response.data.data : [];
        const total = Number.isFinite(Number(response?.data?.total))
          ? Number(response.data.total)
          : fetchedCourses.length;
        if (ignore) return;
        dispatch(setCourses(fetchedCourses));
        setPageCourses(fetchedCourses);
        setPagination({ total, offset, limit });
        setStatus("success");
      } catch (fetchError) {
        if (ignore) return;
        console.error("Failed to fetch public courses:", fetchError);
        setError(fetchError?.response?.data?.message || "Unable to load courses right now.");
        setPageCourses([]);
        setPagination({ total: 0, offset, limit });
        setStatus("error");
      }
    };

    fetchCourses();

    return () => {
      ignore = true;
    };
  }, [dispatch, offset, limit, usePagination]);

  const sourceCourses = usePagination ? pageCourses : courses;
  const publicCourses = useMemo(() => {
    if (usePagination) {
      return Array.isArray(sourceCourses)
        ? sourceCourses.filter((course) => course?.isPublished)
        : [];
    }

    return getPublishedPublicCourses(sourceCourses);
  }, [sourceCourses, usePagination]);

  return {
    publicCourses,
    status,
    error,
    pagination,
  };
}
