import React, { useRef, useEffect, useState, Suspense } from "react";
import styles from "./styles/Home.module.css";

import { Header, Hero, Footer } from "./components";

const HtmlConverter = React.lazy(() => import("./components/HtmlConverter"));
const MermaidConverter = React.lazy(() => import("./components/MermaidConverter"));
const LatexConverter = React.lazy(() => import("./components/LatexConverter"));

export default function App() {
  const outputRef = useRef(null);
  const inputRef = useRef(null);
  const htmlConverterRef = useRef(null);
  const mermaidConverterRef = useRef(null);
  const latexConverterRef = useRef(null);
  const [mode, setMode] = useState("html");

  // Update document title based on mode
  useEffect(() => {
    const titles = {
      html: "HTML to PNG Converter",
      mermaid: "Mermaid to PNG Converter",
      latex: "LaTeX to PNG Converter",
    };
    document.title = titles[mode] || "Render Flow";
  }, [mode]);

  const onReset = () => {
    inputRef.current?.resetHtml();
    inputRef.current?.resetMermaid();
    inputRef.current?.resetLatex();
    htmlConverterRef.current?.handleReset();
    mermaidConverterRef.current?.handleReset();
    latexConverterRef.current?.handleReset();
    inputRef.current?.scrollToInput();
  };

  return (
    <div className={styles.page}>
      {/* ── HEADER ─────────────────────────────────── */}
      <Header />

      {/* ── HERO ───────────────────────────────────── */}
      <Hero />

      {/* ── MAIN ───────────────────────────────────── */}
      <main className={styles.main}>
        <section className={styles.container}>
          <Suspense fallback={<div>Loading...</div>}>
            {mode === "html" ? (
              <HtmlConverter
                ref={htmlConverterRef}
                inputRef={inputRef}
                outputRef={outputRef}
                mode={mode}
                setMode={setMode}
                onReset={onReset}
              />
            ) : mode === "mermaid" ? (
              <MermaidConverter
                ref={mermaidConverterRef}
                inputRef={inputRef}
                outputRef={outputRef}
                mode={mode}
                setMode={setMode}
                onReset={onReset}
              />
            ) : (
              <LatexConverter
                ref={latexConverterRef}
                inputRef={inputRef}
                outputRef={outputRef}
                mode={mode}
                setMode={setMode}
                onReset={onReset}
              />
            )}
          </Suspense>
        </section>
      </main>

      {/* ── FOOTER ─────────────────────────────────── */}
      <Footer />
    </div>
  );
}
