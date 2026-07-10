import "./Features.css";
import { FaRobot, FaFileAlt, FaRoad, FaComments } from "react-icons/fa";

function Features() {
  const features = [
    {
      icon: <FaRobot />,
      title: "AI Career Recommendation",
      description:
        "Get personalized career suggestions based on your skills, interests, and goals.",
    },
    {
      icon: <FaFileAlt />,
      title: "Resume Analysis",
      description:
        "Upload your resume and receive AI-powered feedback and improvement suggestions.",
    },
    {
      icon: <FaRoad />,
      title: "Learning Roadmap",
      description:
        "Receive a customized learning path to achieve your dream career.",
    },
    {
      icon: <FaComments />,
      title: "AI Career Assistant",
      description:
        "Chat with an AI assistant for career advice, interview preparation, and guidance.",
    },
  ];

  return (
    <section className="features">
      <h2>Our Features</h2>
      <p className="section-description">
        Everything you need to plan and grow your career.
      </p>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;