// import React, { useState, useEffect } from "react";
// import { useHistory } from "react-router-dom";
// import riskService from "../services/riskService";
// import documentationService from "../../documentation/services/documentationService";
// import { DOCUMENT_MAPPING } from "../../documentation/constants";
// import { CONTROL_MAPPING } from "../constants";
// import { getDepartments } from "../../departments/services/userService";

// const SavedRisksPage = () => {
//   const history = useHistory();
//   const [savedRisks, setSavedRisks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const risksPerPage = 3; // show 6 cards per page

//   const [departmentName, setDepartmentName] = useState("");

//   useEffect(() => {
//     loadSavedRisks();
//   }, []);

//   const loadSavedRisks = async () => {
//     try {
//       setLoading(true);

//       const user = JSON.parse(sessionStorage.getItem("user"));
//       if (!user) return;

//       // Fetch all risks
//       const risks = await riskService.getAllRisks();
//       if (!Array.isArray(risks)) {
//         setSavedRisks([]);
//         return;
//       }

//       // Use department name directly from user object
//       const deptName = user.department?.name || "";

//       // Filter risks by department
//       const departmentRisks = risks.filter(
//         (risk) => risk.department === deptName
//       );

//       setDepartmentName(deptName);
//       setSavedRisks(departmentRisks);
//     } catch (error) {
//       console.error("Error loading risks:", error);
//       setSavedRisks([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditRisk = (riskId) => {
//     history.push("/risk-assessment/add", { editRiskId: riskId });
//   };

//   const handleDeleteRisk = async (riskId) => {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this risk?"
//     );
//     if (!confirmed) return;

//     const success = await riskService.deleteRisk(riskId);
//     if (success) {
//       setSavedRisks((prev) => prev.filter((r) => r.riskId !== riskId));
//     }
//   };

//   const getRiskLevelColor = (riskLevel) => {
//     switch (riskLevel) {
//       case "Low":
//         return { bgColor: "#d5f4e6", color: "#155724" };
//       case "Medium":
//         return { bgColor: "#fef9e7", color: "#856404" };
//       case "High":
//         return { bgColor: "#fdf2e9", color: "#721c24" };
//       case "Critical":
//         return { bgColor: "#fadbd8", color: "#721c24" };
//       default:
//         return { bgColor: "#e9ecef", color: "#495057" };
//     }
//   };

//   const calculateRiskLevel = (risk) => {
//     const impact = Math.max(
//       parseInt(risk.confidentiality) || 0,
//       parseInt(risk.integrity) || 0,
//       parseInt(risk.availability) || 0
//     );
//     const probability = parseInt(risk.probability) || 0;
//     const riskScore = impact * probability;

//     if (riskScore <= 3) return "Low";
//     if (riskScore <= 8) return "Medium";
//     if (riskScore <= 12) return "High";
//     return "Critical";
//   };

//   const formatDate = (dateString) => {
//     try {
//       return new Date(dateString).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       });
//     } catch (error) {
//       return "Invalid Date";
//     }
//   };

//   // ✅ Safer comparator (handles numbers + letters like "A.5.1")
//   const compareControls = (a, b) => {
//     const aParts = a.split(".").map((p) => (isNaN(p) ? p : Number(p)));
//     const bParts = b.split(".").map((p) => (isNaN(p) ? p : Number(p)));

//     for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
//       const aVal = aParts[i] ?? 0;
//       const bVal = bParts[i] ?? 0;

//       if (typeof aVal === "number" && typeof bVal === "number") {
//         if (aVal !== bVal) return aVal - bVal;
//       } else {
//         const result = String(aVal).localeCompare(String(bVal));
//         if (result !== 0) return result;
//       }
//     }
//     return 0;
//   };

//   const getTaskAssignmentText = (risk) => {
//     if (!risk.date) return null;

//     const startDate = new Date(risk.date);
//     const today = new Date();

//     // Calculate difference in days
//     const diffTime = today - startDate; // milliseconds
//     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

//     if (diffDays < 0) {
//       // Future start date
//       return `📅 Task starts in ${Math.abs(diffDays)} day${
//         Math.abs(diffDays) !== 1 ? "s" : ""
//       }`;
//     }

