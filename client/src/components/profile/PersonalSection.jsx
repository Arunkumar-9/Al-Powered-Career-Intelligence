function PersonalSection({ formData, handleChange, isEditing }) {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="profile-card">
      <h2>👤 Personal Information</h2>

      <div className="form-grid">

        <div className="input-group">
          <label>Full Name</label>
          <input
            type="text"
            value={user?.name || ""}
            readOnly
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            value={user?.email || ""}
            readOnly
          />
        </div>

        <div className="input-group">
          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            readOnly={!isEditing}
          />
        </div>

        <div className="input-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter location"
            readOnly={!isEditing}
          />
        </div>

      </div>
    </div>
  );
}

export default PersonalSection;