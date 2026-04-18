import axios from "axios";
import { useRef } from "react";

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
      const res = await axios.post("api/signin", {
        usernamemail,
        password,
      });
      console.log(res.data);
    } catch (error) {
      console.log("Error while contacting api/signin");
      console.log(error);
    }
    const res = await axios.post("api/signin", {
      usernamemail,
      password,
    });
    console.log(res.data);
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
