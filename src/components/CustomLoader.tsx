import { RotateLoader } from "react-spinners";

export default function CustomLoader() {
  return (
    <div
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      className="fixed top-0 left-0 z-50 h-[100vh] w-[100vw] flex justify-center items-center"
    >
      <RotateLoader color="white" speedMultiplier={0.8} />
    </div>
  );
}
