import { useEffect } from "react";
import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { dateFormatter } from "../../../utils";
import { sendDeleteUserRequest, sendGetUserRequest, sendUpdateUserRequest } from "../../../api/admin";
import { useNavigate, useParams } from "react-router";
import Navbar from "../../../components/Navbar";
import InputField from "../../../components/InputField";
import SelectBox from "../../../components/SelectBox";
import PrimaryButton from "../../../components/PrimaryButton";
import DeleteButton from "../../../components/DeleteButton";
import "./UserScreen.css";
import { AUTH_ROLE_ADMIN, AUTH_ROLE_CLIENT, AUTH_ROLE_DRIVER } from "../../../api/auth";

// TODO: Error handling
function UserScreen() {
  const { id } = useParams()
  const { user: signedUser } = useAuth();
  const navigate = useNavigate();
  const [didSave, setDidSave] = useState(false);

  const [user, setUser] = useState();
  const [isActive, setIsActive] = useState();
  const [fullName, setFullName] = useState();
  const [phone, setPhone] = useState();
  const [role, setRole] = useState();

  useEffect(() => {
    document.title = "User";
    sendGetUserRequest(signedUser, id).then(setUser);
  }, [signedUser]);

  useEffect(() => {
    if (!user) {
      return;
    }
    setIsActive(user.is_active);
    setFullName(user.full_name);
    setPhone(user.phone);
    setRole(user.role);
  }, [user]);

  useEffect(() => {
    const timeout = setTimeout(() => setDidSave(false), 2000);
    return () => clearTimeout(timeout);
  }, [didSave])

  const handleUserUpdate = async (e) => {
    e.preventDefault()
    await sendUpdateUserRequest(signedUser, id, isActive, fullName, phone, role);
    await sendGetUserRequest(signedUser, id).then(setUser);
    setDidSave(true);
  }

  const handleUserDelete = async () => {
    await sendDeleteUserRequest(signedUser, id);
    navigate('/', { replace: true });
  }

  if (!user) {
    return <h2>Loading...</h2>;
  }

  return (
    <>
      <Navbar active="Home" />

      <h2>User</h2>
      <form className="user-form" onSubmit={handleUserUpdate}>
        <InputField
          placeholder="Username"
          name="username"
          value={user.username}
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
        <SelectBox
          label="Role:"
          disabled={signedUser.profile.id == id}
          onChange={setRole}
          value={role}
        >
          <option>
            {AUTH_ROLE_ADMIN}
          </option>
          <option>
            {AUTH_ROLE_DRIVER}
          </option>
          <option>
            {AUTH_ROLE_CLIENT}
          </option>
        </SelectBox>
        <SelectBox
          label="Is Active:"
          disabled={signedUser.profile.id == id}
          onChange={(v) => setIsActive(v === 'yes')}
          value={isActive ? 'yes' : 'no'}
        >
          <option>
            yes
          </option>
          <option>
            no
          </option>
        </SelectBox>
        <p>
          Account created at{" "}
          {dateFormatter.format(new Date(user.created_at))}
        </p>
        <PrimaryButton type="submit">Save</PrimaryButton>
        {signedUser.profile.id != id && <DeleteButton onClick={handleUserDelete}>Delete</DeleteButton>}
        {didSave && <h2>Saved</h2>}
      </form>
    </>
  );
}

export default UserScreen;

