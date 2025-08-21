import "./InputField.css";

function InputField({
                        type, name, placeholder, value, onChange, centerText, disabled, className,
                        error,
                        onBlur
                    }) {
    const inputClass = ["input-field", className, error ? "input-invalid" : ""]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="form-field">
        <input
            type={type ?? undefined}
            name={name ?? undefined}
            placeholder={placeholder ?? undefined}
            value={value ?? undefined}
            disabled={disabled ?? false}
            onChange={onChange ?? undefined}
            onBlur={onBlur ?? undefined}
            style={centerText ? {textAlign: "center"} : {}}
            className="input-field"
        />
    {error ? <div className="field-error">{error}</div> : null}
    </div>
    );
}

export default InputField;
