import { useState } from "react";
import { useRouter } from "next/router";
import type { FC } from "react";
import { useAppContext } from "@/context/AppContext";

const SignInComponent: FC = () => {
  const [signInData, setSignInData] = useState({
    email: "loganathansathyajit@gmail.com",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { setUserId, setUserEmail } = useAppContext();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignInData({ ...signInData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Dummy workflow - store email and redirect
      setUserEmail(signInData.email);
      setUserId('dummy-user-id');
      
      router.push("/setup/upload");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to log in. Please try again.");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-md space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <h2 className="text-h3 font-semibold text-center text-dark">Log In</h2>
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-body font-medium text-dark"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="mt-1 block w-full px-3 py-2.5 bg-surface border border-border rounded-md shadow-sm placeholder:text-dark-0-85 focus:outline-none focus:ring-accent focus:border-accent text-body"
                placeholder="Enter your email"
                required
                value={signInData.email}
                onChange={handleChange}
              />
            </div>
            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-body font-medium text-dark"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="mt-1 block w-full px-3 py-2.5 bg-surface border border-border rounded-md shadow-sm placeholder:text-dark-0-85 focus:outline-none focus:ring-accent focus:border-accent text-body"
                placeholder="Enter your password"
                required
                value={signInData.password}
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-body font-medium text-white bg-accent hover:bg-lighter-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging In..." : "Log In"}
            </button>
            {error && (
              <p className="mt-2 text-center text-body text-accent">{error}</p>
            )}
          </form>
          <p className="mt-4 text-center text-body text-dark-0-85">
            Don't have an account?{" "}
            <a
              href="#"
              onClick={() => router.push("/signup")}
              className="font-medium text-body text-accent hover:text-lighter-green"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInComponent;
