import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaSync } from "react-icons/fa";
import CourseCard from "../../components/courses/CourseCard";
import LearningPath from "../../components/courses/LearningPath";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { getCourseRecommendations } from "../../services/courseService";
import "./Roadmap.css";

// Module 5: Course Recommendation + Learning Path ("Roadmap").
// Recommends courses for the missing skills found in the latest
// Skill Gap Analysis (Module 2) and sequences them into a learning path.
function Roadmap() {
  const [courses, setCourses] = useState([]);
  const [learningPath, setLearningPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await getCourseRecommendations();
      if (res.data.message) {
        setMessage(res.data.message);
        setCourses([]);
        setLearningPath([]);
      } else {
        const report = res.data.report || res.data;
        setCourses(report.courses || []);
        setLearningPath(report.learningPath || []);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load course recommendations";
      setMessage(msg);
      if (err.response?.status !== 404) toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="roadmap-page">
      <div className="roadmap-page__header">
        <div>
          <h1>Course Recommendation & Learning Roadmap</h1>
          <p>Curated courses and a suggested order to close your skill gaps.</p>
        </div>
        <Button icon={<FaSync />} onClick={load} loading={loading} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {loading && <Loader label="Building your personalized course roadmap..." />}

      {!loading && message && (
        <Card>
          <EmptyState title="Nothing to show yet" description={message} />
        </Card>
      )}

      {!loading && !message && (
        <>
          {learningPath.length > 0 && <LearningPath steps={learningPath} />}

          {courses.length > 0 && (
            <div className="roadmap-page__grid">
              {courses.map((c, i) => (
                <CourseCard key={i} course={c} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Roadmap;
