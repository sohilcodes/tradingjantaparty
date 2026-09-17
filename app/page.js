"use client";

import { useEffect, useState } from "react";

const API_URL =
  "https://trading-janta-party-api.onrender.com";

const pairs = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "AUD/USD",
  "USD/CAD",
  "EUR/GBP"
];

export default function Home() {
  const [pair, setPair] = useState("EUR/USD");
  const [signal, setSignal] = useState("WAIT");
  const [confidence, setConfidence] = useState("--");
  const [price, setPrice] = useState("--");
  const [rsi, setRsi] = useState("--");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((old) => {
        if (old <= 1) return 60;
        return old - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  async function getSignal() {
    if (loading) return;

    setLoading(true);
    setSignal("WAIT");
    setConfidence("--");

    try {
      const url =
        `${API_URL}/api/signal?pair=${encodeURIComponent(pair)}`;

      const response = await fetch(url, {
        method: "GET",
        cache: "no-store"
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to generate signal"
        );
      }

      setSignal(data.signal);
      setConfidence(data.confidence);
      setPrice(data.price);
      setRsi(data.indicators?.rsi ?? "--");
      setSeconds(60);

      const newSignal = {
        pair: data.pair,
        signal: data.signal,
        confidence: data.confidence,
        price: data.price,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      setHistory((old) =>
        [newSignal, ...old].slice(0, 8)
      );

    } catch (error) {
      console.error(error);

      alert(
        error.message ||
        "Backend connection failed"
      );
    } finally {
      setLoading(false);
    }
  }

  const signalClass =
    signal === "CALL"
      ? "call"
      : signal === "PUT"
      ? "put"
      : "wait";

  return (
    <main className="page">

      {/* HEADER */}

      <header className="topbar">

        <div className="brand">

          <div className="logo">
            ♛
          </div>

          <div>
            <h1>
              TRADING <span>JANTA PARTY</span>
            </h1>

            <p>
              TRADE • LEARN • GROW • TOGETHER
            </p>
          </div>

        </div>

        <div className="live">
          <i />
          LIVE SIGNAL
        </div>

      </header>


      {/* MARKET */}

      <section className="marketCard">

        <div className="marketItem">

          <small>TRADING PAIR</small>

          <select
            value={pair}
            onChange={(e) => {
              setPair(e.target.value);
              setSignal("WAIT");
              setPrice("--");
              setConfidence("--");
            }}
          >
            {pairs.map((item) => (
              <option
                value={item}
                key={item}
              >
                {item}
              </option>
            ))}
          </select>

          <span>
            LIVE MARKET DATA
          </span>

        </div>


        <div className="marketItem">

          <small>EXPIRY</small>

          <strong>
            1 MIN
          </strong>

          <span>
            Binary
          </span>

        </div>


        <div className="marketItem">

          <small>CURRENT PRICE</small>

          <strong>
            {price}
          </strong>

          <span>
            Twelve Data
          </span>

        </div>

      </section>


      {/* SIGNAL */}

      <section className="signalSection">

        <div className="sectionTitle">
          <span>⚡</span>
          NEXT SIGNAL
        </div>


        <div className="signalLayout">

          <div
            className={`signalSticker ${signalClass}`}
          >

            <div className="signalArrow">
              {signal === "CALL"
                ? "▲"
                : signal === "PUT"
                ? "▼"
                : "●"}
            </div>

            <strong>
              {signal}
            </strong>

            <small>
              {signal === "WAIT"
                ? "Ready to analyze"
                : "Technical Signal"}
            </small>

            <b>
              {confidence === "--"
                ? "--"
                : `${confidence}%`}
            </b>

          </div>


          <div className="timer">

            <div className="timerCircle">

              <strong>
                00:
                {String(seconds).padStart(2, "0")}
              </strong>

              <small>
                TIME LEFT
              </small>

            </div>

          </div>

        </div>

      </section>


      {/* GET SIGNAL */}

      <section className="actionArea">

        <button
          className="signalButton"
          onClick={getSignal}
          disabled={loading}
        >

          <div className="signalIcon">
            ⚡
          </div>

          <div className="buttonText">

            <strong>
              {loading
                ? "ANALYZING MARKET..."
                : "GET SIGNAL"}
            </strong>

            <small>
              EMA + RSI Technical Analysis
            </small>

          </div>

          <div className="buttonArrow">
            →
          </div>

        </button>

      </section>


      {/* STATS */}

      <section className="stats">

        <div>
          <small>MARKET</small>
          <strong>{pair}</strong>
        </div>

        <div>
          <small>SIGNAL</small>

          <strong
            className={
              signal === "CALL"
                ? "green"
                : signal === "PUT"
                ? "red"
                : ""
            }
          >
            {signal}
          </strong>
        </div>

        <div>
          <small>CONFIDENCE</small>
          <strong>
            {confidence === "--"
              ? "--"
              : `${confidence}%`}
          </strong>
        </div>

        <div>
          <small>RSI</small>
          <strong>
            {rsi}
          </strong>
        </div>

      </section>


      {/* HISTORY */}

      <section className="historyCard">

        <div className="historyHeader">

          <h2>
            ▤ Recent Signals
          </h2>

          <span>
            {history.length} signals
          </span>

        </div>


        {history.length === 0 ? (

          <div className="empty">
            Generate your first signal
          </div>

        ) : (

          history.map((item, index) => (

            <div
              className="historyRow"
              key={`${item.time}-${index}`}
            >

              <div className="historyPair">

                <strong>
                  {item.pair}
                </strong>

                <small>
                  {item.time}
                </small>

              </div>


              <div
                className={
                  item.signal === "CALL"
                    ? "badge callBadge"
                    : item.signal === "PUT"
                    ? "badge putBadge"
                    : "badge waitBadge"
                }
              >
                {item.signal}
              </div>


              <div className="historyConfidence">
                {item.confidence}%
              </div>

            </div>

          ))

        )}

      </section>


      {/* VIP */}

      <section className="vipCard">

        <div className="vipLogo">
          ♛
        </div>

        <div className="vipText">

          <small>
            TRADING JANTA PARTY
          </small>

          <strong>
            JOIN OUR VIP GROUP
          </strong>

          <p>
            Signals • Community • Support
          </p>

        </div>

        <a
          href="https://t.me/"
          target="_blank"
          rel="noreferrer"
          className="joinButton"
        >
          JOIN NOW
        </a>

      </section>


      <footer>
        TRADING JANTA PARTY
        <span> • </span>
        Educational Technical Analysis Tool
      </footer>


      {/* BOTTOM NAV */}

      <nav className="bottomNav">

        <div className="active">
          <b>⌂</b>
          <small>Home</small>
        </div>

        <div>
          <b>ϟ</b>
          <small>Signals</small>
        </div>

        <div>
          <b>◷</b>
          <small>History</small>
        </div>

        <div>
          <b>⚙</b>
          <small>Settings</small>
        </div>

      </nav>

    </main>
  );
}
