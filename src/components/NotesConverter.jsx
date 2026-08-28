import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { InputCard, ErrorCard } from "./";
import { A4Page } from "./A4Page";
import { useNotesToPngConversion } from "../hooks/useNotesToPngConversion";
import styles from "../styles/Home.module.css";

const NotesConverter = forwardRef(function NotesConverter(
  { inputRef, outputRef, mode, setMode, onReset },
  ref
) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const {
    loading: notesLoading,
    result: notesResult,
    error: notesError,
    validationError: notesValidationError,
    validationSuccess: notesValidationSuccess,
    setError: setNotesError,
    validateJson: validateNotesJson,
    handleGenerate: handleNotesGenerate,
    handleReset: handleNotesReset,
  } = useNotesToPngConversion({
    outputRef,
  });

  // Reset page index when notesResult changes
  useEffect(() => {
    setCurrentPageIndex(0);
  }, [notesResult]);

  useImperativeHandle(ref, () => ({
    handleReset: () => {
      setCurrentPageIndex(0);
      handleNotesReset();
    },
  }));

  const pages = notesResult?.pages || [];
  const totalPages = pages.length;
  const activePage = pages[currentPageIndex] || null;

  const pageData = activePage ? {
    chapter: notesResult.chapter,
    items: activePage.items,
    isOverflow: activePage.isOverflow
  } : null;

  return (
    <>
      <InputCard
        ref={inputRef}
        mode={mode}
        setMode={setMode}
        notesLoading={notesLoading}
        notesValidationError={notesValidationError}
        notesValidationSuccess={notesValidationSuccess}
        setNotesError={setNotesError}
        validateNotesJson={validateNotesJson}
        handleNotesGenerate={handleNotesGenerate}
        handleNotesReset={handleNotesReset}
      />
      {notesError && <ErrorCard error={notesError} />}
      {notesResult && pageData && (
        <div
          className={`${styles.card} neu-card`}
          ref={outputRef}
          style={{
            marginTop: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "32px",
            overflowX: "auto",
          }}
        >
          {/* Navigation Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <button
                type="button"
                className="neu-raised"
                disabled={currentPageIndex === 0}
                onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: currentPageIndex === 0 ? "not-allowed" : "pointer",
                  opacity: currentPageIndex === 0 ? 0.5 : 1,
                  fontWeight: 600,
                }}
              >
                ← Previous
              </button>

              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Page {currentPageIndex + 1} of {totalPages}
              </span>

              <button
                type="button"
                className="neu-raised"
                disabled={currentPageIndex >= totalPages - 1}
                onClick={() => setCurrentPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: currentPageIndex >= totalPages - 1 ? "not-allowed" : "pointer",
                  opacity: currentPageIndex >= totalPages - 1 ? 0.5 : 1,
                  fontWeight: 600,
                }}
              >
                Next →
              </button>
            </div>
          )}

          <A4Page data={pageData} />
        </div>
      )}
    </>
  );
});

export default NotesConverter;
