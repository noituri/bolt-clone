import {useEffect} from "react";
import {useAuth} from "../../hooks/useAuth";
import {useState} from "react";
import {
    sendGetProfileRequest,
    sendUpdateProfileRequest,
} from "../../api/user";
import Navbar from "../../components/Navbar";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import {dateFormatter} from "../../utils";
import "./Profile.css";
import {useNavigate} from "react-router-dom";
import {sendChangePasswordRequest} from "../../api/auth";
import FieldError from "../../components/FieldError";


function validatePhonePL(value) {
    if (!value || typeof value !== "string") return "Enter phone number";
    const v = value.replace(/[ -]/g, "");
    const e164PL = /^\+48\d{9}$/;
    const nationalPL = /^\d{9}$/;
    if (e164PL.test(v) || nationalPL.test(v)) return null;
    return "Enter the number in the format of 9 digits (e.g. 501234567) or +48XXXXXXXXX";
}

function Profile() {
    const {user} = useAuth();

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

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwdMsg, setPwdMsg] = useState("");
    const [pwdLoading, setPwdLoading] = useState(false);

    const [errors, setErrors] = useState({fullName: "", phone: "", global: ""});
    const [saving, setSaving] = useState(false);

    const validateAll = () => {
        const next = { fullName: "", phone: "", global: "" };
        if (!fullName || fullName.trim().length < 3) {
            next.fullName = "Full name must be at least 3 characters long";
        }
        const phoneErr = validatePhonePL(phone);
        if (phoneErr) next.phone = phoneErr;

        setErrors(next);
        return !next.fullName && !next.phone;
    };

    useEffect(() => {
        document.title = "Profile";
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
            navigate("/", {replace: true});
        } else {
            const updatedProfile = await sendGetProfileRequest(user);
            syncProfileWithState(updatedProfile);
            setDidSave(true);
        }
    };

    if (!profile) {
        return <h1>Loading</h1>;
    }

    return (
        <>
            {!isProfileCreator && <Navbar active="Profile"/>}
            <h2>{isProfileCreator ? "Create profile" : "Profile"}</h2>
            <form
                className="profile-form"
                onSubmit={async (e) => {
                    e.preventDefault();
                    await handleProfileUpdate();

                    if (!validateAll()) return;

                    try {
                        setSaving(true);
                        await sendUpdateProfileRequest(user, { full_name: fullName, phone });

                        if (isProfileCreator) {
                            navigate("/", { replace: true });
                        } else {
                            const updatedProfile = await sendGetProfileRequest(user);
                            syncProfileWithState(updatedProfile);
                            setDidSave(true);
                        }
                    } catch (err) {
                        setErrors((p) => ({
                            ...p,
                            global: err?.message || "Failed to save changes.",
                        }));
                    } finally {
                        setSaving(false);
                    }
                }}
            >
                {errors.global && <div className="form-error-global">{errors.global}</div>}

                <div className="form-field">
                    <InputField
                        placeholder="Username"
                        name="username"
                        value={profile.username}
                        disabled
                    />
                </div>

                <div className="form-field">
                    <InputField
                        placeholder="Full name"
                        name="full-name"
                        value={fullName ?? ""}
                        onChange={(e) => setFullName(e.target.value)}
                        className={errors.fullName ? "input-invalid" : ""}
                        onBlur={() =>
                            setErrors((p) => ({
                                ...p,
                                fullName:
                                    !fullName || fullName.trim().length < 3
                                        ? "Full name must be at least 3 characters long"
                                        : "",
                            }))
                        }
                    />
                    <FieldError>{errors.fullName}</FieldError>
                </div>

                <div className="form-field">
                    <InputField
                        type="tel"
                        placeholder="Phone"
                        name="phone"
                        value={phone ?? ""}
                        onChange={(e) => setPhone(e.target.value)}
                        className={errors.phone ? "input-invalid" : ""}
                        onBlur={() =>
                            setErrors((p) => ({ ...p, phone: validatePhonePL(phone) || "" }))
                        }
                    />
                    <FieldError>{errors.phone}</FieldError>
                </div>

                {!isProfileCreator && (
                    <p>Account created at {dateFormatter.format(new Date(profile.created_at))}</p>
                )}

                <PrimaryButton type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                </PrimaryButton>
                {didSave && <h2 className="form-success">Saved</h2>}
            </form>


            <hr className="profile-divider"/>

            <h3>Change password</h3>
            <form
                className="profile-form"
                onSubmit={async (e) => {
                    e.preventDefault();
                    setPwdMsg("");
                    if (!oldPassword || !newPassword) {
                        setPwdMsg("Fill in both password fields.");
                        return;
                    }
                    if (newPassword !== confirmPassword) {
                        setPwdMsg("New password and confirmation do not match.");
                        return;
                    }
                    try {
                        setPwdLoading(true);
                        const resp = await sendChangePasswordRequest(user, oldPassword, newPassword);
                        setPwdMsg(resp?.message || "Password changed.");
                        setOldPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                    } catch (err) {
                        setPwdMsg("Failed to change password.");
                    } finally {
                        setPwdLoading(false);
                    }
                }}
            >
                <InputField
                    type="password"
                    placeholder="Old password"
                    name="old-password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />
                <InputField
                    type="password"
                    placeholder="New password"
                    name="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <InputField
                    type="password"
                    placeholder="Confirm new password"
                    name="confirm-new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <PrimaryButton type="submit" disabled={pwdLoading}>
                    {pwdLoading ? "Changing..." : "Change password"}
                </PrimaryButton>
                {pwdMsg && <p>{pwdMsg}</p>}
            </form>
        </>
    );
}

export default Profile;
