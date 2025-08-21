export default function FieldError({ children }) {
    if (!children) return null;
    return <div className="field-error">{children}</div>;
}
