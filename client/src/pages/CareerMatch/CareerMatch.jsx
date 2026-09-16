import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaMagic } from "react-icons/fa";
import CareerRecommendationCard from "../../components/career/CareerRecommendationCard";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import {
  getCareerRecommendations,
  getLatestCareerRecommendation,
} from "../../services/careerService";
import "./CareerMatch.css";

// Module 3: Career Recommendation. Analyzes education, projects,
// technical skills, experience and certifications (profile + resume)
// and recommends compatible roles with compatibility %, reason,
// required skills and a roadmap.
function CareerMatch() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getLatestCareerRecommendation();
        setRecommendations(res.data.report?.recommendations || res.data.recommendations || []);
        setHasRun(true);
      } catch {
        // no previous recommendation yet
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await getCareerRecommendations();
      setRecommendations(res.data.report.recommendations || []);
      setHasRun(true);
      toast.success(res.data.cached ? "Loaded previous recommendations" : "Career recommendations ready");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate career recommendations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="career-match-page">
      <div className="career-match-page__header">
        <div>
          <h1>Career Recommendation</h1>
          <p>AI-matched career paths based on your profile, resume and skills.</p>
        </div>
        <Button icon={<FaMagic />} onClick={handleGenerate} loading={loading}>
          {hasRun ? "Regenerate" : "Generate Recommendations"}
        </Button>
      </div>

      {(loading || initializing) && <Loader label="Analyzing your profile for career matches..." />}

      {!loading && !initializing && recommendations.length === 0 && (
        <Card>
          <EmptyState
            title="No career recommendations yet"
            description="Click Generate Recommendations to analyze your profile and resume."
          />
        </Card>
      )}

      {!loading && !initializing && recommendations.length > 0 && (
        <div className="career-match-page__grid">
          {recommendations
            .slice()
            .sort((a, b) => b.compatibility - a.compatibility)
            .map((item, i) => (
              <CareerRecommendationCard key={i} item={item} />
            ))}
        </div>
      )}
    </div>
  );
}

export default CareerMatch;