//     if (risk.numberOfDays) {
//       const deadlineDate = new Date(startDate);
//       deadlineDate.setDate(deadlineDate.getDate() + Number(risk.numberOfDays));
//       const remaining = Math.floor(
//         (deadlineDate - today) / (1000 * 60 * 60 * 24)
//       );

//       if (remaining >= 0) {
//         return `📅 ${remaining} day${
//           remaining !== 1 ? "s" : ""
//         } left until deadline`;
//       } else {
//         return `📅 Deadline missed by ${Math.abs(remaining)} day${
//           Math.abs(remaining) !== 1 ? "s" : ""
//         }`;
//       }
//     }

//     // No numberOfDays → just show days since start
//     return `📅 Started ${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
//   };

//   const pageStyle = {
//     marginTop: "80px",
//     padding: "20px",
//     maxWidth: "1200px",
//     margin: "80px auto 0",
//   };

//   const headerStyle = {
//     background: "white",
//     borderRadius: "15px",
//     padding: "30px",
//     marginBottom: "30px",
//     boxShadow: "0 5px 20px rgba(0, 0, 0, 0.08)",
//     border: "1px solid #e9ecef",
//     textAlign: "center",
//   };

//   const riskGridStyle = {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
//     gap: "20px",
//   };

//   const riskCardStyle = {
//     background: "white",
//     borderRadius: "12px",
//     boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
//     padding: "25px",
//     border: "1px solid #e9ecef",
//     transition: "all 0.3s ease",
//     cursor: "pointer",
//   };

//   if (loading) {
//     return (
//       <div style={{ ...pageStyle, textAlign: "center", paddingTop: "100px" }}>
//         <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
//         <h2>Loading Saved Risk Assessments...</h2>
//       </div>
//     );
//   }
//   // Pagination logic
//   const indexOfLastRisk = currentPage * risksPerPage;
//   const indexOfFirstRisk = indexOfLastRisk - risksPerPage;
//   const currentRisks = savedRisks.slice(indexOfFirstRisk, indexOfLastRisk);
//   const totalPages = Math.ceil(savedRisks.length / risksPerPage);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div style={pageStyle}>
//       {/* Header */}
//       <div style={headerStyle}>
//         <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>
//           📁 Saved Risk Assessments
//         </h1>
//         <p style={{ color: "#7f8c8d", fontSize: "16px" }}>
//           View, edit, and manage your completed risk assessments
//         </p>
//       </div>
//      <button
//   onClick={() => history.push('/risk-assessment')}
//   style={{
//     position: 'fixed',
//     top: '20px',
//     left: '280px',
//     padding: '10px 22px',
//     borderRadius: '6px',
//     backgroundColor: '#005FCC',
//     border: 'none',
//     color: 'white',
//     cursor: 'pointer',
//     fontWeight: '600',
//     fontSize: '1rem',
//     boxShadow: '0 4px 8px rgba(0, 95, 204, 0.3)',
//     transition: 'all 0.3s ease',
//     display: 'inline-flex',
//     alignItems: 'center',
//     zIndex: 1000,
//   }}
//   onMouseEnter={e => {
//     e.currentTarget.style.backgroundColor = '#0046a3';
//     e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 70, 163, 0.5)';
//     e.currentTarget.style.transform = 'translateY(-2px)';
//   }}
//   onMouseLeave={e => {
//     e.currentTarget.style.backgroundColor = '#005FCC';
//     e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 95, 204, 0.3)';
//     e.currentTarget.style.transform = 'translateY(0)';
//   }}
// >
//   ← Back to Dashboard
// </button>

