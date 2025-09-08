import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../api/useFetch";
import { loginUser } from "../api/post";
import { SyncLoader } from "react-spinners";
import toast from "react-hot-toast";
import reactLogo from "../assets/react.svg";
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const { loading, error, data, refetch } = useFetch(async () => {
    return await loginUser({ username: username, password: password });
  }, false);

  // Handle successful login
  useEffect(() => {
    if (!data) {
      return;
    }

    if (data?.data?.sessionId) {
      sessionStorage.setItem("sessionId", data.data.sessionId);
      toast.success("Успешный вход");
      nav("/home");
    }
  }, [data, nav]);

  // Handle errors
  useEffect(() => {
    if (!loading && data?.status === "error" && data.error) {
      toast.error(data.error.message || "Произошла ошибка при входе");
    }
  }, [loading, error]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    await refetch();

    // Removed useEffect from here - it's now at the component level
  }

  return (
    <form
      onSubmit={handleLogin}
      className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8"
    >
      <div className="w-full items-center flex justify-center">
        <img
          src={reactLogo}
          className="h-[12rem] p-[1.5rem] will-change-contents "
          alt="react logo"
        />
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm space-y-6">
        <div>
          <input
            id="text"
            name="text"
            type="text"
            placeholder="Логин"
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 
                     -outline-offset-1 outline-gray-300 placeholder:text-gray-400 
                     focus:outline-2 focus:-outline-offset-1 focus:outline-red-400 sm:text-sm/6"
          />
        </div>

        <div>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Пароль"
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 
                     -outline-offset-1 outline-gray-300 placeholder:text-gray-400 
                     focus:outline-2 focus:-outline-offset-1 focus:outline-red-400 sm:text-sm/6"
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="flex w-full h-10 justify-center items-center rounded-md bg-red-600 px-3 py-1.5 text-sm/6 font-semibold 
                   text-white shadow-sm cursor-pointer"
        >
          {loading ? (
            <SyncLoader size={8} speedMultiplier={0.7} color="#ffffff" />
          ) : (
            "Войти"
          )}
        </button>
      </div>
    </form>
  );
}
