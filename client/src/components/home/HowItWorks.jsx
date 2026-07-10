import "./HowItWorks.css";

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Create an Account",
      description: "Sign up and securely log in to access your personalized dashboard.",
    },
    {
      number: "02",
      title: "Complete Your Profile",
      description: "Enter your education, skills, interests, and career goals.",
    },
    {
      number: "03",
      title: "Get AI Analysis",
      description: "Upload your resume and receive AI-powered career insights.",
    },
    {
      number: "04",
      title: "Start Your Journey",
      description: "Follow your personalized roadmap and prepare for interviews.",
    },
  ];

  return (
    <section className="how-it-works">
      <h2>How It Works</h2>
      <p className="section-description">
        Get career guidance in just four simple steps.
      </p>

      <div className="steps-container">
        {steps.map((step) => (
          <div className="step-card" key={step.number}>
            <div className="step-number">{step.number}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;