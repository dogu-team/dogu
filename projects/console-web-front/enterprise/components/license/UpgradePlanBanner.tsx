interface Props {
  title: React.ReactNode;
}

const UpgradePlanBanner: React.FC<Props> = ({ title }) => {
  return (
    <div>
      <div>
        <p>{title}</p>
      </div>
      <div>
        <button>Visit...</button>
      </div>
    </div>
  );
};

export default UpgradePlanBanner;
