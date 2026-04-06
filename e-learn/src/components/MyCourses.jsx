import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import  CourseCard  from "./CourseCard";
 function ViewCourses() {
  const courses = useSelector(state => state.activeCourses.courses); 
  return (
    <div>
      <h2>Courses</h2>
      <ul>
        {courses.length === 0 ? (
          <p>No courses enrolled yet.</p>
        ) : (
          courses.map((c) => (
            <li key={c.id}>{c.name}</li>
          ))
        )}

              <div className="sd-page">
                <div className="sd-course-grid">
                  {courses.map((c) => <CourseCard key={c.id} c={c} showBtn />)}
                </div>
              </div> 
        
      </ul>
    </div>
  )
}

export default ViewCourses