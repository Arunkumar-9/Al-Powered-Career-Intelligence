import "./Common.css";

function Loader({ label = "Loading..." }) {
  return (
    <div className="ui-loader">
      <div className="ui-spinner" />
      <span>{label}</span>
    </div>
  );
}

export default Loader;
