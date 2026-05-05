const ProgressBar = ({ current, total }) => {
  const percent = (current / total) * 100;

  return (
    <div className="w-full bg-gray-800 h-2 rounded mt-2">
      <div
        className="bg-green-500 h-2 rounded"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

export default ProgressBar;