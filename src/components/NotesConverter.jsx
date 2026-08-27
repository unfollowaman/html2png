import { forwardRef, useImperativeHandle } from "react";
import { InputCard, ErrorCard } from "./";
import { A4Page } from "./A4Page";
import { useNotesToPngConversion } from "../hooks/useNotesToPngConversion";
import styles from "../styles/Home.module.css";

const NotesConverter = forwardRef(function NotesConverter(
  { inputRef, outputRef, mode, setMode, onReset },
  ref
) {
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

  useImperativeHandle(ref, () => ({
    handleReset: handleNotesReset,
  }));

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
      {notesResult && (
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
          <A4Page data={notesResult} />
        </div>
      )}
    </>
  );
});

export default NotesConverter;
