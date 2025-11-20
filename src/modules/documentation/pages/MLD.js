import React, { useEffect, useState, useMemo } from "react";
import { useHistory } from "react-router-dom";
import documentationService from "../services/documentationService";
import gapService from "../../gapAssessment/services/gapService";
import { Trash2, UploadCloud, Calendar, Check } from "lucide-react";

const MLD = () => {
  const history = useHistory();
  const user = JSON.parse(sessionStorage.getItem("user"));

  // original states
  const [documents, setDocuments] = useState([]);
  const [soas, setSoas] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [hasUploaded, setHasUploaded] = useState({});
  const [uploading, setUploading] = useState({});

  const [currentPageSoA, setCurrentPageSoA] = useState(1);
  const [currentPageDocs, setCurrentPageDocs] = useState(1);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const itemsPerPage = 3;

  // additional states
  const [uploadedCounts, setUploadedCounts] = useState({});
  const [soaSearch, setSoaSearch] = useState("");
  const [soaSort, setSoaSort] = useState("date_newest"); // date_newest | date_oldest | name
  const [docSearch, setDocSearch] = useState("");
  const [docSort, setDocSort] = useState("date_newest");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docs = (await documentationService.getDocuments()) || [];
        setDocuments(docs || []);
        console.log("📄 Documents fetched from API:", docs);

        const soaList = (await documentationService.getSoAEntries()) || [];
        setSoas(Array.isArray(soaList) ? soaList : []);
        console.log("📘 SoA entries fetched:", soaList);

        // compute counts per soa
        const counts = {};
        (Array.isArray(soaList) ? soaList : []).forEach((s) => {
          counts[s.id] = 0;
        });
        (Array.isArray(docs) ? docs : []).forEach((d) => {
          const sid = d.soaId ?? d.soa?.id ?? d.soaIdString ?? null;
          if (sid != null) counts[sid] = (counts[sid] ?? 0) + 1;
        });
        setUploadedCounts(counts);
      } catch (error) {
        console.error("Error loading data:", error);
        setDocuments([]);
        setSoas([]);
        setUploadedCounts({});
      }
    };
    fetchData();
  }, []);

  const handlePreviewClick = (soa) => {
    const doc = documents.find((d) => String(d.soaId) === String(soa.id));
    if (doc) {
      const baseUrl = "http://safesphere.duckdns.org:4002";
      const filePath = doc.url.startsWith("/") ? doc.url : `/${doc.url}`;
      const encodedPath = encodeURI(filePath);
      const fullUrl = baseUrl + encodedPath;
      setPreviewUrl(fullUrl);
      setPreviewModalOpen(true);
    } else {
      alert("No document uploaded to preview.");
    }
  };

  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setPreviewUrl("");
  };

  const handleFileChange = (soaId, fileOrFiles) => {
    if (!fileOrFiles) {
      setSelectedFiles((prev) => ({ ...prev, [soaId]: null }));
      return;
    }
    let file = fileOrFiles;
    if (file instanceof FileList || Array.isArray(file)) file = file[0];
    setSelectedFiles((prev) => ({ ...prev, [soaId]: file }));
  };

  const handleFileSelect = (event, refId) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFiles((prev) => ({
        ...prev,
        [refId]: file,
      }));
      setHasUploaded((prev) => ({
        ...prev,
        [refId]: false,
      }));
    }
  };

  const handleSingleButtonUpload = async (soaId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*";
    input.onchange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      try {
        setUploading((prev) => ({ ...prev, [soaId]: true }));

        const uploadedDoc = await documentationService.uploadDocument({
          file,
          soaId,
          controlId: "",
          uploaderName: user?.name ?? "Unknown",
          departmentName: user?.department?.name ?? "N/A",
        });

        try {
          const docId = uploadedDoc?.id ?? uploadedDoc?._id ?? null;
          if (docId) {
            await gapService.createGap(docId, { status: "Open" });
            console.log("Gap entry created for docId:", docId);
          }
        } catch (gapErr) {
          console.error("Failed to create gap entry:", gapErr);
        }

        alert("Document uploaded successfully");

        // refresh documents and counts
        const docs = (await documentationService.getDocuments()) || [];
        setDocuments(docs || []);
        const counts = {};
        (soas || []).forEach((s) => (counts[s.id] = 0));
        (docs || []).forEach((d) => {
          const sid = d.soaId ?? d.soa?.id ?? d.soaIdString ?? null;
          if (sid != null) counts[sid] = (counts[sid] ?? 0) + 1;
        });
        setUploadedCounts(counts);
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Error uploading document");
      } finally {
        setUploading((prev) => ({ ...prev, [soaId]: false }));
      }
    };
    input.click();
  };

  const handleDeleteForSoA = async (soaId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete the uploaded document(s) for this SoA?"
      )
    )
      return;

    try {
      const linkedDocs = documents.filter(
        (doc) => String(doc.soaId) === String(soaId)
      );

      for (const doc of linkedDocs) {
        await documentationService.deleteDocument(doc.id);
      }

      const updatedDocs = documents.filter((doc) => !linkedDocs.includes(doc));
      setDocuments(updatedDocs);

      // Recompute uploaded counts
      const counts = {};
      (soas || []).forEach((s) => (counts[s.id] = 0));
      (updatedDocs || []).forEach((d) => {
        const sid = d.soaId ?? d.soa?.id ?? d.soaIdString ?? null;
        if (sid != null) counts[sid] = (counts[sid] ?? 0) + 1;
      });
      setUploadedCounts(counts);

      // Clear selected files for this SoA
      setSelectedFiles((prev) => {
        const copy = { ...prev };
        delete copy[soaId];
        return copy;
      });

      alert("Uploaded document(s) deleted. You can now upload new ones.");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Error deleting documents");
    }
  };

  const getUploadedCount = (soaId) => uploadedCounts[soaId] ?? 0;

  // ---------------- SEARCH & SORT ----------------
  const filteredAndSortedSoas = useMemo(() => {
    let list = Array.isArray(soas) ? [...soas] : [];
    if (soaSearch && soaSearch.trim() !== "") {
      const q = soaSearch.trim().toLowerCase();
      list = list.filter((s) => {
        const ref = Array.isArray(s.documentRef)
          ? s.documentRef.join(" ")
          : s.documentRef ?? "";
        return ref.toString().toLowerCase().includes(q);
      });
    }
    if (soaSort === "date_newest" || soaSort === "date_oldest") {
      list.sort((a, b) => {
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return soaSort === "date_newest" ? bd - ad : ad - bd;
      });
    } else if (soaSort === "name") {
      list.sort((a, b) => {
        const an = (
          Array.isArray(a.documentRef)
            ? a.documentRef.join(", ")
            : a.documentRef ?? ""
        ).toLowerCase();
        const bn = (
          Array.isArray(b.documentRef)
            ? b.documentRef.join(", ")
            : b.documentRef ?? ""
        ).toLowerCase();
        return an.localeCompare(bn);
      });
    }
    return list;
  }, [soas, soaSearch, soaSort]);

  // --- DEDUPLICATE SOAs ---
  const uniqueSoas = useMemo(() => {
    const seen = new Set();
    return filteredAndSortedSoas.filter((soa) => {
      if (seen.has(soa.id)) return false;
      seen.add(soa.id);
      return true;
    });
  }, [filteredAndSortedSoas]);

  // Pagination
  const currentSoAs = uniqueSoas;

  const totalPagesSoA = Math.max(
    1,
    Math.ceil(currentSoAs.length / itemsPerPage)
  );

  // ==================== STYLES ====================
  const backBtnStyle = {
    position: "fixed",
    top: "40px",
    right: "120px",
    padding: "10px 20px",
    borderRadius: "6px",
    backgroundColor: "#005FCC",
    border: "none",
    color: "white",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,95,204,0.3)",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    zIndex: 99,
  };

  const tableContainerStyle = { width: "100%", overflowX: "auto" };

  // ==================== RENDER ====================
  return (
    <div
      style={{ padding: "10px", maxWidth: "1200px", margin: "5px auto 20px" }}
    >
      <button
        style={backBtnStyle}
        onClick={() => history.push("/documentation")}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#0046a3";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#005FCC";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        ← Back to Dashboard
      </button>

      <div
        style={{
          background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 5px 20px rgba(102,126,234,0.25)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "white",
        }}
      >
        <h1
          style={{ marginBottom: "8px", fontSize: "28px", fontWeight: "700" }}
        >
          📚 Master List of Documents
        </h1>
        <p style={{ fontSize: "16px", opacity: 0.95, marginBottom: "12px" }}>
          Upload and manage your documents per SoA
        </p>
        <div
          style={{
            display: "flex",
            gap: "30px",
            fontSize: "14px",
            opacity: 0.95,
            flexWrap: "wrap",
          }}
        >
          <div>
            <span style={{ fontWeight: 600 }}>Total SoA Entries:</span>{" "}
            {soas.length}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>Documents Uploaded:</span>{" "}
            {documents.length}
          </div>
        </div>
      </div>

      <div
        className="controls-row"
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "12px",
          justifyContent: "space-between",
        }}
      >
        <div
          className="controls-left"
          style={{ display: "flex", gap: "12px", alignItems: "center" }}
        >
          <input
            type="text"
            placeholder="Search Document Ref..."
            value={soaSearch}
            onChange={(e) => {
              setSoaSearch(e.target.value);
              setCurrentPageSoA(1);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              minWidth: "220px",
            }}
          />
          <select
            value={soaSort}
            onChange={(e) => setSoaSort(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "white",
            }}
          >
            <option value="date_newest">Date (Newest)</option>
            <option value="date_oldest">Date (Oldest)</option>
            <option value="name">Name (A → Z)</option>
          </select>
        </div>
        <div
          className="controls-right"
          style={{ color: "#666", fontSize: "14px" }}
        >
          Showing {currentSoAs.length} upload entries
        </div>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "28px",
          boxShadow: "0 3px 15px rgba(0,0,0,0.06)",
          border: "1px solid #e9ecef",
        }}
      >
        <h2
          style={{
            color: "#2c3e50",
            marginBottom: "16px",
            fontSize: "18px",
            borderBottom: "3px solid #667eea",
            paddingBottom: "8px",
          }}
        >
          📤 Upload Documents
        </h2>

        <div style={tableContainerStyle}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 840 }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "4%",
                  }}
                >
                  #
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "25%",
                  }}
                >
                  Document Name
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "15%",
                  }}
                >
                  Dept Name
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "15%",
                  }}
                >
                  Uploader Name
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "12%",
                  }}
                >
                  Approval Date
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "12%",
                  }}
                >
                  Next Approval Date
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "10%",
                  }}
                >
                  Upload File
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                    width: "7%",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentSoAs.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "18px",
                      color: "#7f8c8d",
                    }}
                  >
                    No SoA entries found
                  </td>
                </tr>
              ) : (
                currentSoAs.map((soa, idx) => {
                  const soaId = soa.id;
                  const count = getUploadedCount(soaId);
                  const hasUploaded = count > 0;
                  const doc = documents.find(
                    (d) => String(d.soaId) === String(soa.id)
                  );

                  const approvalDate = doc?.approvalDate
                    ? new Date(doc.approvalDate).toISOString().split("T")[0]
                    : "—";
                  const nextApprovalDate = doc?.nextApprovalDate
                    ? new Date(doc.nextApprovalDate).toISOString().split("T")[0]
                    : "—";

                  const handleApprove = async () => {
                    if (!doc) return;
                    const today = new Date();
                    const nextDate = new Date();
                    nextDate.setDate(today.getDate() + 365);
                    try {
                      const updatedDoc =
                        await documentationService.updateApprovalDate(
                          doc.id,
                          today.getTime(),
                          nextDate.getTime()
                        );
                      setDocuments((prevDocs) =>
                        prevDocs.map((d) => (d.id === doc.id ? updatedDoc : d))
                      );
                      alert("Document approved!");
                    } catch (err) {
                      console.error(err);
                      alert("Failed to approve document");
                    }
                  };

                  return (
                    <tr
                      key={soaId}
                      style={{ borderBottom: "1px solid #f1f1f1" }}
                    >
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#495057",
                          verticalAlign: "middle",
                          textAlign: "center",
                          userSelect: "none",
                          fontWeight: "600",
                        }}
                      >
                        {idx + 1}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#3498db",
                          verticalAlign: "middle",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => handlePreviewClick(soa)}
                      >
                        {Array.isArray(soa.documentRef)
                          ? soa.documentRef.join(", ")
                          : soa.documentRef}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#2c3e50",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {doc?.departmentName ?? "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#2c3e50",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {doc?.uploaderName ?? "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#2c3e50",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {approvalDate}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#2c3e50",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        {nextApprovalDate}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        <button
                          onClick={() => handleSingleButtonUpload(soaId)}
                          style={{
                            backgroundColor: hasUploaded
                              ? "#2ecc71"
                              : "#f1f1f1",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            cursor: hasUploaded ? "default" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: hasUploaded ? "white" : "inherit",
                          }}
                          disabled={hasUploaded || uploading[soaId]}
                        >
                          {uploading[soaId] ? (
                            <>
                              <UploadCloud
                                size={16}
                                style={{ marginRight: "4px" }}
                              />
                              Uploading...
                            </>
                          ) : hasUploaded ? (
                            <Check size={20} />
                          ) : (
                            <>
                              <UploadCloud
                                size={16}
                                style={{ marginRight: "4px" }}
                              />
                              Upload
                            </>
                          )}
                        </button>
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          verticalAlign: "middle",
                          textAlign: "center",
                          display: "flex",
                          gap: "4px",
                          justifyContent: "center",
                        }}
                      >
                        {hasUploaded && (
                          <>
                            <button
                              onClick={handleApprove}
                              style={{
                                backgroundColor: "#2ecc71",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "4px 6px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Calendar
                                size={16}
                                style={{ marginRight: "4px" }}
                              />
                              Approve
                            </button>
                            <button
                              onClick={() => handleDeleteForSoA(soaId)}
                              style={{
                                backgroundColor: "#e74c3c",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "4px 6px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview modal */}
      {previewModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              maxWidth: "90%",
              maxHeight: "90%",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <button
              onClick={closePreviewModal}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ×
            </button>
            <iframe
              src={previewUrl}
              title="Preview Document"
              style={{ width: "100%", height: "80vh", border: "none" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MLD;
