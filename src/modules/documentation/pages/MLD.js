// import React, { useEffect, useState } from "react";
// import { useHistory } from "react-router-dom"; // v5
// import documentationService from "../services/documentationService";
// import gapService from "../../gapAssessment/services/gapService";

// const MLD = () => {
//   const history = useHistory();

//   const [documents, setDocuments] = useState([]);
//   const [soas, setSoas] = useState([]);
//   const [selectedFiles, setSelectedFiles] = useState({}); // store per-SoA file

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const docs = await documentationService.getDocuments();
//         setDocuments(docs || []);

//         const soaList = await documentationService.getSoAEntries();
//         setSoas(Array.isArray(soaList) ? soaList : []);
//       } catch (error) {
//         console.error("Error loading data:", error);
//         setDocuments([]);
//         setSoas([]);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleFileChange = (soaId, file) => {
//     setSelectedFiles((prev) => ({
//       ...prev,
//       [soaId]: file,
//     }));
//   };

//   const handleUpload = async (refId) => {
//     const file = selectedFiles[refId];
//     if (!file) {
//       alert("Please select a file for this Document Reference");
//       return;
//     }

//     try {
//       // ✅ Store the uploaded document info in a variable
//       const uploadedDoc = await documentationService.uploadDocument({
//         file, // the selected file
//         soaId: refId, // the reference id
//         controlId: "", // optional
//       });

//       // ✅ Now uploadedDoc is defined
//       try {
//         const docId = uploadedDoc?.id ?? uploadedDoc?._id ?? null;
//         if (docId) {
//           await gapService.createGap(docId, { status: "Open" });
//           console.log("Gap entry created for docId:", docId);
//         } else {
//           console.warn("No document ID returned from upload, gap not created.");
//         }
//       } catch (gapErr) {
//         console.error("Failed to create gap entry:", gapErr);
//       }

//       alert("Document uploaded successfully");

//       setSelectedFiles((prev) => ({
//         ...prev,
//         [refId]: null,
//       }));

//       const docs = await documentationService.getDocuments();
//       setDocuments(docs || []);
//     } catch (error) {
//       console.error("Upload failed:", error);
//       alert("Error uploading document");
//     }
//   };

//   const handleDelete = async (docId) => {
//     if (!window.confirm("Are you sure you want to delete this document?"))
//       return;

//     try {
//       await documentationService.deleteDocument(docId); // <-- add this function to your service
//       const updatedDocs = documents.filter((doc) => doc.id !== docId);
//       setDocuments(updatedDocs);
//       alert("Document deleted successfully");
//     } catch (error) {
//       console.error("Delete failed:", error);
//       alert("Error deleting document");
//     }
//   };

//   return (
//     <div
//       style={{
//         marginTop: "60px",
//         padding: "15px",
//         maxWidth: "1000px",
//         margin: "60px auto 0",
//       }}
//     >
//       {/* Header */}
//       <div
//         style={{
//           background: "white",
//           borderRadius: "12px",
//           padding: "20px",
//           marginBottom: "20px",
//           boxShadow: "0 3px 12px rgba(0, 0, 0, 0.06)",
//           border: "1px solid #e9ecef",
//           textAlign: "center",
//         }}
//       >
//         <h1 style={{ color: "#2c3e50", marginBottom: "8px", fontSize: "22px" }}>
//           📚 Master List of Documents
//         </h1>
//         <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
//           Upload and manage your documents per SoA
//         </p>
//       </div>