//       {/* Risk Cards */}
//       {savedRisks.length === 0 ? (
//         <div
//           style={{
//             textAlign: "center",
//             padding: "60px 20px",
//             background: "white",
//             borderRadius: "12px",
//             boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
//           }}
//         >
//           <div style={{ fontSize: "64px", marginBottom: "20px" }}>📋</div>
//           <h2 style={{ color: "#2c3e50", marginBottom: "15px" }}>
//             No Risks Assigned Yet
//           </h2>
//           <p style={{ color: "#7f8c8d", marginBottom: "25px" }}>
//             Keep up the good work
//           </p>
//           <button
//             onClick={() => history.push("/risk-assessment/add")}
//             style={{
//               background: "linear-gradient(45deg, #3498db, #2980b9)",
//               color: "white",
//               border: "none",
//               padding: "15px 30px",
//               borderRadius: "50px",
//               fontSize: "16px",
//               fontWeight: "600",
//               cursor: "pointer",
//               transition: "all 0.3s ease",
//             }}
//           >
//             🚀 Create First Risk Assessment
//           </button>
//         </div>
//       ) : (
//         <div style={riskGridStyle}>
//           {currentRisks.map((risk) => {
//             const riskLevel = calculateRiskLevel(risk);
//             const riskColors = getRiskLevelColor(riskLevel);

//             return (
//               <div
//                 key={risk.riskId}
//                 style={riskCardStyle}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = "translateY(-2px)";
//                   e.currentTarget.style.boxShadow =
//                     "0 8px 25px rgba(0, 0, 0, 0.15)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = "translateY(0)";
//                   e.currentTarget.style.boxShadow =
//                     "0 4px 15px rgba(0, 0, 0, 0.08)";
//                 }}
//               >
//                 {/* Card Header */}
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginBottom: "15px",
//                   }}
//                 >
//                   <h3 style={{ margin: 0, color: "#2c3e50", fontSize: "18px" }}>
//                     {risk.riskId}
//                   </h3>
//                   <span
//                     style={{
//                       ...riskColors,
//                       padding: "4px 12px",
//                       borderRadius: "20px",
//                       fontSize: "12px",
//                       fontWeight: "600",
//                       textTransform: "uppercase",
//                     }}
//                   >
//                     {riskLevel}
//                   </span>
//                 </div>

//                 {/* Card Content */}
//                 <div style={{ marginBottom: "15px" }}>
//                   <p
//                     style={{
//                       margin: "5px 0",
//                       fontSize: "14px",
//                       color: "#5d6d7e",
//                     }}
//                   >
//                     <strong>Department:</strong> {risk.department}
//                   </p>
//                   <p
//                     style={{
//                       margin: "5px 0",
//                       fontSize: "14px",
//                       color: "#5d6d7e",
//                     }}
//                   >
//                     <strong>Type:</strong> {risk.riskType}
//                   </p>
//                   <p
//                     style={{
//                       margin: "5px 0",
//                       fontSize: "14px",
//                       color: "#5d6d7e",
//                     }}
//                   >
//                     <strong>Asset Type:</strong> {risk.assetType}
//                   </p>
//                   <p
//                     style={{
//                       margin: "5px 0",
//                       fontSize: "14px",
//                       color: "#5d6d7e",
//                     }}
//                   >
//                     <strong>Asset:</strong> {risk.location}
//                   </p>
//                   <p
//                     style={{
//                       margin: "5px 0",
//                       fontSize: "14px",
//                       color: "#5d6d7e",
//                     }}
//                   >
//                     <strong>Date:</strong> {formatDate(risk.date)}
//                   </p>
//                 </div>

//                 {/* Risk Description */}
//                 <p
//                   style={{
//                     color: "#7f8c8d",
//                     fontSize: "13px",
//                     lineHeight: "1.4",
//                     marginBottom: "15px",
//                     height: "40px",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                     display: "-webkit-box",
//                     WebkitLineClamp: 2,
//                     WebkitBoxOrient: "vertical",
//                   }}
//                 >
//                   {risk.riskDescription}
//                 </p>

//                 {/* Treatment Plan Info */}
//                 {risk.controlReference && (
//                   <div
//                     style={{
//                       background: "rgba(230, 126, 34, 0.1)",
//                       padding: "10px",
//                       borderRadius: "6px",
//                       marginBottom: "10px",
//                     }}
//                   >
//                     <p
//                       style={{ margin: 0, fontSize: "12px", color: "#d35400" }}
//                     >
//                       🛡️ Control:{" "}
//                       {Array.isArray(risk.controlReference)
//                         ? risk.controlReference.join(", ").substring(0, 50) +
//                           "..."
//                         : risk.controlReference.substring(0, 50) + "..."}
//                     </p>
//                   </div>
//                 )}

