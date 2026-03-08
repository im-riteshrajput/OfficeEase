import { roles } from "../data/data.js";
import { CustomField, CustomSelectCard } from "../components/ui/card";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// let isLogin = false;

function LoginPage() {

  const navigate = useNavigate();

  // Automatically redirect to dashboard if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, []);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Signup fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [altphone, setAltPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [jobRole, setJobRole] = useState("");
  // const [position, setPosition] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dbRole, setDbRole] = useState("Admin");


  // decide whether to call login or signup function on form submit based on isLogin state
  function handleSubmit(e) {
    e.preventDefault();   // FIX

    if (isLogin) {
      handleLogin(e);
    } else {
      handleSignup(e);
    }
  }


  // Signup Function
  const handleSignup = async (e) => {
    e.preventDefault();

    console.log({
      fullName,
      email,
      phone,
      altphone,
      department,
      jobRole,
      password,
      dbRole

    });

    if (!fullName || !email || !phone || !department || !password || !dbRole || !jobRole) {
      console.log("Please fill");

      // toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (password.length < 8) {
      console.log("short password");
      // toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      console.log("passwords do not match");
      // toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {

      await axios.post("http://localhost:5000/api/auth/register", {
        name: fullName,
        email,
        password,
        dbRole: dbRole,
        jobRole: jobRole,
        department,
        phone,
        joinDate: new Date(),
        estatus: "active"
      });

      console.log("Account created");


      // toast({
      //   title: "Account created!",
      //   description: "You can now login."
      // });

    } catch (err) {
      console.log("Account creation failed :", err);

      // toast({
      //   title: "Signup failed",
      //   description: err.response?.data?.message || err.message,
      //   variant: "destructive"
      // });

    } finally {
      setIsLogin(true);
      setLoading(false);
    }
  };

  // Login Function

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log({ email, password });

    if (!email || !password) {
      console.log("Please fill");
      return;
    }

    setLoading(true);
    try {

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);

      console.log("Login successful");

      navigate("/dashboard");

    } catch (err) {

      console.log("Login failed :", err.response?.data || err.message);

    } finally {
      setLoading(false);
    }
  };

  // const handleLogin = async (e) => {

  //   // e.preventDefault();  // FIX - login was not working because of this, as the page was refreshing and the API call was getting cancelled before it could complete. Now with this, the login works fine.
  //   setLoading(true);

  //   console.log({
  //     email,
  //     password
  //   });

  //       if ( !email || !password) {
  //     console.log("Please fill");

  //     // toast({ title: "Please fill all required fields", variant: "destructive" });
  //     return;
  //   }

  //   if (password.length < 6) {
  //     console.log("short password");
  //     // toast({ title: "Password must be at least 6 characters", variant: "destructive" });
  //     return;
  //   }  


  //   try {

  //     const res = await axios.post(
  //       "http://localhost:5000/api/auth/login",
  //       {
  //         email,
  //         password
  //       }
  //     );

  //     // store token
  //     localStorage.setItem("token", res.data.token);

  //     // toast({
  //     //   title: "Login successful"
  //     // });

  //     console.log("Login successful");

  //     // Redirect to dashboard
  //     // navigate("/dashboard");

  //     navigate("/");

  //   } catch (err) {

  //     // toast({
  //     //   title: "Login failed",
  //     //   description: err.response?.data?.message || err.message,
  //     //   variant: "destructive"
  //     // });

  //     console.log("Login failed :", err);

  //   } finally {
  //     setLoading(false);
  //   }

  // };

  return (
    <>
      <div className="login-page w-full h-auto overflow-y-scroll flex bg-gray-100 flex-col items-center gap-4">

        <div className="w-5/10 h-auto my-10 bg-white rounded-lg flex items-center justify-self-center  justify-center">
          <div className="w-4/5 my-10">

            {isLogin ? <h1 className="text-2xl font-bold justify-self-center">Welcome Back!</h1> : <h1 className="text-2xl font-bold justify-self-center">Create Account</h1>}
            {isLogin ? <h1 className="justify-self-center">Sign in to your account</h1> : <h1 className="justify-self-center">Fill in your details and select your role</h1>}
            {isLogin ? null : <CustomField fieldTitle="Name*" fieldType="text" fieldDesc="Enter your full name" onChange={(e) => setFullName(e.target.value)} />}
            <CustomField fieldTitle="Email*" fieldType="email" fieldDesc="Enter your email address" onChange={(e) => setEmail(e.target.value)} />
            {isLogin ? null : <CustomField maxlen={10} fieldTitle="Phone No*" fieldType="tel" fieldDesc="Enter your phone number" onChange={(e) => setPhone(e.target.value)} />}
            {isLogin ? null : <CustomField maxlen={10} fieldTitle="Alternate Phone No" fieldType="tel" fieldDesc="Enter your phone number" onChange={(e) => setAltPhone(e.target.value)} />}
            {isLogin ? null :
              <div className="flex w-full justify-between gap-4 ">
                <CustomField fieldTitle="Department*" fieldType="tel" fieldDesc="e.g. Engineering" onChange={(e) => setDepartment(e.target.value)} />
                <CustomSelectCard fieldTitle="Role*" value={dbRole} mapValue={roles} onChange={(e) => setDbRole(e.target.value)} />
              </div>
            }
            {isLogin ? null : <CustomField fieldTitle="Job Role*" fieldType="tel" fieldDesc="e.g. web developer" onChange={(e) => setJobRole(e.target.value)} />}
            <CustomField fieldTitle="Password*" fieldType="password" fieldDesc="Enter your password" onChange={(e) => setPassword(e.target.value)} />
            {isLogin ? null : <CustomField fieldTitle="Confirm Password*" fieldType="password" fieldDesc="Confirm your password" onChange={(e) => setConfirmPassword(e.target.value)} />}
            {/* {isLogin ? null : */}
            <button type="submit" onClick={handleSubmit} className="w-full h-auto mt-10" disabled={loading}>
              <div className="w-auto h-full bg-black text-white py-3 rounded-md">
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </div>
            </button>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage