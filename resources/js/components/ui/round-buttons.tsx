import '../../../css/button.css';

export default function MyButton({ title }: { title: string }) {
  return (
    <button className="btn-round">{title}</button>
  );
}
