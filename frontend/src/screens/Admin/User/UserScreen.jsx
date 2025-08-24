import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { dateFormatter } from "../../../utils";
import {
  sendDeleteUserRequest,
  sendGetUserRequest,
  sendUpdateUserRequest,
  sendAdminChangePasswordRequest,
} from "../../../api/admin";
import Navbar from "../../../components/Navbar";
import InputField from "../../../components/InputField";
import SelectBox from "../../../components/SelectBox";
import PrimaryButton from "../../../components/PrimaryButton";
import DeleteButton from "../../../components/DeleteButton";
import "./UserScreen.css";
import { AUTH_ROLE_ADMIN, AUTH_ROLE_CLIENT, AUTH_ROLE_DRIVER } from "../../../api/auth";
import { useNavigate, useParams } from "react-router-dom";

function validatePhonePL(value) {
  if (!value || typeof value !== "string") return "Enter phone number";
  const v = value.replace(/[ -]/g, "");
  const e164PL = /^\+48\d{9}$/;
  const nationalPL = /^\d{9}$/;
  if (e164PL.test(v) || nationalPL.test(v)) return null;
  return "Enter the number in the format of 9 digits (e.g. 501234567) or +48XXXXXXXXX.";
}

function UserScreen() {
  const { id } = useParams();
  const { user: signedUser } = useAuth();
  const navigate = useNavigate();

  const [didSave, setDidSave] = useState(false);

  const [user, setUser] = useState();
  const [isActive, setIsActive] = useState();
  const [fullName, setFullName] = useState();
  const [phone, setPhone] = useState();
  const [role, setRole] = useState();

  const [formError, setFormError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [showPwdModal, setShowPwdModal] = useState(false);

  useEffect(() => {
    document.title = "User";
    sendGetUserRequest(signedUser, id)
        .then(setUser)
        .catch((e) => {
          setFormError(e?.error || "Failed to load user.");
        });
  }, [signedUser, id]);

  useEffect(() => {
    if (!user) return;
    setIsActive(user.is_active);
    setFullName(user.full_name);
    setPhone(user.phone);
    setRole(user.role);
  }, [user]);

  useEffect(() => {
    const timeout = setTimeout(() => setDidSave(false), 2000);
    return () => clearTimeout(timeout);
  }, [didSave]);

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    setFormError("");

    const err = validatePhonePL(phone);
    if (err) {
      setPhoneError(err);
      return;
    }
    setPhoneError("");

    try {
      await sendUpdateUserRequest(signedUser, id, isActive, fullName, phone, role);
      await sendGetUserRequest(signedUser, id).then(setUser);
      setDidSave(true);
    } catch (err) {
      setFormError(err?.error || "Failed to save changes.");
    }
  };

  const handleUserDelete = async () => {
    try {
      await sendDeleteUserRequest(signedUser, id);
      navigate("/", { replace: true });
    } catch (err) {
      setFormError(err?.error || "Failed to delete user.");
    }
  };

  if (!user) {
    return (
        <>
          <Navbar active="Home" />
          <h2 style={{ textAlign: "center" }}>Loading...</h2>
        </>
    );
  }

  return (
      <>
        <Navbar active="Home" />

        <h2>User</h2>

        <form className="user-form" onSubmit={handleUserUpdate}>
          <InputField placeholder="Username" name="username" value={user.username} disabled />
          <InputField
              placeholder="Full name"
              name="full-name"
              value={fullName || ""}
              onChange={(e) => setFullName(e.target.value)}
          />
          <InputField
              type="tel"
              placeholder="Phone"
              name="phone"
              value={phone || ""}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setPhoneError(validatePhonePL(phone) || "")}
              className={phoneError ? "input-invalid" : ""}
          />
          {phoneError && <p className="form-error">{phoneError}</p>}

          <SelectBox
              label="Role:"
              disabled={signedUser.profile.id == id}
              onChange={setRole}
              value={role}
          >
            <option>{AUTH_ROLE_ADMIN}</option>
            <option>{AUTH_ROLE_DRIVER}</option>
            <option>{AUTH_ROLE_CLIENT}</option>
          </SelectBox>

          <SelectBox
              label="Is Active:"
              disabled={signedUser.profile.id == id}
              onChange={(v) => setIsActive(v === "yes")}
              value={isActive ? "yes" : "no"}
          >
            <option>yes</option>
            <option>no</option>
          </SelectBox>

          <p>Account created at {dateFormatter.format(new Date(user.created_at))}</p>

          {formError && <p className="form-error">{formError}</p>}

          <PrimaryButton type="submit">Save</PrimaryButton>
          {signedUser.profile.id != id && (
              <DeleteButton onClick={handleUserDelete}>Delete</DeleteButton>
          )}
          {didSave && <h2>Saved</h2>}
        </form>

        <hr className="user-divider" />

        <div className="user-form" style={{ marginTop: 8 }}>
          <PrimaryButton type="button" onClick={() => setShowPwdModal(true)}>
            Change password
          </PrimaryButton>
        </div>

        <PasswordModal
            open={showPwdModal}
            onClose={() => setShowPwdModal(false)}
            userId={id}
            signedUser={signedUser}
        />
      </>
  );
}

function PasswordModal({ open, onClose, userId, signedUser }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }
    if (confirm !== newPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      setLoading(true);
      const resp = await sendAdminChangePasswordRequest(signedUser, userId, newPassword);
      setSuccess(resp?.message || "Password changed successfully.");
      setNewPassword("");
      setConfirm("");
      setTimeout(onClose, 900);
    } catch (err) {
      setError(err?.error || err?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="modal-backdrop" onMouseDown={onClose}>
        <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Change user password</h3>
            <button className="modal-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>

          <form className="modal-body" onSubmit={handleSubmit}>
            <label className="form-label" htmlFor="pwd-new">
              New password
            </label>
            <InputField
                id="pwd-new"
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="form-hint">
              Minimum 6 characters. Use letters, numbers and a special symbol if possible.
            </p>

            <label className="form-label" htmlFor="pwd-confirm" style={{ marginTop: 10 }}>
              Confirm new password
            </label>
            <InputField
                id="pwd-confirm"
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
            />

            {error && (
                <p className="form-error" role="alert" aria-live="assertive">
                  {error}
                </p>
            )}
            {success && (
                <p className="form-success" role="status" aria-live="polite">
                  {success}
                </p>
            )}

            <PrimaryButton type="submit" disabled={loading}>
              {loading ? "Changing..." : "Change password"}
            </PrimaryButton>
          </form>
        </div>
      </div>
  );
}

export default UserScreen;
