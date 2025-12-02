import React, { useEffect, useState } from "react";
import { ISO_27001_CLAUSES, ISO_27001_CONTROL } from "../constant";
import {
  Upload,
  X,
  ClipboardCheck,
  ShieldCheck,
  Trash,
  Eye,
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
      setUserRole(parsedUser.isAuditor || false);
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
          practiceNotes: "",
          doceumentNotes: "",
          docScore: "",
          practiceScore: "",
          totalScore: 0,
          docRemarks: "",
          practiceRemarks: "",
          gapId: null,
        }))
      )
      .filter((row) =>
        !user?.department?.name
          ? true
          : row.departments.includes(user.department.name)
      );

    setRows(filtered);
  }, [user]);

  // Fetch gaps from backend
  useEffect(() => {
    if (!user) return;

    const fetchGaps = async () => {
      try {
        const gaps = await gapService.getGaps();
        // Only keep gaps from the user's organization
        const filteredGaps = gaps.filter(
          (g) => g.organization === user.organization
        );

        setRows((prev) =>
          prev.map((row) => {
            const gap = filteredGaps.find(
              (g) => g.clause === row.clause && g.question === row.question
            );
            return gap
              ? {
                  ...row,
                  documentEvidence: gap.documentURL || null,
                  practiceEvidence: gap.practiceEvidence || null,
                  practiceNotes: gap.practiceNotes || "",
                  documentNotes: gap.documentNotes || "",
                  docScore: gap.docScore || "",
                  practiceScore: gap.practiceScore || "",
                  totalScore:
                    (gap.docScore ? parseInt(gap.docScore) : 0) +
                    (gap.practiceScore ? parseInt(gap.practiceScore) : 0),
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
  }, [user]);

  // Generic input handler
  const handleInputChange = (i, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[i][field] = value;

      // Update totalScore live
      if (field === "docScore" || field === "practiceScore") {
        const doc = updated[i].docScore ? parseInt(updated[i].docScore) : 0;
        const practice = updated[i].practiceScore
          ? parseInt(updated[i].practiceScore)
          : 0;
        updated[i].totalScore = doc + practice;
      }

      return updated;
    });
  };

  // File upload handler
  const handleFileChange = async (i, file, field) => {
    if (!file) return;
    try {
      const { url } = await gapService.uploadFile(file);
      const newRow = { ...rows[i], [field]: url };

      setRows((prev) => {
        const updated = [...prev];
        updated[i] = newRow;
        return updated;
      });

      const payload = {
        clause: newRow.clause,
        question: newRow.question,
        standardRequirement: newRow.standardRequirement,
        documentURL: newRow.documentEvidence || "",
        documentNotes: newRow.documentNotes || "",
        practiceEvidence: newRow.practiceEvidence || "",
        practiceNotes: newRow.practiceNotes || "",
        docScore: newRow.docScore || "",
        practiceScore: newRow.practiceScore || "",
        totalScore: newRow.totalScore || 0,
        docRemarks: newRow.docRemarks || "",
        practiceRemarks: newRow.practiceRemarks || "",
        createdBy: user?.id || "",
        department: user?.department?.name || "",
        organization: user?.organization || "",
      };

      const saved = await gapService.saveEntry(payload);
      handleInputChange(i, "gapId", saved._id);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  // Delete file
  const handleDeleteFile = async (i, field) => {
    const row = rows[i];
    const fileUrl = row[field];
    if (!fileUrl) return;
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    const backendFieldMap = {
      documentEvidence: "documentURL",
      practiceEvidence: "practiceEvidence",
    };
    const backendField = backendFieldMap[field];
    if (!backendField) return console.error("Unknown field:", field);

    try {
      await gapService.deleteDocumentByUrl(fileUrl, backendField);
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

  // Save practice notes on blur
  const handleNotesBlur = async (i) => {
    const r = rows[i];
    if (!r.practiceNotes && !r.documentNotes) return;

    try {
      const saved = await gapService.saveEntry({
        ...r,
        createdBy: user?.id,
        organization: user?.organization || "",
      });

      handleInputChange(i, "gapId", saved._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Auditor score/remark updates
  const handleAuditorChange = async (i, field, value) => {
    // Step 1: Update state synchronously
    setRows((prev) => {
      const updated = [...prev];
      const row = { ...updated[i], [field]: value };

      const doc = parseInt(row.docScore || 0);
      const practice = parseInt(row.practiceScore || 0);
      row.totalScore = doc + practice;

      updated[i] = row;
      return updated;
    });

    // Step 2: AFTER state update, work with fresh row safely
    const row = { ...rows[i], [field]: value };
    row.totalScore =
      parseInt(row.docScore || 0) + parseInt(row.practiceScore || 0);

    // Step 3: Create gap entry if needed
    let gapId = row.gapId;
    if (!gapId) {
      try {
        const created = await gapService.saveEntry({
          clause: row.clause,
          question: row.question,
          standardRequirement: row.standardRequirement,
          documentURL: row.documentEvidence || "",
          documentNotes: row.documentNotes || "",
          practiceEvidence: row.practiceEvidence || "",
          practiceNotes: row.practiceNotes || "",
          docScore: row.docScore || "",
          practiceScore: row.practiceScore || "",
          totalScore: row.totalScore,
          docRemarks: row.docRemarks || "",
          practiceRemarks: row.practiceRemarks || "",
          createdBy: user?.id,
          department: user?.department?.name || "",
          organization: user?.organization || "",
        });

        gapId = created._id;

        // update gapId in state
        setRows((prev) => {
          const updated = [...prev];
          updated[i].gapId = gapId;
          return updated;
        });
      } catch (err) {
        console.error("Failed to create gap for auditor:", err);
        return;
      }
    }

    // Step 4: Update existing entry
    try {
      await gapService.updateEntry(gapId, {
        clause: row.clause,
        question: row.question,
        standardRequirement: row.standardRequirement,
        documentURL: row.documentEvidence || "",
        documentNotes: row.documentNotes || "",
        practiceEvidence: row.practiceEvidence || "",
        practiceNotes: row.practiceNotes || "",
        docScore: row.docScore || "",
        practiceScore: row.practiceScore || "",
        totalScore: row.totalScore,
        docRemarks: row.docRemarks || "",
        practiceRemarks: row.practiceRemarks || "",
        verifiedBy: user?.id,
      });
    } catch (err) {
      console.error("Failed to update gap:", err);
    }
  };

  const saveAuditorUpdate = async (row) => {
    if (!row.gapId) return;

    try {
      await gapService.updateEntry(row.gapId, {
        clause: row.clause,
        question: row.question,
        standardRequirement: row.standardRequirement,
        documentURL: row.documentEvidence || "",
        practiceEvidence: row.practiceEvidence || "",
        practiceNotes: row.practiceNotes || "",
        docScore: row.docScore || "",
        practiceScore: row.practiceScore || "",
        totalScore: row.totalScore,
        docRemarks: row.docRemarks || "",
        practiceRemarks: row.practiceRemarks || "",
        verifiedBy: user?.id,
      });
    } catch (err) {
      console.error("Failed to update gap:", err);
    }
  };

  // Group rows by clause
  const grouped = rows.reduce((acc, r, idx) => {
    if (!acc[r.clause]) acc[r.clause] = [];
    acc[r.clause].push({ ...r, idx });
    return acc;
  }, {});

  // Calculate final clause score (%)
  const clauseScores = Object.keys(grouped).reduce((acc, clause) => {
    const answered = grouped[clause].filter(
      (q) => q.docScore !== "" || q.practiceScore !== ""
    );
    const total = answered.reduce((sum, q) => sum + (q.totalScore || 0), 0);
    const maxTotal = answered.length * 4;
    acc[clause] =
      maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(2) : "Yet to Calculate";
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
        <strong className="capitalize">
          {userRole ? "Auditor" : "Assessor"}
        </strong>{" "}
        | Department: <strong>{user?.department?.name || "N/A"}</strong>
      </div>

      <div className="overflow-auto rounded-xl shadow border border-gray-200">
        {Object.keys(grouped).map((clause, i) => (
          <div key={i} className="mb-6">
            <div className="bg-blue-100 px-4 py-2 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">{clause}</h3>
              <span className="block text-sm text-gray-600">
                {grouped[clause][0].standardRequirement}
              </span>
            </div>

            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="border px-3 py-2">Question</th>
                  <th className="border px-3 py-2">Document Evidence</th>
                  <th className="border px-3 py-2">Practice Evidence</th>
                  {userRole && (
                    <>
                      <th className="border px-3 py-2">Doc Score</th>
                      <th className="border px-3 py-2">Practice Score</th>
                      <th className="border px-3 py-2">Total Score</th>
                      <th className="border px-3 py-2">Doc Remarks</th>
                      <th className="border px-3 py-2">Practice Remarks</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {grouped[clause].map((row) => (
                  <tr key={row.idx} className="hover:bg-blue-50 transition">
                    <td className="border px-3 py-2 font-medium">
                      {row.question}
                    </td>

                    {/* Document Evidence */}
                    <td className="border px-3 py-2">
                      {!userRole && (
                        <label className="cursor-pointer text-blue-600 hover:underline text-xs">
                          <Upload size={14} className="inline" />
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange(
                                row.idx,
                                e.target.files[0],
                                "documentEvidence"
                              )
                            }
                          />
                        </label>
                      )}
                      {row.documentEvidence && (
                        <>
                          <button
                            onClick={() => setSelectedDoc(row.documentEvidence)}
                            className="text-xs text-blue-600 hover:underline ml-2 mr-1"
                          >
                            <Eye size={14} className="inline" />
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteFile(row.idx, "documentEvidence")
                            }
                            className="text-xs text-red-500 hover:underline"
                          >
                            <Trash size={14} className="inline" />
                            Delete
                          </button>
                        </>
                      )}
                      <textarea
                        className="w-full border rounded mt-2 px-1 py-0.5"
                        rows="1"
                        value={row.documentNotes || ""}
                        placeholder="Document notes..."
                        onChange={(e) =>
                          handleInputChange(
                            row.idx,
                            "documentNotes",
                            e.target.value
                          )
                        }
                        onBlur={() => handleNotesBlur(row.idx)}
                      />
                    </td>

                    {/* Practice Evidence */}
                    <td className="border px-3 py-2">
                      {!userRole  && (
                        <label className="cursor-pointer text-green-600 hover:underline text-xs">
                          <Upload size={14} className="inline" />
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange(
                                row.idx,
                                e.target.files[0],
                                "practiceEvidence"
                              )
                            }
                          />
                        </label>
                      )}
                      {row.practiceEvidence && (
                        <>
                          <button
                            onClick={() => setSelectedDoc(row.practiceEvidence)}
                            className="text-xs text-green-600 hover:underline ml-2 mr-1"
                          >
                            <Eye size={14} className="inline" />
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteFile(row.idx, "practiceEvidence")
                            }
                            className="text-xs text-red-500 hover:underline"
                          >
                            <Trash size={14} className="inline" />
                            Delete
                          </button>
                        </>
                      )}
                      <textarea
                        className="w-full border rounded mt-2 px-1 py-0.5"
                        rows="1"
                        value={row.practiceNotes || ""}
                        placeholder="Practice notes..."
                        onChange={(e) =>
                          handleInputChange(
                            row.idx,
                            "practiceNotes",
                            e.target.value
                          )
                        }
                        onBlur={() => handleNotesBlur(row.idx)}
                      />
                    </td>

                    {/* Scores and remarks */}
                    {userRole && (
                      <>
                        <td className="border px-3 py-2">
                          {userRole ? (
                            <select
                              value={row.docScore}
                              onChange={(e) =>
                                handleAuditorChange(
                                  row.idx,
                                  "docScore",
                                  e.target.value
                                )
                              }
                              className="w-full border"
                            >
                              <option value="">Doc Score</option>
                              <option value="0">0-Non Compliant</option>
                              <option value="1">1-Partial</option>
                              <option value="2">2-Compliant</option>
                            </select>
                          ) : (
                            <span>{row.docScore || "—"}</span>
                          )}
                        </td>

                        <td className="border px-3 py-2">
                          {userRole ? (
                            <select
                              value={row.practiceScore}
                              onChange={(e) =>
                                handleAuditorChange(
                                  row.idx,
                                  "practiceScore",
                                  e.target.value
                                )
                              }
                              className="w-full border"
                            >
                              <option value="">Practice Score</option>{" "}
                              <option value="0">0-Non Compliant</option>
                              <option value="1">1-Partial</option>
                              <option value="2">2-Compliant</option>
                            </select>
                          ) : (
                            <span>{row.practiceScore || "—"}</span>
                          )}
                        </td>

                        <td className="border px-3 py-2 font-semibold text-center">
                          {row.totalScore}
                        </td>

                        <td className="border px-3 py-2">
                          {userRole ? (
                            <textarea
                              value={row.docRemarks}
                              onChange={(e) =>
                                handleAuditorChange(
                                  row.idx,
                                  "docRemarks",
                                  e.target.value
                                )
                              }
                              className="w-full border"
                              rows="1"
                              placeholder="Doc remarks..."
                            />
                          ) : (
                            <span>{row.docRemarks || "—"}</span>
                          )}
                        </td>

                        <td className="border px-3 py-2">
                          {userRole  ? (
                            <textarea
                              value={row.practiceRemarks}
                              onChange={(e) =>
                                handleAuditorChange(
                                  row.idx,
                                  "practiceRemarks",
                                  e.target.value
                                )
                              }
                              className="w-full border"
                              rows="1"
                              placeholder="Practice remarks..."
                            />
                          ) : (
                            <span>{row.practiceRemarks || "—"}</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Clause Score */}
            <div className="text-right pr-4 pt-2 text-sm font-semibold text-gray-700">
              Section Score: {clauseScores[clause]} %
            </div>
          </div>
        ))}
      </div>

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
              src={
                selectedDoc.startsWith("http")
                  ? selectedDoc
                  : `https://safesphere.duckdns.org/gap-service${selectedDoc}`
              }
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
