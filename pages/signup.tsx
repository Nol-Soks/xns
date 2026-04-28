import axios from "axios";
import { useRef } from "react";

export default function SignIn() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleClick() {
    const username = usernameRef.current?.value;
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!email || !username || !password) {
      alert("Input fields are manadatory");
    }

    try {
      const res = await axios.post("api/signup", {
        username,
        email,
        password,
      });
      console.log(res.data);
    } catch (error) {
      console.log("Error while contacting api/signin");
      console.log(error);
    }
  }
  return (
    <div>
      <input type="text" placeholder="Username . . ." ref={usernameRef}></input>
      <input type="email" placeholder="mail . . ." ref={emailRef}></input>
      <input
        type="password"
        placeholder="Password . . ."
        ref={passwordRef}
      ></input>
      <button onClick={handleClick}>SignUp</button>
    </div>
  );
}
