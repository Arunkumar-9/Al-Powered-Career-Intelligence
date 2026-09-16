function ProfessionalSection({ formData, handleChange, isEditing }) {
  return (
    <div className="profile-card">
      <h2>💼 Professional Information</h2>

      <div className="form-grid">

        <div className="input-group">
          <label>Skills</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="Java, React, MongoDB"
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Interests</label>
          <input
            type="text"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            placeholder="AI, Web Development"
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Career Goal</label>
          <input
            type="text"
            name="careerGoal"
            value={formData.careerGoal}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Preferred Role</label>
          <input
            type="text"
            name="preferredRole"
            value={formData.preferredRole}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Experience</label>
          <input
            type="text"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

      </div>
    </div>
  );
}

export default ProfessionalSection;