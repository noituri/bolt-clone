import "./InputField.css";

function InputField({ type, name, placeholder }) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      className="input-field"
    />
  );
}

export default InputField;
