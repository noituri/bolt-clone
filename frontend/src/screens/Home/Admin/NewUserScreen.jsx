import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import Navbar from "../../../components/Navbar";
import InputField from "../../../components/InputField";
import SelectBox from "../../../components/SelectBox";
import PrimaryButton from "../../../components/PrimaryButton";
import { createDriver, sendAddUserRequest } from "../../../api/admin";
import { AUTH_ROLE_ADMIN, AUTH_ROLE_CLIENT, AUTH_ROLE_DRIVER } from "../../../api/auth";
import "./UserScreen.css";
import { useNavigate } from "react-router-dom";
import FieldError from "../../../components/FieldError";

function validatePhonePL(value) {
  if (!value || typeof value !== "string") return "Enter phone number";
  const v = value.replace(/[ -]/g, "");
  const e164PL = /^\+48\d{9}$/;
  const nationalPL = /^\d{9}$/;
  if (e164PL.test(v) || nationalPL.test(v)) return null;
  return "Enter the number in the format of 9 digits (e.g. 501234567) or +48XXXXXXXXX.";
}

export default function NewUserScreen() {
  const { user: signedUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(AUTH_ROLE_CLIENT);
  const [carMake, setCarMake] = useState("");
  const [carModel, setCarModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");

  const [errors, setErrors] = useState({ username: "", password: "", fullName: "", phone: "", global: "" });
  const [saving, setSaving] = useState(false);
  const [didSave, setDidSave] = useState(false);

  const validateAll = () => {
    const next = {
      username: "",
      password: "",
      fullName: "",
      phone: "",
      carMake: "",
      carModel: "",
      licensePlate: "",
      global: "",
    };

    if (!username || username.trim().length < 3) next.username = "Username, at least 3 characters";
    if (!password || password.length < 6) next.password = "Password, at least 6 characters.";
    if (!fullName || fullName.trim().length < 3) next.fullName = "Full name, at least 3 characters";
    if (role === AUTH_ROLE_DRIVER) {
      if (!carMake || carMake.trim().length < 3) next.carMake = "Car make, at least 3 characters";
      if (!carModel || carModel.trim().length < 1) next.carModel = "Car model, at least 1 character";
      if (!licensePlate || licensePlate.trim().length < 4) next.licensePlate = "License plate, at least 4 characters";
    }

    const phoneErr = validatePhonePL(phone);
    if (phoneErr) next.phone = phoneErr;

    setErrors(next);
    return Object.values(next).find(err => err != "") == null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors((p) => ({ ...p, global: "" }));
    setDidSave(false);

    if (!validateAll()) return;

    try {
      setSaving(true);
      const resp = await sendAddUserRequest(signedUser, username, password, role, fullName, phone);
      if (role === AUTH_ROLE_DRIVER) {
        await createDriver(
          signedUser,
          resp.user_id,
          carMake,
          carModel,
          licensePlate,
        );
      }
      setDidSave(true);
      navigate("/");
    } catch (err) {
      setErrors((p) => ({ ...p, global: err?.message || "Failed to add user." }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar active="Home" />
      <div className="header-row">
        <h2>New user</h2>
      </div>

      {errors.global && <div className="form-error-global">{errors.global}</div>}
      {didSave && <div className="form-success">User created successfully.</div>}

      <form className="user-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <InputField
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() =>
              setErrors((p) => ({
                ...p,
                username: !username || username.trim().length < 3 ? "Username must be at least 3 characters long." : "",
              }))
            }
            className={errors.username ? "input-invalid" : ""}
          />
          <FieldError>{errors.username}</FieldError>
        </div>

        <div className="form-field">
          <InputField
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() =>
              setErrors((p) => ({
                ...p,
                password: !password || password.length < 6 ? "Password, at least 6 characters" : "",
              }))
            }
            className={errors.password ? "input-invalid" : ""}
          />
          <FieldError>{errors.password}</FieldError>
        </div>

        <div className="form-field">
          <InputField
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() =>
              setErrors((p) => ({
                ...p,
                fullName: !fullName || fullName.trim().length < 3 ? "Full name, at least 3 characters.." : "",
              }))
            }
            className={errors.fullName ? "input-invalid" : ""}
          />
          <FieldError>{errors.fullName}</FieldError>
        </div>

        <div className="form-field">
          <InputField
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setErrors((p) => ({ ...p, phone: validatePhonePL(phone) || "" }))}
            className={errors.phone ? "input-invalid" : ""}
          />
          <FieldError>{errors.phone}</FieldError>
        </div>

        <SelectBox label="Rola:" onChange={setRole} value={role}>
          <option>{AUTH_ROLE_ADMIN}</option>
          <option>{AUTH_ROLE_DRIVER}</option>
          <option>{AUTH_ROLE_CLIENT}</option>
        </SelectBox>

        {role === AUTH_ROLE_DRIVER && (
          <>
            <h2>Driver Information</h2>
            <div className="form-field">
              <InputField
                placeholder="Car Make"
                value={carMake}
                onChange={(e) => setCarMake(e.target.value)}
                onBlur={validateAll}
                className={errors.carMake ? "input-invalid" : ""}
              />
              <FieldError>{errors.carMake}</FieldError>
            </div>
            <div className="form-field">
              <InputField
                placeholder="Car Model"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                onBlur={validateAll}
                className={errors.carModel ? "input-invalid" : ""}
              />
              <FieldError>{errors.carModel}</FieldError>
            </div>
            <div className="form-field">
              <InputField
                placeholder="License Plate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                onBlur={validateAll}
                className={errors.licensePlate ? "input-invalid" : ""}
              />
              <FieldError>{errors.licensePlate}</FieldError>
            </div>
          </>
        )}

        <PrimaryButton type="submit" className="small-button" disabled={saving}>
          {saving ? "Saving..." : "Add user"}
        </PrimaryButton>
      </form>
    </>
  );
}
