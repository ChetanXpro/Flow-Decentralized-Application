import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import Head from "next/head";
import { useEffect } from "react";
import { useState } from "react";
import Navbar from "./Navbar";

import styles from "../styles/Home.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const [greeting, setGreeting] = useState("");
  const [newGreeting, setNewGreeting] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [txStatus, setTxStatus] = useState("Run Transaction");
  const [transacton, setTransacton] = useState("");
  const [showTransactonid, setShowTransactonid] = useState(false);

  const [loggedIn, setIsloggedin] = useState(false);
  const [transactionTime, setTransactionTime] = useState(0);
  const [showTimeTaken, setShowTimeTaken] = useState(false);
  const [login, setlogiin] = useState(false);

  const time = () => {};

  let starttime;
  let endtime;
  const showToastWarning = (text, id) => {
    toast.warn(text, {
      toastId: id,
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };
  const showToastSuccess = (text, id) => {
    toast.success(text, {
      toastId: id,
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  async function executeScript() {
    const response = await fcl.query({
      cadence: `
    import HelloWorld from 0x3a822511e225831b

    pub fun main(): String {
        return HelloWorld.greeting
    }
    `,
      args: (arg, t) => [],
    });

    setGreeting(response);
  }

  const runTransaction = async () => {
    const transactionId = await fcl.mutate({
      cadence: `
      import HelloWorld from 0x3a822511e225831b
      
      transaction(myNewGreeting: String) {

  prepare(signer: AuthAccount) {}

  execute {
    HelloWorld.changeGreeting(newGreeting: myNewGreeting)
  }
}

      `,
      args: (arg, t) => [arg(newGreeting, t.String)],
      proposer: fcl.authz,
      payer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999,
    });

    const t = new Date().getTime();
    starttime = new Date(t).getSeconds();

    setTransacton(transactionId);
    fcl.tx(transactionId).onceSealed();
    executeScript();

    setNewGreeting("");
    setIsLoading(true);

    let intervalId;

    fcl.tx(transactionId).subscribe((res) => {
      if (res.status === 0 || res.status === 1) {
        setTxStatus("Pending...");
        intervalId = setInterval(time, 1000);
      } else if (res.status === 2) {
        setTxStatus("Finalized...");
      } else if (res.status === 3) {
        setTxStatus("Executed...");
      } else if (res.status === 4) {
        clearInterval(intervalId);
        setTxStatus("Sealed!");

        const t = new Date().getTime();
        endtime = new Date(t).getSeconds();

        if (endtime > starttime) {
          setTransactionTime(endtime - starttime);
        } else {
          let calc = starttime - endtime - 60;

          if (calc < 0) {
            calc * -1;
          }

          setTransactionTime(calc);
        }
        setShowTimeTaken(true);

        showToastSuccess(`Transaction sealed`, "success1");
        setIsLoading(false);
        executeScript();

        setTimeout(() => setTxStatus("Run Transaction"), 4000);
        setTimeout(() => {
          setShowTimeTaken(false);
          setTransactionTime(0);
        }, 10000);
      }
    });
  };

  const Show = () => {
    if (showTransactonid && transacton) {
      return (
        <div
          style={{
            marginRight: "9px",
            color: "white",
            border: "2px solid lightgreen",
            padding: "4px 6px",
            borderRadius: "3px",
            marginTop: "7px",
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
          }}
        >
          <div>
            <strong> ID </strong>: {transacton}
          </div>
          <br />
          <button>
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://testnet.flowscan.org/transaction/${transacton}`}
            >
              Click here for more transaction details
            </a>
          </button>
        </div>
      );
    } else {
      showToastWarning("No transaction history", "warn2");
    }
  };

  const Control = () => {
    if (loggedIn) {
      return <Show />;
    } else {
      showToastWarning("Please login first", "warn1");
    }
  };

  const HandleControl = () => {
    if (showTransactonid) {
      return <Control />;
    } else {
      return "";
    }
  };

  useEffect(() => {
    executeScript();
  }, []);
  useEffect(() => {
    executeScript();
  }, [greeting]);

  const handleButtonClick = () => {
    if (showTransactonid) {
      setShowTransactonid(false);
    } else {
      setShowTransactonid(true);
    }
  };

  return (
    <div className={styles.container}>
      <Navbar setIsloggedin={setIsloggedin} setTransacton={setTransacton} />
      <Head>
        <title>Duck DApp</title>
        <meta name="description" content="Created by Emerald Academy" />
        <link rel="icon" href="https://i.imgur.com/hvNtbgD.png" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to my{" "}
          <a href="#" target="_blank">
            Duck DApp!
          </a>
        </h1>
      </main>
      <main
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            padding: "100px 200px",
            color: "white",
            border: "2px solid #35e9c6",
            backgroundColor: "#176f6c",
          }}
        >
          {greeting}
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "2px",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <input
            style={{ marginBottom: "8px", padding: "5px 10px" }}
            placeholder="Change..."
            value={newGreeting}
            onChange={(e) => setNewGreeting(e.target.value)}
            type="text"
          />

          {showTimeTaken && (
            <span>
              Your transaction took{" "}
              {transactionTime == 0
                ? ""
                : transactionTime > 0
                ? transactionTime
                : transactionTime < 0
                ? transactionTime * -1
                : ""}{" "}
              Seconds
            </span>
          )}
          <div
            style={{ display: "flex", marginTop: "1rem", marginBottom: "1rem" }}
          >
            <button
              style={{
                width: "150px",
                padding: "9px 12px",
                // fontWeight: "bold",
                fontSize: "15px",
                border: "none",
                backgroundColor: "rgb(163, 15, 52)",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
                marginRight: "3rem",
              }}
              onClick={runTransaction}
            >
              {txStatus}
            </button>

            <button
              className={styles.button}
              style={{
                width: "180px",
                padding: "9px 12px",
                // fontWeight: "bold",
                fontSize: "15px",
                border: "none",
                backgroundColor: "rgb(163, 15, 52)",
                borderRadius: "4px",
                color: "white",
                cursor: "pointer",
                marginLeft: "3rem",
              }}
              onClick={handleButtonClick}
            >
              {showTransactonid ? "Hide TransactionId" : "Show TransactionId"}
            </button>
          </div>
          <HandleControl />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
