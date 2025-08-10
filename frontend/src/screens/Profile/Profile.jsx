import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import {
  sendGetProfileRequest,
  sendUpdateProfileRequest,
} from "../../api/user";
import Navbar from "../../components/Navbar";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import { dateFormatter } from "../../utils";
import "./Profile.css";
import { useNavigate } from "react-router";

// TODO: Validation
// TODO: Errors
function Profile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState();
  const [fullName, setFullName] = useState();
  const [phone, setPhone] = useState();

  const [didSave, setDidSave] = useState(false);

  const navigate = useNavigate();
  const isProfileCreator = !profile || !profile.full_name || !profile.phone;

  const syncProfileWithState = (newProfile) => {
    setProfile(newProfile);
    setFullName(newProfile.full_name);
    setPhone(newProfile.phone);
  };

  useEffect(() => {
    document.title = "Home";
    sendGetProfileRequest(user).then(syncProfileWithState);
  }, [user]);

  useEffect(() => {
    const timeout = setTimeout(() => setDidSave(false), 2000);
    return () => clearTimeout(timeout);
  }, [didSave]);

  const handleProfileUpdate = async () => {
    await sendUpdateProfileRequest(user, {
      full_name: fullName,
      phone,
    });

    if (isProfileCreator) {
      navigate("/", { replace: true });
    } else {
      const updatedProfile = await sendGetProfileRequest(user);
      syncProfileWithState(updatedProfile);
      setDidSave(true);
    }
  };

  if (!profile) {
    return <h1>Loading</h1>;
  }

  console.log(profile);

  return (
    <>
      {!isProfileCreator && <Navbar active="Profile" />}
      <h2>{isProfileCreator ? "Create profile" : "Profile"}</h2>
      <form className="profile-form" action={handleProfileUpdate}>
        <InputField
          placeholder="Username"
          name="username"
          value={profile.username}
          disabled={true}
        />
        <InputField
          placeholder="Full name"
          name="full-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <InputField
          type="tel"
          placeholder="Phone"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {!isProfileCreator && (
          <p>
            Account created at{" "}
            {dateFormatter.format(new Date(profile.created_at))}
          </p>
        )}
        <PrimaryButton type="submit">Save</PrimaryButton>
        {didSave && <h2>Saved</h2>}
      </form>
    </>
  );
}

export default Profile;
