import "./InputField.css";

function InputField({ type, name, placeholder, value, onChange, disabled }) {
  return (
    <input
      type={type ?? undefined}
      name={name ?? undefined}
      placeholder={placeholder ?? undefined}
      value={value ?? undefined}
      disabled={disabled ?? false}
      onChange={onChange ?? undefined}
      className="input-field"
    />
  );
}

export default InputField;
