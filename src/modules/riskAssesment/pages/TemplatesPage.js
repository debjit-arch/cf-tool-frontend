// RiskTemplateTable.jsx
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import templateRiskService from "../services/templateRiskService";
import riskService from "../services/riskService";

const RiskTemplateTable = () => {
  const [risks, setRisks] = useState([]);
  const [savingId, setSavingId] = useState(null); // original-array index while saving
  const [removingId, setRemovingId] = useState(null); // original-array index while removing
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [riskToRemove, setRiskToRemove] = useState(null); // original-array index pending delete
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const risksPerPage = 5;
  const history = useHistory();

  const [showButtons, setShowButtons] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const user = JSON.parse(sessionStorage.getItem("user"))
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // Scrolling down
        setShowButtons(false);
      } else {
        // Scrolling up
        setShowButtons(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const [infoModal, setInfoModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null, // optional callback for confirm actions
  });

  const showInfoModal = (title, message, onConfirm = null) => {
    setInfoModal({ isOpen: true, title, message, onConfirm });
  };

  const closeInfoModal = () => {
    setInfoModal({ ...infoModal, isOpen: false });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await templateRiskService.getAllTemplateRisks();
        setRisks(data || []);
      } catch (err) {
        console.error("Failed to load template risks:", err);
      }
    };
    fetchData();
  }, []);

  // derive department list from original risks
  const departments = [
    "All",
    ...new Set(risks.map((r) => r.department).filter(Boolean)),
  ];

  // filtered list used for pagination & display
  const filteredRisks =
    selectedDepartment === "All"
      ? risks
      : risks.filter((r) => r.department === selectedDepartment);

  // pagination indexes are based on filteredRisks
  const indexOfLastRisk = currentPage * risksPerPage;
  const indexOfFirstRisk = indexOfLastRisk - risksPerPage;
  const currentRisks = filteredRisks.slice(indexOfFirstRisk, indexOfLastRisk);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRisks.length / risksPerPage)
  );

  // Helpers
  const getRiskLevelColor = (riskLevel) => {
    switch (String(riskLevel || "").toLowerCase()) {
      case "high":
        return "#ffcccb";
      case "medium":
        return "#ffffcc";
      case "low":
        return "#ccffcc";
      default:
        return "#f0f0f0";
    }
  };

  // Accept (save) a risk — accepts originalIndex (index inside `risks`)
  const handleAcceptRisk = async (risk, originalIndex) => {
    try {
      setSavingId(originalIndex);

      // Fetch existing risks from backend
      const existingRisks = await riskService.getAllRisks();

      // Combine saved risks + template risks (excluding the current one)
      const allRisks = [
        ...existingRisks,
        ...risks.filter((_, idx) => idx !== originalIndex),
      ];

      // Check for duplicate descriptions (case-insensitive, trimmed)
      const duplicate = allRisks.some(
        (r) =>
          r.riskDescription?.trim().toLowerCase() ===
          risk.riskDescription?.trim().toLowerCase()
      );

      if (duplicate) {
        const proceed = window.confirm(
          "A risk with the same description already exists! Do you want to continue adding it?"
        );
        if (!proceed) {
          setSavingId(null);
          return; // stop if user cancels
        }
      }

      // Generate new riskId
      const currentYear = new Date().getFullYear();
      const maxNumber = existingRisks.reduce((max, r) => {
        const match = r.riskId && r.riskId.match(/RR-\d{4}-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      const nextNumber = String(maxNumber + 1).padStart(3, "0");
      const nextRiskId = `RR-${currentYear}-${nextNumber}`;

      const newRisk = {
        ...risk,
        riskId: nextRiskId,
        date: new Date().toISOString().split("T")[0],
        probability: String(risk.probability),
        numberOfDays: String(risk.numberOfDays),
        likelihoodAfterTreatment: String(risk.likelihoodAfterTreatment),
        impactAfterTreatment: String(risk.impactAfterTreatment),
        controlReference: Array.isArray(risk.controlReference)
          ? risk.controlReference
          : [risk.controlReference].filter(Boolean),
        vulnerability: Array.isArray(risk.vulnerability)
          ? risk.vulnerability
          : [risk.vulnerability].filter(Boolean),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "Open",
        organization:user.organization
      };

      await riskService.saveRisk(newRisk);

      showInfoModal(
        "Success",
        `Risk template ${originalIndex + 1} accepted and added successfully!`
      );
    } catch (error) {
      console.error(error);
      showInfoModal(
        "Error",
        `Failed to accept risk template: ${error?.message || error}`
      );
    } finally {
      setSavingId(null);
    }
  };

  // Trigger reject: open confirm dialog using originalIndex
  const handleRejectRisk = (originalIndex) => {
    setRiskToRemove(originalIndex);
    setShowConfirmDialog(true);
  };

  // Confirm removal — remove by original index
  const confirmRejectRisk = () => {
    if (riskToRemove == null) return;
    setRemovingId(riskToRemove);

    // small delay to show removing animation + UX
    setTimeout(() => {
      setRisks((prev) => prev.filter((_, idx) => idx !== riskToRemove));
      setRemovingId(null);
      setShowConfirmDialog(false);
      showInfoModal(
        "Removed",
        `Risk template ${riskToRemove + 1} has been removed from view.`
      );

      setRiskToRemove(null);

      // ensure page remains valid after deletion
      const newFilteredLength =
        selectedDepartment === "All"
          ? risks.length - 1
          : risks.filter((r) => r.department === selectedDepartment).length - 1;
      const newTotalPages = Math.max(
        1,
        Math.ceil(newFilteredLength / risksPerPage)
      );
      if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
    }, 400);
  };

  const cancelRejectRisk = () => {
    setShowConfirmDialog(false);
    setRiskToRemove(null);
  };

  // Open modal for full view — store originalIndex so modal actions map correctly
  const handleViewFullRisk = (risk, originalIndex) => {
    setSelectedRisk({
      ...risk,
      serialNo: originalIndex + 1,
      serialIndex: originalIndex,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRisk(null);
  };

  // (Optional) pagination controls helpers
  const gotoPage = (pageNumber) => {
    const p = Math.max(1, Math.min(totalPages, pageNumber));
    setCurrentPage(p);
  };

  // Styles (kept inline for simplicity — you can move to CSS)
  const buttonBaseStyle = {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    margin: "0 6px",
  };

  const acceptButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "#28a745",
    color: "white",
  };
  const rejectButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "#dc3545",
    color: "white",
  };
  const viewButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: "#007bff",
    color: "white",
  };

  const backBtnStyle = {
    position: "fixed",
    top: "20px",
    right: "120px",
    padding: "10px 20px",
    borderRadius: "6px",
    backgroundColor: "#005FCC",
    border: "none",
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0, 95, 204, 0.3)",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    zIndex: 99,
  };

  const tableStyles = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };

  const headerStyles = {
    backgroundColor: "#f8f9fa",
    padding: "12px",
    textAlign: "center",
    fontWeight: "700",
    fontSize: "14px",
    border: "1px solid #e9ecef",
    position: "sticky",
    top: 0,
    zIndex: 5,
  };

  const cellStyles = {
    padding: "12px",
    border: "1px solid #e9ecef",
    verticalAlign: "top",
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f7f9fb",
        minHeight: "100vh",
      }}
    >
      <button
        style={{
          position: "sticky",
          top: "0",
          margin: "10px",
          padding: "10px 24px",
          borderRadius: "8px",
          background: "#005FCC",
          border: "none",
          color: "#fff",
          fontWeight: "500",
          fontSize: "14px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "transform 0.3s ease, opacity 0.3s ease",
          zIndex: 999,
          transform: showButtons ? "translateY(0)" : "translateY(-100%)",
          opacity: showButtons ? 1 : 0,
        }}
        onClick={() => history.push("/risk-assessment")}
      >
        ← Back to Dashboard{" "}
      </button>

      <h2 style={{ textAlign: "center", marginBottom: "18px", color: "#222" }}>
        Sample Risks
      </h2>

      <div
        style={{
          marginBottom: "18px",
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <label style={{ fontWeight: 600 }}>Filter by Department:</label>
        <select
          value={selectedDepartment}
          onChange={(e) => {
            setSelectedDepartment(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          {departments.map((d, i) => (
            <option key={i} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          overflowX: "auto",
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "6px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        }}
      >
        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={{ ...headerStyles, width: "80px" }}>#</th>
              <th style={{ ...headerStyles, minWidth: "45%" }}>
                Risk Description
              </th>
              <th style={{ ...headerStyles, width: "120px" }}>Department</th>
              <th style={{ ...headerStyles, width: "120px" }}>Risk Score</th>
              <th style={{ ...headerStyles, width: "120px" }}>Risk Level</th>
              <th
                style={{
                  ...headerStyles,
                  minWidth: "260px",
                  backgroundColor: "#e9f2ff",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {currentRisks.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...cellStyles, textAlign: "center" }}>
                  No risks to display.
                </td>
              </tr>
            ) : (
              currentRisks.map((risk, displayIndex) => {
                // original index in the full `risks` array (keeps numbering consistent globally)
                const originalIndex = risks.indexOf(risk);
                const serialNo =
                  originalIndex >= 0
                    ? originalIndex + 1
                    : indexOfFirstRisk + displayIndex + 1;
                const isSaving = savingId === originalIndex;
                const isRemoving = removingId === originalIndex;

                return (
                  <tr
                    key={serialNo}
                    style={{
                      backgroundColor:
                        serialNo % 2 === 0 ? "#ffffff" : "#fbfcfd",
                      opacity: isRemoving ? 0.35 : 1,
                      transform: isRemoving ? "scale(0.995)" : "scale(1)",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <td
                      style={{
                        ...cellStyles,
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                    >
                      {serialNo}
                    </td>

                    <td style={{ ...cellStyles, lineHeight: "1.4" }}>
                      {risk.riskDescription || risk.description || "N/A"}
                    </td>

                    <td style={{ ...cellStyles, textAlign: "center" }}>
                      {risk.department || "N/A"}
                    </td>

                    <td
                      style={{
                        ...cellStyles,
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                    >
                      {risk.riskScore ?? "—"}
                    </td>

                    <td
                      style={{
                        ...cellStyles,
                        textAlign: "center",
                        backgroundColor: getRiskLevelColor(risk.riskLevel),
                        fontWeight: 700,
                      }}
                    >
                      {risk.riskLevel || "—"}
                    </td>

                    <td
                      style={{
                        ...cellStyles,
                        textAlign: "center",
                        backgroundColor: "#fafcff",
                      }}
                    >
                      <button
                        onClick={() => handleAcceptRisk(risk, originalIndex)}
                        disabled={isSaving || isRemoving}
                        style={{
                          ...acceptButtonStyle,
                          opacity: isSaving || isRemoving ? 0.6 : 1,
                          cursor:
                            isSaving || isRemoving ? "not-allowed" : "pointer",
                        }}
                      >
                        {isSaving ? "Adding..." : "Accept"}
                      </button>

                      <button
                        onClick={() => handleRejectRisk(originalIndex)}
                        disabled={isSaving || isRemoving}
                        style={{
                          ...rejectButtonStyle,
                          opacity: isSaving || isRemoving ? 0.6 : 1,
                          cursor:
                            isSaving || isRemoving ? "not-allowed" : "pointer",
                        }}
                      >
                        {isRemoving ? "Removing..." : "Reject"}
                      </button>

                      <button
                        onClick={() => handleViewFullRisk(risk, originalIndex)}
                        disabled={isSaving || isRemoving}
                        style={{
                          ...viewButtonStyle,
                          opacity: isSaving || isRemoving ? 0.6 : 1,
                          cursor:
                            isSaving || isRemoving ? "not-allowed" : "pointer",
                        }}
                      >
                        View Full Risk
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "16px",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => gotoPage(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #cad9f7",
                backgroundColor: currentPage === 1 ? "#f0f2f5" : "white",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => gotoPage(pageNum)}
                  disabled={isActive}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid #007bff",
                    backgroundColor: isActive ? "#007bff" : "white",
                    color: isActive ? "white" : "#007bff",
                    cursor: isActive ? "default" : "pointer",
                    fontWeight: 700,
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => gotoPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #cad9f7",
                backgroundColor:
                  currentPage === totalPages ? "#f0f2f5" : "white",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Confirm dialog for removal */}
      {showConfirmDialog && typeof riskToRemove === "number" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 28,
              borderRadius: 8,
              maxWidth: 480,
              textAlign: "center",
              boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Confirm Rejection</h3>
            <p style={{ color: "#555" }}>
              Are you sure you want to remove Risk Template {riskToRemove + 1}{" "}
              from view? This action cannot be undone.
            </p>
            <div style={{ marginTop: 18 }}>
              <button
                onClick={cancelRejectRisk}
                style={{
                  ...buttonBaseStyle,
                  backgroundColor: "#6c757d",
                  color: "white",
                  marginRight: 12,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRejectRisk}
                style={{
                  ...buttonBaseStyle,
                  backgroundColor: "#dc3545",
                  color: "white",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full view modal */}
      {showModal && selectedRisk && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            padding: 20,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 800,
              background: "white",
              borderRadius: 8,
              padding: 22,
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h3 style={{ margin: 0 }}>
                Sample Risk {selectedRisk.serialNo} - Full Details
              </h3>
              <button
                onClick={closeModal}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 22,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              {[
                { label: "Department", value: selectedRisk.department },
                { label: "Risk Type", value: selectedRisk.riskType },
                { label: "Asset Type", value: selectedRisk.assetType },
                { label: "Asset", value: selectedRisk.asset },
                {
                  label: "Risk Description",
                  value:
                    selectedRisk.riskDescription || selectedRisk.description,
                },
                { label: "Risk Score", value: selectedRisk.riskScore },
                { label: "Risk Level", value: selectedRisk.riskLevel },
                { label: "Likelihood", value: selectedRisk.probability },
                {
                  label: "Likelihood After Treatment",
                  value: selectedRisk.likelihoodAfterTreatment,
                },
                {
                  label: "Impact After Treatment",
                  value: selectedRisk.impactAfterTreatment,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    background: "#f8f9fb",
                    borderRadius: 6,
                    border: "1px solid #eef2f6",
                  }}
                >
                  <div
                    style={{ fontWeight: 700, marginBottom: 6, color: "#333" }}
                  >
                    {item.label}:
                  </div>
                  <div style={{ color: "#222" }}>{item.value ?? "N/A"}</div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 18,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  ...buttonBaseStyle,
                  backgroundColor: "#6c757d",
                  color: "white",
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAcceptRisk(selectedRisk, selectedRisk.serialIndex);
                  closeModal();
                }}
                style={{
                  ...buttonBaseStyle,
                  backgroundColor: "#007bff",
                  color: "white",
                }}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
      {infoModal.isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1400,
            padding: 20,
          }}
          onClick={closeInfoModal}
        >
          <div
            style={{
              maxWidth: 480,
              width: "100%",
              background: "white",
              borderRadius: 8,
              padding: 24,
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>{infoModal.title}</h3>
            <p style={{ color: "#555", marginBottom: 24 }}>
              {infoModal.message}
            </p>
            <button
              onClick={() => {
                if (infoModal.onConfirm) infoModal.onConfirm();
                closeInfoModal();
              }}
              style={{
                padding: "10px 20px",
                borderRadius: 6,
                border: "none",
                backgroundColor: "#007bff",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskTemplateTable;
