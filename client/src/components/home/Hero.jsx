import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>
          AI-Powered <span>Career Guidance</span>
        </h1>

        <p>
          Discover the right career path with AI-powered recommendations,
          resume analysis, personalized learning roadmaps, and interview
          preparation.
        </p>

        <div className="hero-buttons">
          <button className="primary-btn">Get Started</button>
          <button className="secondary-btn">Learn More</button>
        </div>
      </div>
    </section>
  );
}

export default Hero;