//                 {/* Task Info */}
//                 {risk.date && (
//                   <div
//                     style={{
//                       background: "rgba(155, 89, 182, 0.1)",
//                       padding: "10px",
//                       borderRadius: "6px",
//                       marginBottom: "15px",
//                     }}
//                   >
//                     <p
//                       style={{ margin: 0, fontSize: "12px", color: "#8e44ad" }}
//                     >
//                       {getTaskAssignmentText(risk)}
//                     </p>
//                   </div>
//                 )}

//                 {/* Actions */}
//                 <div
//                   style={{
//                     display: "flex",
//                     gap: "10px",
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleEditRisk(risk.riskId);
//                     }}
//                     style={{
//                       flex: 1,
//                       background: "linear-gradient(45deg, #3498db, #2980b9)",
//                       color: "white",
//                       border: "none",
//                       padding: "8px 16px",
//                       borderRadius: "20px",
//                       fontSize: "12px",
//                       fontWeight: "600",
//                       cursor: "pointer",
//                       transition: "all 0.3s ease",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.target.style.transform = "translateY(-1px)";
//                     }}
//                     onMouseLeave={(e) => {
//                       e.target.style.transform = "translateY(0)";
//                     }}
//                   >
//                     ✏️ Edit
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleDeleteRisk(risk.riskId);
//                     }}
//                     style={{
//                       background: "transparent",
//                       color: "#e74c3c",
//                       border: "1px solid #e74c3c",
//                       padding: "8px 16px",
//                       borderRadius: "20px",
//                       fontSize: "12px",
//                       fontWeight: "600",
//                       cursor: "pointer",
//                       transition: "all 0.3s ease",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.target.style.background = "#e74c3c";
//                       e.target.style.color = "white";
//                     }}
//                     onMouseLeave={(e) => {
//                       e.target.style.background = "transparent";
//                       e.target.style.color = "#e74c3c";
//                     }}
//                   >
//                     🗑️ Delete
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//       {/* Pagination controls */}
//       {totalPages > 1 && (
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             marginTop: "30px",
//             gap: "10px",
//           }}
//         >
//           <button
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             style={{
//               padding: "8px 14px",
//               borderRadius: "6px",
//               border: "1px solid #007bff",
//               background: currentPage === 1 ? "#e9ecef" : "white",
//               color: currentPage === 1 ? "#6c757d" : "#007bff",
//               cursor: currentPage === 1 ? "not-allowed" : "pointer",
//             }}
//           >
//             Prev
//           </button>

//           {[...Array(totalPages).keys()].map((num) => (
//             <button
//               key={num}
//               onClick={() => paginate(num + 1)}
//               style={{
//                 padding: "8px 14px",
//                 borderRadius: "6px",
//                 border: "1px solid #007bff",
//                 backgroundColor: currentPage === num + 1 ? "#007bff" : "white",
//                 color: currentPage === num + 1 ? "white" : "#007bff",
//                 cursor: "pointer",
//               }}
//             >
//               {num + 1}
//             </button>
//           ))}

//           <button
//             onClick={() =>
//               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//             }
//             disabled={currentPage === totalPages}
//             style={{
//               padding: "8px 14px",
//               borderRadius: "6px",
//               border: "1px solid #007bff",
//               background: currentPage === totalPages ? "#e9ecef" : "white",
//               color: currentPage === totalPages ? "#6c757d" : "#007bff",
//               cursor: currentPage === totalPages ? "not-allowed" : "pointer",
//             }}
//           >
//             Next
//           </button>
//         </div>
//       )}

//       {/* Add New Button (Floating) */}
//       <div
//         style={{
//           position: "fixed",
//           bottom: "30px",
//           left: "30px",
//           zIndex: 100,
//         }}
//       >
//         <button
//           onClick={() => history.push("/risk-assessment/add")}
//           style={{
//             width: "60px",
//             height: "60px",
//             borderRadius: "50%",
//             background: "linear-gradient(45deg, #27ae60, #2ecc71)",
//             color: "white",
//             border: "none",
//             fontSize: "24px",
//             cursor: "pointer",
//             boxShadow: "0 4px 15px rgba(39, 174, 96, 0.3)",
//             transition: "all 0.3s ease",
//           }}
//           onMouseEnter={(e) => {
//             e.target.style.transform = "scale(1.1)";
//             e.target.style.boxShadow = "0 6px 20px rgba(39, 174, 96, 0.4)";
//           }}
//           onMouseLeave={(e) => {
//             e.target.style.transform = "scale(1)";
//             e.target.style.boxShadow = "0 4px 15px rgba(39, 174, 96, 0.3)";
//           }}
//           title="Add New Risk Assessment"
//         >
//           +
//         </button>
//       </div>

//       {/* Generate SoA Button (Floating) */}
//       <div
//         style={{
//           position: "fixed",
//           bottom: "30px",
//           right: "30px",
//           zIndex: 100,
//         }}
//       >
//         <button
//           onClick={async () => {
//             if (savedRisks.length === 0) {
//               alert("No risks available to generate SoA ❌");
//               return;
//             }

//             try {
//               for (const risk of savedRisks) {
//                 if (risk.controlReference) {
//                   // Normalize controlReference to an array
//                   let controlRefs = [];
//                   if (Array.isArray(risk.controlReference)) {
//                     controlRefs = risk.controlReference;
//                   } else if (typeof risk.controlReference === "string") {
//                     controlRefs = risk.controlReference
//                       .split(",")
//                       .map((ref) => ref.trim())
//                       .filter((ref) => ref.length > 0);
//                   }

//                   // ✅ This is where you should fetch existing controls
//                   // and skip ones that already exist
//                   const existingControls =
//                     await documentationService.getControls();
//                   const existingCategories = new Set(
//                     existingControls.map((c) => c.category)
//                   );

//                   // Deduplicate + Sort
//                   controlRefs = [...new Set(controlRefs)].sort(compareControls);

//                   for (const ref of controlRefs) {
//                     // Skip if already exists
//                     if (existingCategories.has(ref)) {
//                       console.log(`⚠️ Control ${ref} already exists, skipping`);
//                       continue;
//                     }

//                     const description =
//                       CONTROL_MAPPING[ref] || "No description available";

//                     const addedControl = await documentationService.addControl({
//                       category: ref,
//                       description,
//                     });

//                     const docRefs = DOCUMENT_MAPPING[ref] || ["N/A"];
//                     await documentationService.addSoAEntry({
//                       controlId: addedControl.id,
//                       category: addedControl.category,
//                       description: addedControl.description,
//                       status: "Planned",
//                       documentRef: docRefs,
//                       createdAt: new Date().toISOString(),
//                     });

//                     console.log(
//                       `✅ Added Control: ${ref} for Risk ${risk.riskId}`
//                     );
//                   }
//                 }
//               }

//               alert("Controls added to Control Library & SoA generated ✅");
//               history.push("/documentation/soa");
//             } catch (error) {
//               console.error("Error generating SoA:", error);
//               alert("⚠️ Failed to generate SoA. Check console.");
//             }
//           }}
//           style={{
//             padding: "12px 25px",
//             borderRadius: "50px",
//             background: "linear-gradient(45deg, #8e44ad, #9b59b6)",
//             color: "white",
//             border: "none",
//             fontSize: "16px",
//             fontWeight: "600",
//             cursor: "pointer",
//             boxShadow: "0 4px 15px rgba(155, 89, 182, 0.3)",
//             transition: "all 0.3s ease",
//           }}
//           title="Generate Statement of Applicability"
//         >
//           📄 Generate SoA
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SavedRisksPage;





import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import riskService from "../services/riskService";
import documentationService from "../../documentation/services/documentationService";
import { DOCUMENT_MAPPING } from "../../documentation/constants";
import { CONTROL_MAPPING } from "../constants";
import { getDepartments } from "../../departments/services/userService";

const SavedRisksPage = () => {
  const history = useHistory();
  const [savedRisks, setSavedRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const risksPerPage = 3;
  const [departmentName, setDepartmentName] = useState("");

  useEffect(() => {
    loadSavedRisks();
  }, []);

  const loadSavedRisks = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(sessionStorage.getItem("user"));
      if (!user) return;

      const risks = await riskService.getAllRisks();
      if (!Array.isArray(risks)) {
        setSavedRisks([]);
        return;
      }

      const deptName = user.department?.name || "";
      const departmentRisks = risks.filter(
        (risk) => risk.department === deptName
      );

      setDepartmentName(deptName);
      setSavedRisks(departmentRisks);
    } catch (error) {
      console.error("Error loading risks:", error);
      setSavedRisks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRisk = (riskId) => {
    history.push("/risk-assessment/add", { editRiskId: riskId });
  };

  const handleDeleteRisk = async (riskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this risk?"
    );
    if (!confirmed) return;

    const success = await riskService.deleteRisk(riskId);
    if (success) {
      setSavedRisks((prev) => prev.filter((r) => r.riskId !== riskId));
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case "Low":
        return { bgColor: "#d5f4e6", color: "#155724" };
      case "Medium":
        return { bgColor: "#fef9e7", color: "#856404" };
      case "High":
        return { bgColor: "#fdf2e9", color: "#721c24" };
      case "Critical":
        return { bgColor: "#fadbd8", color: "#721c24" };
      default:
        return { bgColor: "#e9ecef", color: "#495057" };
    }
  };

  const calculateRiskLevel = (risk) => {
    const impact = Math.max(
      parseInt(risk.confidentiality) || 0,
      parseInt(risk.integrity) || 0,
      parseInt(risk.availability) || 0
    );
    const probability = parseInt(risk.probability) || 0;
    const riskScore = impact * probability;

    if (riskScore <= 3) return "Low";
    if (riskScore <= 8) return "Medium";
    if (riskScore <= 12) return "High";
    return "Critical";
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const compareControls = (a, b) => {
    const aParts = a.split(".").map((p) => (isNaN(p) ? p : Number(p)));
    const bParts = b.split(".").map((p) => (isNaN(p) ? p : Number(p)));

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] ?? 0;
      const bVal = bParts[i] ?? 0;

      if (typeof aVal === "number" && typeof bVal === "number") {
        if (aVal !== bVal) return aVal - bVal;
      } else {
        const result = String(aVal).localeCompare(String(bVal));
        if (result !== 0) return result;
      }
    }
    return 0;
  };

  const getTaskAssignmentText = (risk) => {
    if (!risk.date) return null;

    const startDate = new Date(risk.date);
    const today = new Date();

    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `📅 Task starts in ${Math.abs(diffDays)} day${
        Math.abs(diffDays) !== 1 ? "s" : ""
      }`;
    }

    if (risk.numberOfDays) {
      const deadlineDate = new Date(startDate);
      deadlineDate.setDate(deadlineDate.getDate() + Number(risk.numberOfDays));
      const remaining = Math.floor(
        (deadlineDate - today) / (1000 * 60 * 60 * 24)
      );

      if (remaining >= 0) {
        return `📅 ${remaining} day${
          remaining !== 1 ? "s" : ""
        } left until deadline`;
      } else {
        return `📅 Deadline missed by ${Math.abs(remaining)} day${
          Math.abs(remaining) !== 1 ? "s" : ""
        }`;
      }
    }

    return `📅 Started ${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  const pageStyle = {
    marginTop: "80px",
    padding: "20px",
    maxWidth: "1200px",
    margin: "80px auto 0",
  };

  const headerStyle = {
    background: "white",
    borderRadius: "15px",
    padding: "30px",
    marginBottom: "30px",
    boxShadow: "0 5px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e9ecef",
    textAlign: "center",
  };

  const riskGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "20px",
  };

  const riskCardStyle = {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
    padding: "25px",
    border: "1px solid #e9ecef",
    transition: "all 0.3s ease",
    cursor: "pointer",
  };

  // NEW: Pagination button styles
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

  // Fixed "Back to Dashboard" button styles (NEW)
  const backBtnStyle = {
    position: "fixed",
    top: "35px",
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

  if (loading) {
    return (
      <div style={{ ...pageStyle, textAlign: "center", paddingTop: "100px" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
        <h2>Loading Saved Risk Assessments...</h2>
      </div>
    );
  }

  // Pagination logic
  const indexOfLastRisk = currentPage * risksPerPage;
  const indexOfFirstRisk = indexOfLastRisk - risksPerPage;
  const currentRisks = savedRisks.slice(indexOfFirstRisk, indexOfLastRisk);
  const totalPages = Math.ceil(savedRisks.length / risksPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div style={pageStyle}>
      {/* NEW: Back to Dashboard Button */}
      <button
        style={backBtnStyle}
        onClick={() => history.push("/risk-assessment"

        )}
        onMouseEnter={handleBackBtnMouseEnter}
        onMouseLeave={handleBackBtnMouseLeave}
      >
        ← Back to Dashboard
      </button>

      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>
          📁 Saved Risk Assessments
        </h1>
        <p style={{ color: "#7f8c8d", fontSize: "16px" }}>
          View, edit, and manage your completed risk assessments
        </p>
      </div>

      {/* Risk Cards */}
      {savedRisks.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>📋</div>
          <h2 style={{ color: "#2c3e50", marginBottom: "15px" }}>
            No Risks Assigned Yet
          </h2>
          <p style={{ color: "#7f8c8d", marginBottom: "25px" }}>
            Keep up the good work
          </p>
          <button
            onClick={() => history.push("/risk-assessment/add")}
            style={{
              background: "linear-gradient(45deg, #3498db, #2980b9)",
              color: "white",
              border: "none",
              padding: "15px 30px",
              borderRadius: "50px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            🚀 Create First Risk Assessment
          </button>
        </div>
      ) : (
        <div>
          <div style={riskGridStyle}>
            {currentRisks.map((risk) => {
              const riskLevel = calculateRiskLevel(risk);
              const riskColors = getRiskLevelColor(riskLevel);

              return (
                <div
                  key={risk.riskId}
                  style={riskCardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 25px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 15px rgba(0, 0, 0, 0.08)";
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <h3 style={{ margin: 0, color: "#2c3e50", fontSize: "18px" }}>
                      {risk.riskId}
                    </h3>
                    <span
                      style={{
                        ...riskColors,
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      {riskLevel}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div style={{ marginBottom: "15px" }}>
                    <p
                      style={{
                        margin: "5px 0",
                        fontSize: "14px",
                        color: "#5d6d7e",
                      }}
                    >
                      <strong>Department:</strong> {risk.department}
                    </p>
                    <p
                      style={{
                        margin: "5px 0",
                        fontSize: "14px",
                        color: "#5d6d7e",
                      }}
                    >
                      <strong>Type:</strong> {risk.riskType}
                    </p>
                    <p
                      style={{
                        margin: "5px 0",
                        fontSize: "14px",
                        color: "#5d6d7e",
                      }}
                    >
                      <strong>Asset Type:</strong> {risk.assetType}
                    </p>
                    <p
                      style={{
                        margin: "5px 0",
                        fontSize: "14px",
                        color: "#5d6d7e",
                      }}
                    >
                      <strong>Asset:</strong> {risk.location}
                    </p>
                    <p
                      style={{
                        margin: "5px 0",
                        fontSize: "14px",
                        color: "#5d6d7e",
                      }}
                    >
                      <strong>Date:</strong> {formatDate(risk.date)}
                    </p>
                  </div>

                  {/* Risk Description */}
                  <p
                    style={{
                      color: "#7f8c8d",
                      fontSize: "13px",
                      lineHeight: "1.4",
                      marginBottom: "15px",
                      height: "40px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {risk.riskDescription}
                  </p>

                  {/* Treatment Plan Info */}
                  {risk.controlReference && (
                    <div
                      style={{
                        background: "rgba(230, 126, 34, 0.1)",
                        padding: "10px",
                        borderRadius: "6px",
                        marginBottom: "10px",
                      }}
                    >
                      <p
                        style={{ margin: 0, fontSize: "12px", color: "#d35400" }}
                      >
                        🛡️ Control:{" "}
                        {Array.isArray(risk.controlReference)
                          ? risk.controlReference.join(", ").substring(0, 50) +
                            "..."
                          : risk.controlReference.substring(0, 50) + "..."}
                      </p>
                    </div>
                  )}

                  {/* Task Info */}
                  {risk.date && (
                    <div
                      style={{
                        background: "rgba(155, 89, 182, 0.1)",
                        padding: "10px",
                        borderRadius: "6px",
                        marginBottom: "15px",
                      }}
                    >
                      <p
                        style={{ margin: 0, fontSize: "12px", color: "#8e44ad" }}
                      >
                        {getTaskAssignmentText(risk)}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      justifyContent: "space-between",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRisk(risk.riskId);
                      }}
                      style={{
                        flex: 1,
                        background: "linear-gradient(45deg, #3498db, #2980b9)",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRisk(risk.riskId);
                      }}
                      style={{
                        background: "transparent",
                        color: "#e74c3c",
                        border: "1px solid #e74c3c",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#e74c3c";
                        e.target.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.color = "#e74c3c";
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* NEW: Improved Pagination controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "30px",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  ...paginationButtonStyle,
                  ...(currentPage === 1 ? disabledButtonStyle : {}),
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
                    e.target.style.color = "#007bff";
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
                    style={{
                      ...paginationButtonStyle,
                      ...(isActive ? activePageStyle : {}),
                    }}
                    disabled={isActive}
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                style={{
                  ...paginationButtonStyle,
                  ...(currentPage === totalPages ? disabledButtonStyle : {}),
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
                    e.target.style.color = "#007bff";
                  }
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add New Button (Floating) */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          left: "30px",
          zIndex: 100,
        }}
      >
        <button
          onClick={() => history.push("/risk-assessment/add")}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(45deg, #27ae60, #2ecc71)",
            color: "white",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(39, 174, 96, 0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.1)";
            e.target.style.boxShadow = "0 6px 20px rgba(39, 174, 96, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 4px 15px rgba(39, 174, 96, 0.3)";
          }}
          title="Add New Risk Assessment"
        >
          +
        </button>
      </div>

      {/* Generate SoA Button (Floating) */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 100,
        }}
      >
        <button
          onClick={async () => {
            if (savedRisks.length === 0) {
              alert("No risks available to generate SoA ❌");
              return;
            }

            try {
              for (const risk of savedRisks) {
                if (risk.controlReference) {
                  let controlRefs = [];
                  if (Array.isArray(risk.controlReference)) {
                    controlRefs = risk.controlReference;
                  } else if (typeof risk.controlReference === "string") {
                    controlRefs = risk.controlReference
                      .split(",")
                      .map((ref) => ref.trim())
                      .filter((ref) => ref.length > 0);
                  }

                  const existingControls =
                    await documentationService.getControls();
                  const existingCategories = new Set(
                    existingControls.map((c) => c.category)
                  );

                  controlRefs = [...new Set(controlRefs)].sort(compareControls);

                  for (const ref of controlRefs) {
                    if (existingCategories.has(ref)) {
                      console.log(`⚠️ Control ${ref} already exists, skipping`);
                      continue;
                    }

                    const description =
                      CONTROL_MAPPING[ref] || "No description available";

                    const addedControl = await documentationService.addControl({
                      category: ref,
                      description,
                    });

                    const docRefs = DOCUMENT_MAPPING[ref] || ["N/A"];
                    await documentationService.addSoAEntry({
                      controlId: addedControl.id,
                      category: addedControl.category,
                      description: addedControl.description,
                      status: "Planned",
                      documentRef: docRefs,
                      createdAt: new Date().toISOString(),
                    });

                    console.log(
                      `✅ Added Control: ${ref} for Risk ${risk.riskId}`
                    );
                  }
                }
              }

              alert("Controls added to Control Library & SoA generated ✅");
              history.push("/documentation/soa");
            } catch (error) {
              console.error("Error generating SoA:", error);
              alert("⚠️ Failed to generate SoA. Check console.");
            }
          }}
          style={{
            padding: "12px 25px",
            borderRadius: "50px",
            background: "linear-gradient(45deg, #8e44ad, #9b59b6)",
            color: "white",
            border: "none",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(155, 89, 182, 0.3)",
            transition: "all 0.3s ease",
          }}
          title="Generate Statement of Applicability"
        >
          📄 Generate SoA
        </button>
      </div>
    </div>
  );
};

export default SavedRisksPage;
