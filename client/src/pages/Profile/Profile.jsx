import WelcomeCard from "../../components/profile/WelcomeCard";
import ProgressCard from "../../components/profile/ProgressCard";
import PersonalSection from "../../components/profile/PersonalSection";
import AcademicSection from "../../components/profile/AcademicSection";
import ProfessionalSection from "../../components/profile/ProfessionalSection";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  createProfile,
  getProfile,
  updateProfile,
} from "../../services/profileService";
import "./Profile.css";

// Bug 2 fix: mirrors the same field list / calculation the backend
// uses in dashboardController.js (computeProfileCompletion) so the
// percentage shown here always matches what's actually saved, and
// updates immediately as the user edits the form.
const PROFILE_COMPLETION_FIELDS = [
  "phone",
  "college",
  "degree",
  "branch",
  "graduationYear",
  "cgpa",
  "skills",
  "interests",
  "careerGoal",
  "preferredRole",
  "experience",
  "location",
];

function Profile() {
  const [formData, setFormData] = useState({
    phone: "",
    location: "",
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    cgpa: "",
    skills: "",
    interests: "",
    careerGoal: "",
    preferredRole: "",
    experience: "",
  });

  const [profileExists, setProfileExists] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getProfile();

      const data = res.data;

      setProfileExists(true);

      setFormData({
        phone: data.phone || "",
        location: data.location || "",
        college: data.college || "",
        degree: data.degree || "",
        branch: data.branch || "",
        graduationYear: data.graduationYear || "",
        cgpa: data.cgpa || "",
        skills: data.skills?.join(", ") || "",
        interests: data.interests?.join(", ") || "",
        careerGoal: data.careerGoal || "",
        preferredRole: data.preferredRole || "",
        experience: data.experience || "",
      });
    } catch {
      console.log("No profile found.");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
  const payload = {
    ...formData,
    graduationYear: Number(formData.graduationYear),
    cgpa: Number(formData.cgpa),
    skills: formData.skills
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    interests: formData.interests
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  };

  try {
    if (profileExists) {
      await updateProfile(payload);
      toast.success("Profile Updated Successfully");
    } else {
      await createProfile(payload);
      toast.success("Profile Created Successfully");
      setProfileExists(true);
    }

    setIsEditing(false);
    loadProfile();
  } catch (error) {
    toast.error(error.response?.data?.message || "Something went wrong");
  }
};

  const handleCancel = () => {
    loadProfile();
    setIsEditing(false);
  };

  // Recalculates instantly whenever any tracked field in formData
  // changes (typing, saving, loading), instead of the previous
  // hardcoded 80%.
  const completionPercentage = useMemo(() => {
    const filled = PROFILE_COMPLETION_FIELDS.filter((field) => {
      const value = formData[field];
      return value !== undefined && value !== null && String(value).trim() !== "";
    });

    return Math.round((filled.length / PROFILE_COMPLETION_FIELDS.length) * 100);
  }, [formData]);

  return (
    <div className="profile-container">
      <WelcomeCard />

      <ProgressCard percentage={completionPercentage} />

      <div>
        <PersonalSection
          formData={formData}
          handleChange={handleChange}
          isEditing={isEditing}
        />

        <AcademicSection
          formData={formData}
          handleChange={handleChange}
          isEditing={isEditing}
        />

        <ProfessionalSection
          formData={formData}
          handleChange={handleChange}
          isEditing={isEditing}
        />

        
         <div className="save-btn">
  {!isEditing ? (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
    >
      ✏ Edit Profile
    </button>
  ) : (
    <>
      <button
        type="button"
        onClick={handleSubmit}
      >
        💾 Save Changes
      </button>

      <button
        type="button"
        className="cancel-btn"
        onClick={handleCancel}
      >
        ❌ Cancel
      </button>
    </>
  )}
</div>
      </div>
    </div>
  );
}

export default Profile;