//       {/* SoA List with Upload */}
//       <table
//         style={{
//           width: "100%",
//           borderCollapse: "collapse",
//           background: "white",
//           borderRadius: "10px",
//           overflow: "hidden",
//           boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
//           marginBottom: "30px",
//         }}
//       >
//         <thead>
//           <tr>
//             <th
//               style={{
//                 padding: "12px",
//                 borderBottom: "1px solid #e9ecef",
//                 background: "#f8f9fa",
//               }}
//             >
//               Sl.No
//             </th>
//             <th
//               style={{
//                 padding: "12px",
//                 borderBottom: "1px solid #e9ecef",
//                 background: "#f8f9fa",
//               }}
//             >
//               Document Name
//             </th>
//             <th
//               style={{
//                 padding: "12px",
//                 borderBottom: "1px solid #e9ecef",
//                 background: "#f8f9fa",
//               }}
//             >
//               Upload
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {soas?.length === 0 ? (
//             <tr>
//               <td colSpan="3" style={{ textAlign: "center", padding: "12px" }}>
//                 No SoA entries found
//               </td>
//             </tr>
//           ) : (
//             soas.map((soa, index) => (
//               <tr key={soa.id}>
//                 <td
//                   style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}
//                 >
//                   {index + 1}
//                 </td>
//                 <td
//                   style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}
//                 >
//                   {soa.documentRef}
//                 </td>
//                 <td
//                   style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}
//                 >
//                   <input
//                     type="file"
//                     onChange={(e) =>
//                       handleFileChange(soa.id, e.target.files[0])
//                     }
//                     style={{ marginRight: "10px" }}
//                   />
//                   <button
//                     onClick={() => handleUpload(soa.id)}
//                     style={{
//                       padding: "6px 12px",
//                       borderRadius: "6px",
//                       background: "#3498db",
//                       color: "white",
//                       border: "none",
//                     }}
//                   >
//                     Upload
//                   </button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>

//       {/* Document List */}
//       <table
//         style={{
//           width: "100%",
//           borderCollapse: "collapse",
//           background: "white",
//           borderRadius: "10px",
//           overflow: "hidden",
//           boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
//         }}
//       >
//         <thead>
//           <tr>
//             <th
//               style={{
//                 padding: "12px",
//                 borderBottom: "1px solid #e9ecef",
//                 background: "#f8f9fa",
//               }}
//             >
//               Sl.No
//             </th>
//             <th
//               style={{
//                 padding: "12px",
//                 borderBottom: "1px solid #e9ecef",
//                 background: "#f8f9fa",
//               }}
//             >
//               Document Uploaded
//             </th>
//             <th
//               style={{
//                 padding: "12px",
//                 borderBottom: "1px solid #e9ecef",
//                 background: "#f8f9fa",
//               }}
//             >
//               Uploaded Date
//             </th>
//             <th
//               style={{
//                 padding: "12px",
//                 borderBottom: "1px solid #e9ecef",
//                 background: "#f8f9fa",
//               }}
//             >
//               Actions
//             </th>
//           </tr>
//         </thead>

//         <tbody>
//           {documents?.length === 0 ? (
//             <tr>
//               <td colSpan="3" style={{ textAlign: "center", padding: "12px" }}>
//                 No documents found
//               </td>
//             </tr>
//           ) : (
//             documents.map((doc, index) => (
//               <tr
//                 key={doc.id}
//                 style={{ cursor: "pointer" }}
//                 onClick={() => history.push(`/documentation/mld/${doc.id}`)}
//                 onMouseEnter={(e) =>
//                   (e.currentTarget.style.background = "#f1f3f5")
//                 }
//                 onMouseLeave={(e) =>
//                   (e.currentTarget.style.background = "white")
//                 }
//               >
//                 <td
//                   style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}
//                 >
//                   {index + 1}
//                 </td>
//                 <td
//                   style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}
//                 >
//                   {doc.name}
//                 </td>
//                 <td
//                   style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}
//                 >
//                   {doc.createdAt
//                     ? new Date(doc.createdAt).toLocaleDateString()
//                     : "N/A"}
//                 </td>
//                 <td
//                   style={{ padding: "12px", borderBottom: "1px solid #e9ecef" }}
//                 >
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation(); // prevent row click
//                       handleDelete(doc.id);
//                     }}
//                     style={{
//                       padding: "6px 12px",
//                       borderRadius: "6px",
//                       background: "#e74c3c",
//                       color: "white",
//                       border: "none",
//                       cursor: "pointer",
//                     }}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//       <div
//         style={{
//           position: "fixed",
//           bottom: "30px",
//           left: "30px",
//           zIndex: 100,
//         }}
//       >
//         <button
//           onClick={() => history.push("/documentation/soa")}
//           style={{
//             width: "60px",
//             height: "60px",
//             borderRadius: "50%",
//             background: "linear-gradient(45deg, #3498db, #2980b9)",
//             color: "white",
//             border: "none",
//             fontSize: "24px",
//             cursor: "pointer",
//             boxShadow: "0 4px 15px rgba(52, 152, 219, 0.3)",
//             transition: "all 0.3s ease",
//           }}
//           onMouseEnter={(e) => {
//             e.target.style.transform = "scale(1.1)";
//             e.target.style.boxShadow = "0 6px 20px rgba(52, 152, 219, 0.4)";
//           }}
//           onMouseLeave={(e) => {
//             e.target.style.transform = "scale(1)";
//             e.target.style.boxShadow = "0 4px 15px rgba(52, 152, 219, 0.3)";
//           }}
//           title="Go to SoA"
//         >
//           SOA
//         </button>
//       </div>

//       <div
//         style={{
//           position: "fixed",
//           bottom: "30px",
//           right: "30px",
//           zIndex: 100,
//         }}
//       >
//         <button
//           onClick={() => history.push("/gap-assessment/new")}
//           style={{
//             padding: "12px 25px",
//             borderRadius: "50px",
//             background: "linear-gradient(45deg, #27ae60, #2ecc71)",
//             color: "white",
//             border: "none",
//             fontSize: "16px",
//             fontWeight: "600",
//             cursor: "pointer",
//             boxShadow: "0 4px 15px rgba(39, 174, 96, 0.3)",
//             transition: "all 0.3s ease",
//           }}
//           onMouseEnter={(e) => {
//             e.target.style.transform = "scale(1.05)";
//             e.target.style.boxShadow = "0 6px 20px rgba(39, 174, 96, 0.4)";
//           }}
//           onMouseLeave={(e) => {
//             e.target.style.transform = "scale(1)";
//             e.target.style.boxShadow = "0 4px 15px rgba(39, 174, 96, 0.3)";
//           }}
//           title="Go to MLD"
//         >
//           🚀 Go to Gap Assessment
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MLD;

import React, { useEffect, useState, useMemo } from "react";
import { useHistory } from "react-router-dom";
import documentationService from "../services/documentationService";
import gapService from "../../gapAssessment/services/gapService";

const MLD = () => {
  const history = useHistory();

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
  const itemsPerPage = 3; // keep as original

  // additional states
  const [uploadedCounts, setUploadedCounts] = useState({}); // { soaId: number }

  // Separate controls for Upload section (SoA)
  const [soaSearch, setSoaSearch] = useState("");
  const [soaSort, setSoaSort] = useState("date_newest"); // date_newest | date_oldest | name

  // Separate controls for Documents section
  const [docSearch, setDocSearch] = useState("");
  const [docSort, setDocSort] = useState("date_newest"); // date_newest | date_oldest | name

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docs = (await documentationService.getDocuments()) || [];
        setDocuments(docs || []);

        const soaList = (await documentationService.getSoAEntries()) || [];
        setSoas(Array.isArray(soaList) ? soaList : []);

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

  // keep original behavior: accept FileList or single File
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
        [refId]: false, // 👈 reset to show "Upload"
      }));
    }
  };

  const handleUpload = async (refId) => {
    const file = selectedFiles[refId];
    if (!file) {
      alert("Please select a file for this Document Reference");
      return;
    }

    try {
      // ⏳ Mark this SoA as uploading
      setUploading((prev) => ({ ...prev, [refId]: true }));

      const uploadedDoc = await documentationService.uploadDocument({
        file,
        soaId: refId,
        controlId: "",
      });

      try {
        const docId = uploadedDoc?.id ?? uploadedDoc?._id ?? null;
        if (docId) {
          await gapService.createGap(docId, { status: "Open" });
          console.log("Gap entry created for docId:", docId);
        } else {
          console.warn("No document ID returned from upload, gap not created.");
        }
      } catch (gapErr) {
        console.error("Failed to create gap entry:", gapErr);
      }

      alert("Document uploaded successfully");

      setHasUploaded((prev) => ({ ...prev, [refId]: true }));
      setSelectedFiles((prev) => ({ ...prev, [refId]: null }));

      const docs = (await documentationService.getDocuments()) || [];
      setDocuments(docs || []);

      const counts = {};
      (soas || []).forEach((s) => (counts[s.id] = 0));
      (docs || []).forEach((d) => {
        const sid = d.soaId ?? d.soa?.id ?? d.soaIdString ?? null;
        if (sid != null) counts[sid] = (counts[sid] ?? 0) + 1;
      });
      setUploadedCounts(counts);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Error uploading document");
    } finally {
      // ✅ Stop spinner
      setUploading((prev) => ({ ...prev, [refId]: false }));
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
    try {
      await documentationService.deleteDocument(docId);
      const updatedDocs = documents.filter(
        (doc) => doc.id !== docId && doc._id !== docId
      );
      setDocuments(updatedDocs);
      // recompute counts
      const counts = {};
      (soas || []).forEach((s) => (counts[s.id] = 0));
      (updatedDocs || []).forEach((d) => {
        const sid = d.soaId ?? d.soa?.id ?? d.soaIdString ?? null;
        if (sid != null) counts[sid] = (counts[sid] ?? 0) + 1;
      });
      setUploadedCounts(counts);
      alert("Document deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Error deleting document");
    }
  };

  // Preview logic unchanged
  const handlePreviewClick = (doc) => {
    setPreviewDoc(doc);

    // If the doc has a URL from the backend, show it in an iframe
    if (doc.url) {
      setPreviewContent(
        <iframe
          src={`https://cftoolbackend.duckdns.org${doc.url}`}
          style={{
            width: "100%",
            height: "500px",
            border: "1px solid #e9ecef",
            borderRadius: "8px",
          }}
          title="Document Preview"
        />
      );
    } else {
      // Fallback message if there’s no URL available
      setPreviewContent(
        "Document preview not available. File may not have a public URL."
      );
    }
  };

  // helper for uploaded count
  const getUploadedCount = (soaId) => uploadedCounts[soaId] ?? 0;

  // robust download: try to fetch as blob and force download, fallback to opening URL
  const handleDownload = async (doc) => {
    const url = doc.url ?? doc.fileUrl ?? doc.downloadUrl ?? doc.path ?? null;
    const filename = (doc.name ?? doc.title ?? "document").replace(/\s+/g, "_");
    if (!url) {
      alert("No download URL available for this document.");
      return;
    }

    try {
      // try fetch and use blob to force download (works cross-origin if CORS permits)
      const response = await fetch(url, { method: "GET", mode: "cors" });
      if (!response.ok) throw new Error("Network response not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // fallback: open in new tab/window (user can then save)
      console.warn("Blob download failed, falling back to open URL:", err);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // ---------------- SEARCH & SORT (frontend only) ----------------

  const filteredAndSortedSoas = useMemo(() => {
    let list = Array.isArray(soas) ? [...soas] : [];
    // search by documentRef
    if (soaSearch && soaSearch.trim() !== "") {
      const q = soaSearch.trim().toLowerCase();
      list = list.filter((s) => {
        const ref = Array.isArray(s.documentRef)
          ? s.documentRef.join(" ")
          : s.documentRef ?? "";
        return ref.toString().toLowerCase().includes(q);
      });
    }
    // sort
    if (soaSort === "date_newest" || soaSort === "date_oldest") {
      // SoA may not have createdAt; fallback to keep original order when missing
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

  const filteredAndSortedDocs = useMemo(() => {
    let list = Array.isArray(documents) ? [...documents] : [];
    // search by name/title
    if (docSearch && docSearch.trim() !== "") {
      const q = docSearch.trim().toLowerCase();
      list = list.filter((d) =>
        ((d.name ?? d.title ?? "") + "").toLowerCase().includes(q)
      );
    }
    // sort
    if (docSort === "name") {
      list.sort((a, b) => {
        const an = (a.name ?? a.title ?? "").toString().toLowerCase();
        const bn = (b.name ?? b.title ?? "").toString().toLowerCase();
        return an.localeCompare(bn);
      });
    } else if (docSort === "date_newest") {
      list.sort((a, b) => {
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bd - ad;
      });
    } else if (docSort === "date_oldest") {
      list.sort((a, b) => {
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ad - bd;
      });
    }
    return list;
  }, [documents, docSearch, docSort]);

  // pagination using filtered lists
  const indexOfLastSoA = currentPageSoA * itemsPerPage;
  const indexOfFirstSoA = indexOfLastSoA - itemsPerPage;
  const currentSoAs = filteredAndSortedSoas.slice(
    indexOfFirstSoA,
    indexOfLastSoA
  );
  const totalPagesSoA = Math.max(
    1,
    Math.ceil(filteredAndSortedSoas.length / itemsPerPage)
  );

  const indexOfLastDoc = currentPageDocs * itemsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - itemsPerPage;
  const currentDocuments = filteredAndSortedDocs.slice(
    indexOfFirstDoc,
    indexOfLastDoc
  );
  const totalPagesDocs = Math.max(
    1,
    Math.ceil(filteredAndSortedDocs.length / itemsPerPage)
  );

  // styles
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

  const paginationButtonStyle = {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "1px solid #007bff",
    margin: "0 4px",
    cursor: "pointer",
    fontWeight: "600",
    backgroundColor: "white",
    color: "#007bff",
    userSelect: "none",
    transition: "all 0.2s ease",
  };

  const activePageStyle = {
    backgroundColor: "#007bff",
    color: "white",
    cursor: "default",
  };
  const disabledButtonStyle = {
    backgroundColor: "#e9ecef",
    color: "#6c757d",
    cursor: "not-allowed",
    border: "1px solid #dee2e6",
  };

  // professional badge
  const smallCountStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "36px",
    height: "28px",
    padding: "0 10px",
    borderRadius: "14px",
    border: "1px solid #e6dba6",
    marginLeft: "10px",
    fontSize: "13px",
    fontWeight: "700",
    background: "#fffaf0",
    color: "#333",
    boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
  };

  // small helper for responsive table container
  const tableContainerStyle = { width: "100%", overflowX: "auto" };

  return (
    <div
      style={{ padding: "10px", maxWidth: "1200px", margin: "5px auto 20px" }}
    >
      {/* small responsive CSS (media queries) */}
      <style>
        {`
          @media (max-width: 880px) {
            .controls-row { flex-direction: column; gap: 10px; align-items: stretch; }
            .controls-left { width: 100%; display: flex; gap: 8px; flex-wrap: wrap; }
            .controls-right { width: 100%; text-align: left; margin-top: 6px; }
            .upload-input { max-width: 100% !important; flex: 1 1 auto; }
            .soa-upload-row { flex-direction: column; gap: 8px; align-items: stretch; }
            .soa-actions { justify-content: flex-start; }
            .small-count { margin-left: 6px !important; }
            table { font-size: 14px; }
          }

          @media (min-width: 881px) {
            .controls-row { flex-direction: row; }
          }
        `}
      </style>

      {/* Back to dashboard button */}
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

      {/* Header */}
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

      {/* ================= Upload Controls (SoA) ================= */}
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
          Showing {filteredAndSortedSoas.length} upload entries
        </div>
      </div>

      {/* SoA Upload Section */}
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
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "left",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                  }}
                >
                  Sl.No
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "left",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
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
                  }}
                >
                  Upload File
                </th>
              </tr>
            </thead>
            <tbody>
              {currentSoAs.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
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
                  const selected = selectedFiles[soaId];
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
                        }}
                      >
                        {indexOfFirstSoA + idx + 1}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#495057",
                          verticalAlign: "middle",
                        }}
                      >
                        {Array.isArray(soa.documentRef)
                          ? soa.documentRef.join(", ")
                          : soa.documentRef}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <div
                          className="soa-upload-row"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "12px",
                          }}
                        >
                          <input
                            className="upload-input"
                            type="file"
                            onChange={(e) =>
                              handleFileChange(soa.id, e.target.files)
                            }
                            style={{
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #ccc",
                              maxWidth: 320,
                              flex: "0 0 320px",
                            }}
                          />
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <button
                              onClick={() => handleUpload(soa.id)}
                              disabled={uploading[soa.id]} // prevent clicks while uploading
                              style={{
                                padding: "8px 14px",
                                borderRadius: "8px",
                                background: uploading[soa.id]
                                  ? "#95a5a6"
                                  : hasUploaded[soa.id]
                                  ? "#f9e79f"
                                  : "#3498db",
                                color: hasUploaded[soa.id] ? "#333" : "#fff",
                                border: "none",
                                cursor: uploading[soa.id]
                                  ? "not-allowed"
                                  : "pointer",
                                fontWeight: 700,
                                minWidth: 100,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                              }}
                              title={
                                uploading[soa.id]
                                  ? "Uploading..."
                                  : hasUploaded[soa.id]
                                  ? "Uploaded"
                                  : selectedFiles[soa.id]
                                  ? `${selectedFiles[soa.id].name} selected`
                                  : "Select file to upload"
                              }
                            >
                              {uploading[soa.id] ? (
                                <>
                                  <span
                                    className="spinner"
                                    style={{
                                      width: "16px",
                                      height: "16px",
                                      border: "2px solid #fff",
                                      borderTop: "2px solid transparent",
                                      borderRadius: "50%",
                                      animation: "spin 1s linear infinite",
                                    }}
                                  ></span>
                                  Uploading...
                                </>
                              ) : hasUploaded[soa.id] ? (
                                "Uploaded"
                              ) : (
                                "Upload"
                              )}
                            </button>

                            <span
                              className="small-count"
                              style={smallCountStyle}
                            >
                              {count ?? 0}
                            </span>
                            <style>
                              {`
                              @keyframes spin {
                                from {
                                  transform: rotate(0deg);
                                }
                                to {
                                  transform: rotate(360deg);
                                }
                              }
                              `}
                            </style>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* SoA Pagination */}
        {totalPagesSoA > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: 12,
            }}
          >
            <button
              onClick={() => setCurrentPageSoA((p) => Math.max(p - 1, 1))}
              disabled={currentPageSoA === 1}
              style={{
                ...paginationButtonStyle,
                ...(currentPageSoA === 1 ? disabledButtonStyle : {}),
              }}
            >
              ← Prev
            </button>

            {[...Array(totalPagesSoA).keys()].map((n) => {
              const pageNum = n + 1;
              const isActive = pageNum === currentPageSoA;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPageSoA(pageNum)}
                  style={{
                    ...paginationButtonStyle,
                    ...(isActive ? activePageStyle : {}),
                  }}
                  disabled={isActive}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPageSoA((p) => Math.min(p + 1, totalPagesSoA))
              }
              disabled={currentPageSoA === totalPagesSoA}
              style={{
                ...paginationButtonStyle,
                ...(currentPageSoA === totalPagesSoA
                  ? disabledButtonStyle
                  : {}),
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ================= Documents Controls (separate) ================= */}
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
            placeholder="Search uploaded documents..."
            value={docSearch}
            onChange={(e) => {
              setDocSearch(e.target.value);
              setCurrentPageDocs(1);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              minWidth: "220px",
            }}
          />
          <select
            value={docSort}
            onChange={(e) => setDocSort(e.target.value)}
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
          Showing {filteredAndSortedDocs.length} documents
        </div>
      </div>

      {/* Document List Section */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "40px",
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
          📋 Uploaded Documents
        </h2>

        <div style={tableContainerStyle}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "left",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                  }}
                >
                  Sl.No
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "left",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                  }}
                >
                  Document Name
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "left",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                  }}
                >
                  Uploaded Date
                </th>
                <th
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    borderBottom: "2px solid #e6e6e6",
                    fontWeight: 600,
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {currentDocuments.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      textAlign: "center",
                      padding: "18px",
                      color: "#7f8c8d",
                    }}
                  >
                    No documents found
                  </td>
                </tr>
              ) : (
                currentDocuments.map((doc, idx) => {
                  const docId = doc.id ?? doc._id ?? idx;
                  const displayName =
                    doc.name ?? doc.title ?? `Document ${docId}`;
                  return (
                    <tr
                      key={docId}
                      style={{ borderBottom: "1px solid #f1f1f1" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8f9fa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "white")
                      }
                    >
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#495057",
                          verticalAlign: "middle",
                        }}
                      >
                        {indexOfFirstDoc + idx + 1}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#495057",
                          verticalAlign: "middle",
                        }}
                      >
                        {displayName}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          color: "#495057",
                          verticalAlign: "middle",
                        }}
                      >
                        {doc.createdAt
                          ? new Date(doc.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            onClick={() => handlePreviewClick(doc)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              background: "#27ae60",
                              color: "white",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                            title="Preview"
                          >
                            👁️ Preview
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(doc);
                            }}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              background: "#4a90e2",
                              color: "white",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                            title="Download"
                          >
                            ⬇️ Download
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc.id ?? doc._id);
                            }}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              background: "#e74c3c",
                              color: "white",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                            title="Delete"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Documents Pagination */}
        {totalPagesDocs > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: 12,
            }}
          >
            <button
              onClick={() => setCurrentPageDocs((p) => Math.max(p - 1, 1))}
              disabled={currentPageDocs === 1}
              style={{
                ...paginationButtonStyle,
                ...(currentPageDocs === 1 ? disabledButtonStyle : {}),
              }}
            >
              ← Prev
            </button>

            {[...Array(totalPagesDocs).keys()].map((n) => {
              const pageNum = n + 1;
              const isActive = pageNum === currentPageDocs;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPageDocs(pageNum)}
                  style={{
                    ...paginationButtonStyle,
                    ...(isActive ? activePageStyle : {}),
                  }}
                  disabled={isActive}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPageDocs((p) => Math.min(p + 1, totalPagesDocs))
              }
              disabled={currentPageDocs === totalPagesDocs}
              style={{
                ...paginationButtonStyle,
                ...(currentPageDocs === totalPagesDocs
                  ? disabledButtonStyle
                  : {}),
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Preview modal (unchanged except styling) */}
      {previewDoc && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => {
            setPreviewDoc(null);
            setPreviewContent("");
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "30px",
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setPreviewDoc(null);
                setPreviewContent("");
              }}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                fontSize: "28px",
                cursor: "pointer",
                color: "#7f8c8d",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#2c3e50")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#7f8c8d")}
            >
              ×
            </button>

            <h2
              style={{
                marginBottom: "20px",
                color: "#2c3e50",
                fontSize: "24px",
                paddingRight: "40px",
              }}
            >
              📄 {previewDoc.name}
            </h2>

            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "20px",
                borderRadius: "8px",
                borderLeft: "4px solid #667eea",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <p style={{ marginBottom: "5px" }}>
                    <strong style={{ color: "#2c3e50" }}>
                      📅 Upload Date:
                    </strong>
                  </p>
                  <p style={{ color: "#7f8c8d" }}>
                    {previewDoc.createdAt
                      ? new Date(previewDoc.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p style={{ marginBottom: "5px" }}>
                    <strong style={{ color: "#2c3e50" }}>📝 File Type:</strong>
                  </p>
                  <p style={{ color: "#7f8c8d" }}>
                    {previewDoc.name?.split(".").pop()?.toUpperCase() || "N/A"}
                  </p>
                </div>
              </div>
              <div style={{ marginTop: "15px" }}>
                <p style={{ marginBottom: "5px" }}>
                  <strong style={{ color: "#2c3e50" }}>📦 File Size:</strong>
                </p>
                <p style={{ color: "#7f8c8d" }}>
                  {previewDoc.size
                    ? (previewDoc.size / 1024).toFixed(2) + " KB"
                    : "N/A"}
                </p>
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <h3
                style={{
                  color: "#2c3e50",
                  marginBottom: "15px",
                  fontSize: "16px",
                }}
              >
                📋 Document Preview:
              </h3>
              <div
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "6px",
                  border: "1px solid #e9ecef",
                  minHeight: "250px",
                  maxHeight: "400px",
                  overflow: "auto",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "#495057",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {previewContent || (
                  <p style={{ color: "#7f8c8d", fontStyle: "italic" }}>
                    Loading preview...
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button
                onClick={() => {
                  setPreviewDoc(null);
                  setPreviewContent("");
                }}
                style={{
                  padding: "10px 25px",
                  borderRadius: "6px",
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#5568d3";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#667eea";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLD;
