import React from "react";

const Modal = ({ isOpen, title, message, onClose, onConfirm, showCancel }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          width: "420px",
          maxWidth: "90%",
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>{title}</h3>
        <p style={{ marginBottom: "20px" }}>{message}</p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {showCancel && (
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#bdc3c7",
                color: "white",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}

          <button
            onClick={onConfirm || onClose}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#3498db",
              color: "white",
              cursor: "pointer",
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};


export default Modal;
