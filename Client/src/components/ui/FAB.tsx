import './FAB.css';

interface FABProps {
  onClick: () => void;
  label?: string;
}

export function FAB({ onClick, label }: FABProps) {
  return (
    <button className="fab" onClick={onClick} aria-label="Аюул мэдээлэх">
      {label ?? <span className="icon">photo_camera</span>}
    </button>
  );
}
