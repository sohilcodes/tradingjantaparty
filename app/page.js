"use client";

import { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) return 60;
        return value - 1;
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
      const response = await fetch(
        `/api/signal?pair=${encodeURIComponent(pair)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signal error");
      }

      setSignal(data.signal);
      setConfidence(`${data.confidence}%`);
      setPrice(data.price);
      setSeconds(60);

      setHistory((old) => [
        {
          pair,
          signal: data.signal,
          confidence: data.confidence,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })
        },
        ...old
      ].slice(0, 6));
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  const displaySignal = signal === "WAIT" ? "WAIT" : signal;

  return (
    <main className="page">

      <header className="topbar">
        <div className="brand">
          <div className="logo">♛</div>

          <div>
            <h1>
              TRADING <span>JANTA PARTY</span>
            </h1>

            <p>TRADE • LEARN • GROW • TOGETHER</p>
          </div>
        </div>

        <div className="live">
          <i></i>
          LIVE SIGNAL
        </div>
      </header>


      <section className="marketCard">

        <div className="pairBox">
          <small>TRADING PAIR</small>

          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
          >
            {pairs.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <span>OTC / DIGITAL</span>
        </div>

        <div className="expiryBox">
          <small>EXPIRY</small>
          <strong>1 MIN</strong>
        </div>

        <div className="priceBox">
          <small>PRICE</small>
          <strong>{price}</strong>
        </div>

      </section>


      <section className="signalSection">

        <div className="sectionTitle">
          <span>⚡</span>
          NEXT SIGNAL
        </div>

        <div className="signalLayout">

          <div
            className={`signalSticker ${
              signal === "CALL"
                ? "call"
                : signal === "PUT"
                ? "put"
                : "wait"
            }`}
          >
            <div className="arrow">
              {signal === "CALL"
                ? "▲"
                : signal === "PUT"
                ? "▼"
                : "●"}
            </div>

            <strong>{displaySignal}</strong>

            <small>
              {signal === "WAIT"
                ? "Ready to analyze"
                : "High Probability"}
            </small>

            <b>
              {confidence}
            </b>
          </div>


          <div className="timer">

            <div className="timerCircle">
              <strong>
                00:{String(seconds).padStart(2, "0")}
              </strong>

              <small>TIME LEFT</small>
            </div>

          </div>

        </div>

      </section>


      <section className="actionArea">

        <button
          className="signalButton"
          onClick={getSignal}
          disabled={loading}
        >
          <span>⚡</span>

          <div>
            <strong>
              {loading ? "ANALYZING..." : "GET SIGNAL"}
            </strong>

            <small>
              Live Market Analysis
            </small>
          </div>

          <b>›</b>
        </button>

      </section>


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
          <strong>{confidence}</strong>
        </div>

        <div>
          <small>EXPIRY</small>
          <strong>1 MIN</strong>
        </div>

      </section>


      <section className="historyCard">

        <div className="historyHeader">
          <h2>▤ Recent Signals</h2>
          <span>{history.length} signals</span>
        </div>

        {history.length === 0 && (
          <div className="empty">
            No signals yet. Tap GET SIGNAL.
          </div>
        )}

        {history.map((item, index) => (
          <div className="historyRow" key={index}>

            <div>
              <strong>{item.pair}</strong>
              <small>{item.time}</small>
            </div>

            <b
              className={
                item.signal === "CALL"
                  ? "badge callBadge"
                  : "badge putBadge"
              }
            >
              {item.signal}
            </b>

            <span>{item.confidence}%</span>

          </div>
        ))}

      </section>


      <section className="vipCard">

        <div className="vipIcon">♛</div>

        <div>
          <small>TRADING JANTA PARTY</small>
          <strong>JOIN OUR VIP GROUP</strong>
          <p>Exclusive signals • Community • Support</p>
        </div>

        <button>
          JOIN NOW
        </button>

      </section>


      <footer>
        TRADING JANTA PARTY
        <span> • </span>
        Educational Tool
      </footer>


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
