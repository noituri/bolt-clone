import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import Navbar from "../../../components/Navbar";
import InputField from "../../../components/InputField";
import SelectBox from "../../../components/SelectBox";
import PrimaryButton from "../../../components/PrimaryButton";
import { sendAddUserRequest } from "../../../api/admin";
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

    const [errors, setErrors] = useState({ username: "", password: "", fullName: "", phone: "", global: "" });
    const [saving, setSaving] = useState(false);
    const [didSave, setDidSave] = useState(false);

    const validateAll = () => {
        const next = { username: "", password: "", fullName: "", phone: "", global: "" };

        if (!username || username.trim().length < 3) next.username = "Username, at least 3 characters";
        if (!password || password.length < 6)        next.password = "Password, at least 6 characters.";
        if (!fullName || fullName.trim().length < 3) next.fullName = "Full name, at least 3 characters";

        const phoneErr = validatePhonePL(phone);
        if (phoneErr) next.phone = phoneErr;

        setErrors(next);
        return !next.username && !next.password && !next.fullName && !next.phone;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors((p) => ({ ...p, global: "" }));
        setDidSave(false);

        if (!validateAll()) return;

        try {
            setSaving(true);
            const resp = await sendAddUserRequest(signedUser, username, password, role, fullName, phone);
            setDidSave(true);
            setUsername("");
            setPassword("");
            setFullName("");
            setPhone("");
            setRole(AUTH_ROLE_CLIENT);
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
                        placeholder="Hasło"
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

                <PrimaryButton type="submit" className="small-button" disabled={saving}>
                    {saving ? "Saving..." : "Add user"}
                </PrimaryButton>
            </form>
        </>
    );
}
