function AcademicSection({ formData, handleChange, isEditing }) {
  return (
    <div className="profile-card">
      <h2>🎓 Academic Information</h2>

      <div className="form-grid">

        <div className="input-group">
          <label>College</label>
          <input
            type="text"
            name="college"
            value={formData.college}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Degree</label>
          <input
            type="text"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Branch</label>
          <input
            type="text"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Graduation Year</label>
          <input
            type="number"
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>CGPA</label>
          <input
            type="number"
            step="0.01"
            name="cgpa"
            value={formData.cgpa}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

      </div>
    </div>
  );
}

export default AcademicSection;