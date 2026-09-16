import { FaStar, FaClock, FaExternalLinkAlt } from "react-icons/fa";
import Card from "../common/Card";
import "./CourseCard.css";

function CourseCard({ course }) {
  return (
    <Card className="course-card" tight>
      <div className="course-card__platform">{course.platform}</div>
      <h4>{course.title}</h4>
      <div className="course-card__meta">
        <span>{course.difficulty}</span>
        <span>
          <FaClock /> {course.duration}
        </span>
        <span>
          <FaStar color="#f59e0b" /> {course.rating}
        </span>
      </div>
      <a href={course.url} target="_blank" rel="noopener noreferrer" className="course-card__link">
        View Course <FaExternalLinkAlt size={11} />
      </a>
    </Card>
  );
}

export default CourseCard;
