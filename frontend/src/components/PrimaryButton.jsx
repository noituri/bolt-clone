import "./PrimaryButton.css";

function PrimaryButton({ type, children, onClick }) {
  return (
    <button type={type} onClick={onClick} className="primary-button">
      {children}
    </button>
  );
}

export default PrimaryButton;
