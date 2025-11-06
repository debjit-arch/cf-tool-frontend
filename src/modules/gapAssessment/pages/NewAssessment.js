// import React, { useEffect, useState } from "react";
// import { useHistory } from "react-router-dom";
// import documentationService from "../../documentation/services/documentationService";
// import gapService from "../services/gapService"; // ✅ Import gap service

// const NewAssessment = () => {
//   const [documents, setDocuments] = useState([]);
//   const [gaps, setGaps] = useState({});
//   const [selectedDoc, setSelectedDoc] = useState(null);

//   const history = useHistory()

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const docs = await documentationService.getDocuments();
//         const gapData = await gapService.getGaps();

//         // Convert gap array to object for fast lookup: { docId: status }
//         const gapMap = (gapData || []).reduce((acc, gap) => {
//           acc[gap.docId] = gap.status;
//           return acc;
//         }, {});

//         setDocuments(docs || []);
//         setGaps(gapMap);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };
//     fetchData();
//   }, []);

//   const updateStatus = async (doc, newStatus) => {
//     try {
//       setGaps((prev) => ({ ...prev, [doc.id]: newStatus })); // set immediately (UI shows Checking...)

//       if (newStatus === "Checking...") {
//         // Call backend compliance check
//         const result = await gapService.checkCompliance(doc.id); // returns { score: 85 }

//         // Save final status as Score
//         setGaps((prev) => ({ ...prev, [doc.id]: `Score: ${result.score}` }));
//       } else {
//         // For normal statuses
//         await gapService.updateGap(doc.id, { status: newStatus });
//         setGaps((prev) => ({ ...prev, [doc.id]: newStatus }));
//       }
//     } catch (error) {
//       console.error("Error updating status:", error);
//       setGaps((prev) => ({ ...prev, [doc.id]: "Error" }));
//     }
//   };

//   const handleMarkVerification = (doc) => {
//     updateStatus(doc, "Checking...");
//   };

//   const handleApprove = (doc) => {
//     updateStatus(doc, "Closed");
//   };

//   const handleReject = (doc) => {
//     updateStatus(doc, "Rejected");
//   };

//   return (
//     <div
//       style={{
//         marginTop: "60px",
//         padding: "15px",
//         maxWidth: "900px",
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
//           📝 New Assessment
//         </h1>
//         <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
//           Review uploaded documents, mark for verification, approve or reject.
//         </p>
//       </div>

//       {/* Document Table */}
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
//             <th style={thStyle}>Sl.No</th>
//             <th style={thStyle}>Document Name</th>
//             <th style={thStyle}>Uploaded Date</th>
//             <th style={thStyle}>Status</th>
//             <th style={thStyle}>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {documents.length === 0 ? (
//             <tr>
//               <td colSpan="5" style={{ textAlign: "center", padding: "12px" }}>
//                 No documents found
//               </td>
//             </tr>
//           ) : (
//             documents.map((doc, index) => (
//               <tr key={doc.id}>
//                 <td style={tdStyle}>{index + 1}</td>
//                 <td style={tdStyle}>{doc.name || "Unnamed Document"}</td>
//                 <td style={tdStyle}>
//                   {doc.createdAt
//                     ? new Date(doc.createdAt).toLocaleDateString()
//                     : "N/A"}
//                 </td>
//                 <td style={tdStyle}>
//                   <span
//                     style={{
//                       padding: "4px 8px",
//                       borderRadius: "6px",
//                       background: gaps[doc.id]?.startsWith("Score")
//                         ? "#2980b9" // blue for score
//                         : gaps[doc.id] === "Closed"
//                         ? "#2ecc71"
//                         : gaps[doc.id] === "Pending" ||
//                           gaps[doc.id] === "Checking..."
//                         ? "#f39c12"
//                         : gaps[doc.id] === "Rejected"
//                         ? "#e74c3c"
//                         : "#bdc3c7",
//                       color: "white",
//                       fontSize: "12px",
//                     }}
//                   >
//                     {gaps[doc.id] || "Open"}
//                   </span>
//                 </td>
//                 <td style={tdStyle}>
//                   <button
//                     onClick={() => handleMarkVerification(doc)}
//                     style={btnStyle("#f39c12")}
//                   >
//                     Verify
//                   </button>
//                   <button
//                     onClick={() => setSelectedDoc(doc)}
//                     style={btnStyle("#3498db")}
//                   >
//                     View
//                   </button>
//                   <button
//                     onClick={() => handleApprove(doc)}
//                     style={btnStyle("#2ecc71")}
//                   >
//                     Approve
//                   </button>
//                   <button
//                     onClick={() => handleReject(doc)}
//                     style={btnStyle("#e74c3c")}
//                   >
//                     Reject
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
//           onClick={() => history.push("/documentation/mld")}
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
//           title="Go to MLD"
//         >
//           MLD
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
//           onClick={() => history.push("/gap-assessment/history")}
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
//           title="Go to History"
//         >
//           🚀 Go to History
//         </button>
//       </div>
//       {/* Modal for Viewing Document */}
//       {selectedDoc && (
//         <div style={modalOverlay} onClick={() => setSelectedDoc(null)}>
//           <div style={modalBox} onClick={(e) => e.stopPropagation()}>
//             <h2 style={{ marginBottom: "15px" }}>{selectedDoc.name}</h2>
//             <iframe
//               src={`https://cftoolbackend.duckdns.org${selectedDoc.url}`}
//               style={{
//                 width: "100%",
//                 height: "500px",
//                 border: "1px solid #e9ecef",
//                 borderRadius: "8px",
//               }}
//               title="Document Preview"
//             />
//             <button
//               onClick={() => setSelectedDoc(null)}
//               style={btnStyle("#e74c3c")}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // 🔧 Small styles extracted for reusability
// const thStyle = {
//   padding: "12px",
//   borderBottom: "1px solid #e9ecef",
//   background: "#f8f9fa",
// };

