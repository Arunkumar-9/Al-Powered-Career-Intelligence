function WelcomeCard() {

    const user = JSON.parse(localStorage.getItem("user"));

    return(

        <div className="welcome-card">

            <div>

                <h1>
                    👋 Welcome, {user?.name}
                </h1>

                <p>
                    AI Powered Career Guidance Platform
                </p>

            </div>

        </div>

    )

}

export default WelcomeCard;