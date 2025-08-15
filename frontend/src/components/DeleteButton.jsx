import "./DeleteButton.css";

function DeleteButton({ type, children, onClick }) {
  const handleOnClick = () => {
    if (confirm("Are you sure you want to delete this?")) {
      onClick();
    }
  };
  return (
    <button type={type} onClick={handleOnClick} className="primary-button delete-button">
      {children}
    </button>
  );
}

export default DeleteButton;
