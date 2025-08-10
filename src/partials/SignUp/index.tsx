import { useState } from "react";
import { useRouter } from "next/router";
import { NextPage } from "next";
import Layout from "@/containers/Layout";

const SignUpComponent: NextPage = () => {
  const [userData, setUserData] = useState({
    email: "",
    firstname: "",
    lastname: "",
    password: "",

    // ignored
    universityYear: "",
    major: "",
    universityName: "",
    interests: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // API call to sign up the user
    try {
      // const response = await signUp(userData);
      // console.log('SignUp successful', response);
      router.push("/farms"); // Navigate to dashboard or home page after successful sign up
    } catch (error) {
      setError("Failed to sign up. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="flex flex-col w-full max-w-md mx-auto">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <h2 className="text-h2 font-semibold text-center text-dark">Sign Up</h2>
        {["email", "first name", "last name", "password"].map((field) => (
          <div key={field}>
            <label
              htmlFor={field}
              className="block text-body font-medium text-dark capitalize"
            >
              {field.replace(/([A-Z])/g, " $1").trim()}
            </label>
            <input
              type={
                field === "email"
                  ? "email"
                  : field === "password"
                  ? "password"
                  : "text"
              }
              name={field}
              id={field}
              required={field === "email" || field === "name"}
              className="mt-1 block w-full px-3 py-2.5 bg-surface border border-border rounded-md shadow-sm placeholder:text-dark-0-85 focus:outline-none focus:ring-accent focus:border-accent text-body"
              placeholder={`Enter your ${field}`}
              // value={userData[field]}
              onChange={handleChange}
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-body font-medium text-white bg-accent hover:bg-lighter-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </button>
        {error && (
          <p className="mt-2 text-center text-body text-red-600">{error}</p>
        )}
      </form>
      <p className="mt-4 text-center text-h2 text-dark-0-85">
        Already have an account?{" "}
        <a
          href="#"
          onClick={() => router.push("/signin")}
          className="font-medium text-body text-accent hover:text-lighter-green"
        >
          Log in
        </a>
      </p>
      </div>
  );
};

export default SignUpComponent;
