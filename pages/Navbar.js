import React from "react";
import style from "../styles/Home.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import * as fcl from "@onflow/fcl";
import "../flow/config";
import { useState, useEffect } from "react";

const Navbar = ({ setIsloggedin, setTransacton }) => {
  const [user, setUser] = useState({ loggedIn: null });

  useEffect(() => {
    fcl.currentUser.subscribe(setUser);
  }, []);

  useEffect(() => {
    if (user.addr !== null) {
      setIsloggedin(true);
    } else {
      setIsloggedin(false);
      setTransacton("");
    }
  }, [user]);

  const AuthedState = () => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            marginRight: "9px",
            color: "white",
            border: "2px solid lightgreen",
            padding: "4px 6px",
            borderRadius: "3px",
          }}
        >
          {user?.addr ?? "No Address"}
        </div>
        <button onClick={fcl.unauthenticate}>Log Out</button>
      </div>
    );
  };
  const UnauthenticatedState = () => {
    return (
      <div>
        <button onClick={fcl.logIn}>Log In</button>
      </div>
    );
  };

  return (
    <div className={style.navbar}>
      <div className={style.hading}>
        <h3 className={style.head}>Duck Dapp</h3>
      </div>
      <div className={style.login}>
        <div>{user.loggedIn ? <AuthedState /> : <UnauthenticatedState />}</div>
      </div>
    </div>
  );
};

export default Navbar;
