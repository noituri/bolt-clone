import './SelectBox.css';

function SelectBox({ label, children, value, onChange, disabled }) {
  return (
    <div className="select-box">
      <p>{label}</p>
      <select disabled={disabled ?? undefined} onChange={e => onChange(e.target.value)} value={value}>
        {children}
      </select>
    </div>
  );
}

export default SelectBox;
