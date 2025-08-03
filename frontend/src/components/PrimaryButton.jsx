import "./PrimaryButton.css";

function PrimaryButton({ type, children }) {
  return (
    <button type={type} className="primary-button">
      {children}
    </button>
  );
}

export default PrimaryButton;