// const tdStyle = {
//   padding: "12px",
//   borderBottom: "1px solid #e9ecef",
// };

// const btnStyle = (bgColor) => ({
//   padding: "6px 12px",
//   marginRight: "8px",
//   borderRadius: "6px",
//   background: bgColor,
//   color: "white",
//   border: "none",
//   cursor: "pointer",
// });

// const modalOverlay = {
//   position: "fixed",
//   top: 0,
//   left: 0,
//   width: "100%",
//   height: "100%",
//   background: "rgba(0, 0, 0, 0.6)",
//   display: "flex",
//   justifyContent: "center",
//   alignItems: "center",
//   zIndex: 1000,
// };

// const modalBox = {
//   background: "white",
//   borderRadius: "12px",
//   padding: "20px",
//   width: "80%",
//   maxWidth: "700px",
//   boxShadow: "0 3px 12px rgba(0,0,0,0.2)",
//   position: "relative",
// };

// export default NewAssessment;



import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import documentationService from "../../documentation/services/documentationService";
import gapService from "../services/gapService";

const NewAssessment = () => {
  const [documents, setDocuments] = useState([]);
  const [gaps, setGaps] = useState({});
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 5;

  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docs = await documentationService.getDocuments();
        const gapData = await gapService.getGaps();

        const gapMap = (gapData || []).reduce((acc, gap) => {
          acc[gap.docId] = gap.status;
          return acc;
        }, {});

        setDocuments(docs || []);
        setGaps(gapMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Pagination logic
  const indexOfLastDoc = currentPage * documentsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - documentsPerPage;
  const currentDocuments = documents.slice(indexOfFirstDoc, indexOfLastDoc);
  const totalPages = Math.ceil(documents.length / documentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const updateStatus = async (doc, newStatus) => {
    try {
      setGaps((prev) => ({ ...prev, [doc.id]: newStatus }));

      if (newStatus === "Checking...") {
        const result = await gapService.checkCompliance(doc.id);
        setGaps((prev) => ({ ...prev, [doc.id]: `Score: ${result.score}` }));
      } else {
        await gapService.updateGap(doc.id, { status: newStatus });
        setGaps((prev) => ({ ...prev, [doc.id]: newStatus }));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setGaps((prev) => ({ ...prev, [doc.id]: "Error" }));
    }
  };

  const handleMarkVerification = (doc) => {
    updateStatus(doc, "Checking...");
  };

  const handleApprove = (doc) => {
    updateStatus(doc, "Closed");
  };

  const handleReject = (doc) => {
    updateStatus(doc, "Rejected");
  };

  // Back to Dashboard button styles and handlers
  const backBtnStyle = {
    position: "fixed",
    top: "35px",
    right: "30px",
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

  const handleBackBtnMouseEnter = (e) => {
    e.target.style.backgroundColor = "#0046a3";
    e.target.style.boxShadow = "0 6px 12px rgba(0, 70, 163, 0.5)";
    e.target.style.transform = "translateY(-2px)";
  };

  const handleBackBtnMouseLeave = (e) => {
    e.target.style.backgroundColor = "#005FCC";
    e.target.style.boxShadow = "0 4px 8px rgba(0, 95, 204, 0.3)";
    e.target.style.transform = "translateY(0)";
  };

  return (
    <div style={{ marginTop: "60px", padding: "15px", maxWidth: "900px", margin: "60px auto 0" }}>
      {/* Back to Dashboard Button */}
      <button
        style={backBtnStyle}
        onClick={() => history.push("/gap-assessment")}
        onMouseEnter={handleBackBtnMouseEnter}
        onMouseLeave={handleBackBtnMouseLeave}
        title="Back to Dashboard"
      >
        ← Back to Dashboard
      </button>

      {/* Header */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 3px 12px rgba(0, 0, 0, 0.06)",
          border: "1px solid #e9ecef",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#2c3e50", marginBottom: "8px", fontSize: "22px" }}>
          📝 New Assessment
        </h1>
        <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
          Review uploaded documents, mark for verification, approve or reject.
        </p>
      </div>

      {/* Responsive Table Container */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            minWidth: "600px",
            borderCollapse: "collapse",
            background: "white",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Sl.No</th>
              <th style={thStyle}>Document Name</th>
              <th style={thStyle}>Uploaded Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentDocuments.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "12px" }}>
                  No documents found
                </td>
              </tr>
            ) : (
              currentDocuments.map((doc, index) => (
                <tr key={doc.id}>
                  <td style={tdStyle}>{indexOfFirstDoc + index + 1}</td>
                  <td style={tdStyle}>{doc.name || "Unnamed Document"}</td>
                  <td style={tdStyle}>
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        background: gaps[doc.id]?.startsWith("Score")
                          ? "#2980b9"
                          : gaps[doc.id] === "Closed"
                          ? "#2ecc71"
                          : gaps[doc.id] === "Pending" || gaps[doc.id] === "Checking..."
                          ? "#f39c12"
                          : gaps[doc.id] === "Rejected"
                          ? "#e74c3c"
                          : "#bdc3c7",
                        color: "white",
                        fontSize: "12px",
                      }}
                    >
                      {gaps[doc.id] || "Open"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        justifyContent: "flex-start",
                        alignItems: "center",
                      }}
                    >
                      <button
                        onClick={() => handleMarkVerification(doc)}
                        style={{ ...btnStyle("#f39c12"), minWidth: "70px", padding: "6px 10px" }}
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        style={{ ...btnStyle("#3498db"), minWidth: "70px", padding: "6px 10px" }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleApprove(doc)}
                        style={{ ...btnStyle("#2ecc71"), minWidth: "70px", padding: "6px 10px" }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(doc)}
                        style={{ ...btnStyle("#e74c3c"), minWidth: "70px", padding: "6px 10px" }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "20px",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #3498db",
              margin: "0 4px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              fontWeight: "600",
              backgroundColor: currentPage === 1 ? "#e9ecef" : "white",
              color: currentPage === 1 ? "#6c757d" : "#3498db",
              userSelect: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.target.style.backgroundColor = "#0056b3";
                e.target.style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.target.style.backgroundColor = "white";
                e.target.style.color = "#3498db";
              }
            }}
          >
            ← Prev
          </button>
          {[...Array(totalPages).keys()].map((num) => {
            const pageNum = num + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => paginate(pageNum)}
                disabled={isActive}
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid #3498db",
                  margin: "0 4px",
                  cursor: isActive ? "default" : "pointer",
                  fontWeight: "600",
                  backgroundColor: isActive ? "#3498db" : "white",
                  color: isActive ? "white" : "#3498db",
                  userSelect: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = "#e7f1ff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = "white";
                  }
                }}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #3498db",
              margin: "0 4px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              fontWeight: "600",
              backgroundColor: currentPage === totalPages ? "#e9ecef" : "white",
              color: currentPage === totalPages ? "#6c757d" : "#3498db",
              userSelect: "none",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.target.style.backgroundColor = "#0056b3";
                e.target.style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages) {
                e.target.style.backgroundColor = "white";
                e.target.style.color = "#3498db";
              }
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Modal for Viewing Document */}
      {selectedDoc && (
        <div style={modalOverlay} onClick={() => setSelectedDoc(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "15px" }}>{selectedDoc.name}</h2>
            <iframe
              src={`https://cftoolbackend.duckdns.org${selectedDoc.url}`}
              style={{
                width: "100%",
                height: "500px",
                border: "1px solid #e9ecef",
                borderRadius: "8px",
              }}
              title="Document Preview"
            />
            <button onClick={() => setSelectedDoc(null)} style={btnStyle("#e74c3c")}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  padding: "12px",
  borderBottom: "1px solid #e9ecef",
  background: "#f8f9fa",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #e9ecef",
};

const btnStyle = (bgColor) => ({
  padding: "6px 12px",
  marginRight: "8px",
  borderRadius: "6px",
  background: bgColor,
  color: "white",
  border: "none",
  cursor: "pointer",
});

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalBox = {
  background: "white",
  borderRadius: "12px",
  padding: "20px",
  width: "80%",
  maxWidth: "700px",
  boxShadow: "0 3px 12px rgba(0,0,0,0.2)",
  position: "relative",
};

export default NewAssessment;
