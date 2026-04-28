import axios from "axios";
import { useRef } from "react";
import { signIn } from "next-auth/react";

export default function SignIn() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleClick() {
    const usernamemail = usernameRef.current?.value;

    const password = passwordRef.current?.value;

    if (!usernamemail || !password) {
      alert("Input fields are manadatory");
    }
    try {
      const res = await signIn("credentials", {
        usernamemail,
        password,
        redirect: false,
      });
      if (res?.error) {
        console.error("Login Failed", res.error);
      } else {
        console.log("Loging succesful");
      }
    } catch (error) {
      console.log("Error while contacting api/signin");
      console.log(error);
    }
  }
  return (
    <div>
      <input type="text" placeholder="Username/email" ref={usernameRef}></input>
      <input
        type="password"
        placeholder="Password . . ."
        ref={passwordRef}
      ></input>
      <button onClick={handleClick}>SignIn</button>
    </div>
  );
}
