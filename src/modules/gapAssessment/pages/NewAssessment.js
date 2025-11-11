import React, { useEffect, useState } from "react";
import { ISO_27001_CLAUSES, ISO_27001_CONTROL } from "../constant";
import {
  Upload,
  Eye,
  X,
  FileText,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";
import gapService from "../services/gapService";

const NewAssessment = () => {
  const [rows, setRows] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("employee");

  // Load logged-in user
  useEffect(() => {
    const rawUser = sessionStorage.getItem("user");
    if (rawUser) {
      const parsedUser = JSON.parse(rawUser);
      setUser(parsedUser);
      setUserRole(parsedUser.role || "employee");
    }
  }, []);

  // Build rows from constants filtered by department
  useEffect(() => {
    if (!user) return;
    const combined = [...ISO_27001_CLAUSES, ...ISO_27001_CONTROL];
    const filtered = combined
      .flatMap((item) =>
        item.auditQuestions.map((q) => ({
          clause: item.clause,
          standardRequirement: item.standardRequirement,
          question: typeof q === "string" ? q : q.text || q,
          departments:
            item.departments?.map((d) =>
              typeof d === "string" ? d : d.name
            ) || [],
          documentEvidence: null,
          practiceEvidence: null,
          practiceEvidenceText: "",
          docScore: "",
          practiceScore: "",
          docRemarks: "",
          practiceRemarks: "",
          gapId: null,
        }))
      )
      .filter((row) =>
        !user.department?.name
          ? true
          : row.departments.includes(user.department.name)
      );
    setRows(filtered);
  }, [user]);

  // Fetch gaps from backend
  useEffect(() => {
    const fetchGaps = async () => {
      try {
        const gaps = await gapService.getGaps();
        setRows((prev) =>
          prev.map((row) => {
            const gap = gaps.find(
              (g) => g.clause === row.clause && g.question === row.question
            );
            return gap
              ? {
                  ...row,
                  documentEvidence: gap.documentURL || null,
                  practiceEvidence: gap.practiceEvidence || null,
                  practiceEvidenceText: gap.practiceEvidenceText || "",
                  docScore: gap.docScore || "",
                  practiceScore: gap.practiceScore || "",
                  docRemarks: gap.docRemarks || "",
                  practiceRemarks: gap.practiceRemarks || "",
                  gapId: gap._id,
                }
              : row;
          })
        );
      } catch (err) {
        console.error("Failed to fetch gaps:", err);
      }
    };
    fetchGaps();
  }, []);

  // Generic input handler
  const handleInputChange = (i, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[i][field] = value;
      return updated;
    });
  };

  // Document upload
  const handleFileChange = async (i, file) => {
    if (!file) return;
    try {
      const url = await gapService.uploadFile(file);
      setRows((prev) => {
        const updated = [...prev];
        updated[i].documentEvidence = url;
        return updated;
      });
      const saved = await gapService.saveEntry({
        ...rows[i],
        documentURL: url,
        createdBy: user?.id,
      });
      handleInputChange(i, "gapId", saved._id);
    } catch {
      alert("Upload failed");
    }
  };

  // Practice file upload
  const handlePracticeFileChange = async (i, file) => {
    if (!file) return;
    try {
      const url = await gapService.uploadFile(file);
      setRows((prev) => {
        const updated = [...prev];
        updated[i].practiceEvidence = url;
        return updated;
      });
      const saved = await gapService.saveEntry({
        ...rows[i],
        practiceEvidence: url,
        createdBy: user?.id,
      });
      handleInputChange(i, "gapId", saved._id);
    } catch {
      alert("Upload failed");
    }
  };

  const handleDeleteFile = async (i, field) => {
    const row = rows[i];
    const fileUrl = row[field];

    if (!fileUrl) return;
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    // Map frontend field names to backend fields
    const backendFieldMap = {
      documentEvidence: "documentURL",
      practiceEvidence: "practiceEvidence",
    };
    const backendField = backendFieldMap[field];
    if (!backendField) {
      console.error("Unknown field:", field);
      return;
    }

    try {
      await gapService.deleteDocumentByUrl(fileUrl, backendField);

      // Update UI state
      setRows((prev) => {
        const updated = [...prev];
        updated[i][field] = null;
        return updated;
      });

      alert("File deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting file");
    }
  };

  // Save practice text on blur
  const handlePracticeBlur = async (i) => {
    const r = rows[i];
    if (!r.practiceEvidenceText) return;
    try {
      const saved = await gapService.saveEntry({
        ...r,
        createdBy: user?.id,
      });
      handleInputChange(i, "gapId", saved._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Auditor score/remark updates
  const handleAuditorChange = async (i, field, value) => {
    const r = rows[i];
    handleInputChange(i, field, value);
    if (!r.gapId) return;
    try {
      await gapService.updateEntry(r.gapId, {
        ...r,
        [field]: value,
        verifiedBy: user?.id,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Group by clause
  const grouped = rows.reduce((acc, r, idx) => {
    if (!acc[r.clause]) acc[r.clause] = [];
    acc[r.clause].push({ ...r, idx });
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="text-blue-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">New Assessment</h2>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-gray-700">
        Logged in as: <strong>{user?.name || "Unknown"}</strong> | Role:{" "}
        <strong className="capitalize">{userRole}</strong> | Department:{" "}
        <strong>{user?.department?.name || "N/A"}</strong>
      </div>

      {Object.keys(grouped).map((clause, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden"
        >
          <div className="bg-blue-100 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <FileText className="text-blue-600" size={20} />
            <div>
              <h3 className="font-semibold text-gray-800">{clause}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {grouped[clause][0].standardRequirement}
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {grouped[clause].map((row) => (
              <div
                key={row.idx}
                className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm"
              >
                {/* Document Evidence */}
                <div>
                  <p className="font-medium text-gray-800 mb-1">
                    {row.question}
                  </p>
                  {userRole !== "auditor" && (
                    <label className="flex items-center gap-2 cursor-pointer text-blue-600 hover:text-blue-800 text-xs">
                      <Upload size={14} /> Upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          handleFileChange(row.idx, e.target.files[0])
                        }
                      />
                    </label>
                  )}
                  {row.documentEvidence && (
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDoc(row.documentEvidence)}
                        className="flex items-center gap-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteFile(row.idx, "documentEvidence")
                        }
                        className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                      >
                        <X size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Practice Evidence */}
                <div>
                  <p className="font-medium text-gray-800 mb-1">
                    Practice Evidence
                  </p>
                  {userRole !== "auditor" ? (
                    <>
                      <label className="flex items-center gap-2 cursor-pointer text-green-600 hover:text-green-800 text-xs">
                        <Upload size={14} /> Upload File
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) =>
                            handlePracticeFileChange(row.idx, e.target.files[0])
                          }
                        />
                      </label>
                      {row.practiceEvidence && (
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            onClick={() => setSelectedDoc(row.practiceEvidence)}
                            className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteFile(row.idx, "practiceEvidence")
                            }
                            className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                          >
                            <X size={14} /> Delete
                          </button>
                        </div>
                      )}

                      <textarea
                        className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-green-400 mt-2"
                        rows="2"
                        value={row.practiceEvidenceText || ""}
                        placeholder="Additional practice notes..."
                        onChange={(e) =>
                          handleInputChange(
                            row.idx,
                            "practiceEvidenceText",
                            e.target.value
                          )
                        }
                        onBlur={() => handlePracticeBlur(row.idx)}
                      />
                    </>
                  ) : (
                    <span className="text-gray-700">
                      {row.practiceEvidenceText || row.practiceEvidence || "—"}
                    </span>
                  )}
                </div>

                {/* Scores */}
                <div>
                  <p className="font-medium text-gray-800 mb-1">Scores</p>
                  {userRole === "auditor" ? (
                    <>
                      <select
                        className="border rounded-md w-full mb-2 p-1 text-sm"
                        value={row.docScore}
                        onChange={(e) =>
                          handleAuditorChange(
                            row.idx,
                            "docScore",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Doc Score</option>
                        <option value="0">0 - Not Available</option>
                        <option value="1">1 - Partial</option>
                        <option value="2">2 - Compliant</option>
                      </select>
                      <select
                        className="border rounded-md w-full p-1 text-sm"
                        value={row.practiceScore}
                        onChange={(e) =>
                          handleAuditorChange(
                            row.idx,
                            "practiceScore",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Practice Score</option>
                        <option value="0">0 - Not Practiced</option>
                        <option value="1">1 - Partial</option>
                        <option value="2">2 - Fully Practiced</option>
                      </select>
                    </>
                  ) : (
                    <div className="text-gray-700 space-y-1">
                      <div>Doc Score: {row.docScore || "—"}</div>
                      <div>Practice Score: {row.practiceScore || "—"}</div>
                    </div>
                  )}
                </div>

                {/* Remarks */}
                <div>
                  <p className="font-medium text-gray-800 mb-1">Remarks</p>
                  {userRole === "auditor" ? (
                    <>
                      <textarea
                        className="w-full border rounded-md p-1 mb-2 text-sm"
                        rows="2"
                        value={row.docRemarks}
                        placeholder="Doc remarks..."
                        onChange={(e) =>
                          handleAuditorChange(
                            row.idx,
                            "docRemarks",
                            e.target.value
                          )
                        }
                      />
                      <textarea
                        className="w-full border rounded-md p-1 text-sm"
                        rows="2"
                        value={row.practiceRemarks}
                        placeholder="Practice remarks..."
                        onChange={(e) =>
                          handleAuditorChange(
                            row.idx,
                            "practiceRemarks",
                            e.target.value
                          )
                        }
                      />
                    </>
                  ) : (
                    <div className="text-gray-700 space-y-1">
                      <div>{row.docRemarks || "—"}</div>
                      <div>{row.practiceRemarks || "—"}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Document Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-white rounded-lg p-4 w-11/12 md:w-3/4 lg:w-1/2 relative shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                <ClipboardCheck className="text-blue-600" size={18} /> Uploaded
                Document
              </h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </div>
            <iframe
              src={`https://cftoolbackend.duckdns.org${selectedDoc}`}
              className="w-full h-96 border rounded-md"
              title="Document Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAssessment;
