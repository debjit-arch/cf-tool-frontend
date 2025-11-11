import React, { useEffect, useState } from "react";
import { ISO_27001_CLAUSES, ISO_27001_CONTROL } from "../constant";
import { Upload, Eye, X } from "lucide-react";
import gapService from "../services/gapService";

const NewAssessment = () => {
  const [rows, setRows] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("employee");

  // Load logged-in user from sessionStorage
  useEffect(() => {
    const rawUser = sessionStorage.getItem("user");
    if (rawUser) {
      const parsedUser = JSON.parse(rawUser);
      console.log("Loaded user:", parsedUser); // ✅ check user
      setUser(parsedUser);
      setUserRole(parsedUser.role || "employee");
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const combinedClauses = [...ISO_27001_CLAUSES, ...ISO_27001_CONTROL];
    console.log("Combined Clauses:", combinedClauses); // ✅ check constants

    const filteredRows = combinedClauses
      .flatMap((item) =>
        item.auditQuestions.map((question) => {
          return {
            clause: item.clause,
            standardRequirement: item.standardRequirement,
            question:
              typeof question === "string"
                ? question
                : question.text || question,
            departments: Array.isArray(item.departments)
              ? item.departments.map((d) =>
                  typeof d === "string" ? d : d.name
                )
              : [],
            documentEvidence: null,
            practiceEvidence: "",
            docScore: "",
            practiceScore: "",
            docRemarks: "",
            practiceRemarks: "",
            gapId: null,
          };
        })
      )
      .filter((row) => {
        // If user has no department (auditor), include all rows
        if (!user.department || !user.department.name) return true;
        return row.departments.includes(user.department.name);
      });

    console.log("Filtered Rows:", filteredRows); // ✅ check final rows
    setRows(filteredRows);
  }, [user]);

  // Fetch existing gap entries from DB
  useEffect(() => {
    const fetchGaps = async () => {
      try {
        const gaps = await gapService.getGaps();
        setRows((prev) =>
          prev.map((row) => {
            const gap = gaps.find(
              (g) => g.clause === row.clause && g.question === row.question
            );
            if (gap) {
              return {
                ...row,
                documentEvidence: gap.documentURL || null,
                practiceEvidence: gap.practiceEvidence || "",
                docScore: gap.docScore || "",
                practiceScore: gap.practiceScore || "",
                docRemarks: gap.docRemarks || "",
                practiceRemarks: gap.practiceRemarks || "",
                gapId: gap._id,
              };
            }
            return row;
          })
        );
      } catch (err) {
        console.error("Failed to fetch gaps:", err);
      }
    };
    fetchGaps();
  }, []);

  // Handle local input change
  const handleInputChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  // Upload document and save entry
  const handleFileChange = async (index, file) => {
    if (!file) return;
    try {
      const url = await gapService.uploadFile(file);

      let updatedRow;
      setRows((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], documentEvidence: url };
        updatedRow = updated[index];
        return updated;
      });

      const entry = {
        clause: updatedRow.clause,
        standardRequirement: updatedRow.standardRequirement,
        question: updatedRow.question,
        documentURL: url,
        practiceEvidence: updatedRow.practiceEvidence || "",
        createdBy: user?.id,
      };

      const saved = await gapService.saveEntry(entry);

      setRows((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], gapId: saved._id };
        return updated;
      });
    } catch (err) {
      console.error("File upload/save failed:", err);
      alert("File upload failed");
    }
  };

  // Save practice evidence (employee)
  const handlePracticeBlur = async (index) => {
    const row = rows[index];
    if (!row.practiceEvidence) return;

    const entry = {
      clause: row.clause,
      standardRequirement: row.standardRequirement,
      question: row.question,
      practiceEvidence: row.practiceEvidence,
      documentURL: row.documentEvidence,
      createdBy: user?.id,
    };

    try {
      const saved = await gapService.saveEntry(entry);
      handleInputChange(index, "gapId", saved._id);
    } catch (err) {
      console.error("Practice evidence save failed:", err);
    }
  };

  // Auditor updates scores/remarks
  const handleAuditorChange = async (index, field, value) => {
    const row = rows[index];
    handleInputChange(index, field, value);

    if (row.gapId) {
      const update = {
        docScore: row.docScore,
        practiceScore: row.practiceScore,
        docRemarks: row.docRemarks,
        practiceRemarks: row.practiceRemarks,
        verifiedBy: user?.id,
      };
      update[field] = value;
      try {
        await gapService.updateEntry(row.gapId, update);
      } catch (err) {
        console.error("Auditor update failed:", err);
      }
    }
  };

  // Group rows by clause
  const grouped = rows.reduce((acc, row, idx) => {
    if (!acc[row.clause]) acc[row.clause] = [];
    acc[row.clause].push({ ...row, idx });
    return acc;
  }, {});

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">New Assessment</h2>
      <p className="mb-2 text-gray-600">
        Logged in as: <strong>{user?.name || "Unknown"}</strong> | Role:{" "}
        <strong>{userRole}</strong> | Department:{" "}
        <strong>{user?.department?.name || "N/A"}</strong>
      </p>

      <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 w-48">Clause / Control</th>
            <th className="border p-2 w-72">Question</th>
            <th className="border p-2 w-40">Document Evidence</th>
            <th className="border p-2 w-60">Practice Evidence</th>
            <th className="border p-2 w-28">Doc Score</th>
            <th className="border p-2 w-28">Practice Score</th>
            <th className="border p-2 w-52">Doc Remarks</th>
            <th className="border p-2 w-52">Practice Remarks</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(grouped).map((clause, i) => (
            <React.Fragment key={i}>
              <tr className="bg-blue-50">
                <td className="border p-2 font-semibold" colSpan="8">
                  <div className="font-semibold">{clause}</div>
                  <div className="text-gray-700 text-sm mt-1">
                    {grouped[clause][0].standardRequirement}
                  </div>
                </td>
              </tr>

              {grouped[clause].map((row) => (
                <tr key={row.idx}>
                  <td className="border p-2"></td>
                  <td className="border p-2">{row.question}</td>

                  {/* Document Evidence */}
                  <td className="border p-2 flex items-center gap-2">
                    {userRole !== "auditor" && (
                      <label className="flex items-center gap-1 cursor-pointer bg-gray-200 px-2 py-1 rounded text-xs">
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
                      <button
                        onClick={() => setSelectedDoc(row.documentEvidence)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                      >
                        <Eye size={14} /> View
                      </button>
                    )}
                  </td>

                  {/* Practice Evidence */}
                  <td className="border p-2">
                    {userRole !== "auditor" ? (
                      <textarea
                        className="w-full border rounded p-1"
                        rows="2"
                        value={row.practiceEvidence}
                        onChange={(e) =>
                          handleInputChange(
                            row.idx,
                            "practiceEvidence",
                            e.target.value
                          )
                        }
                        onBlur={() => handlePracticeBlur(row.idx)}
                      />
                    ) : (
                      <span>{row.practiceEvidence}</span>
                    )}
                  </td>

                  {/* Doc Score */}
                  <td className="border p-2">
                    {userRole === "auditor" ? (
                      <select
                        className="border rounded p-1"
                        value={row.docScore}
                        onChange={(e) =>
                          handleAuditorChange(
                            row.idx,
                            "docScore",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        <option value="0">0 - Not Available</option>
                        <option value="1">1 - Partial</option>
                        <option value="2">2 - Compliant</option>
                      </select>
                    ) : (
                      <span>{row.docScore}</span>
                    )}
                  </td>

                  {/* Practice Score */}
                  <td className="border p-2">
                    {userRole === "auditor" ? (
                      <select
                        className="border rounded p-1"
                        value={row.practiceScore}
                        onChange={(e) =>
                          handleAuditorChange(
                            row.idx,
                            "practiceScore",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        <option value="0">0 - Not Practiced</option>
                        <option value="1">1 - Partial</option>
                        <option value="2">2 - Fully Practiced</option>
                      </select>
                    ) : (
                      <span>{row.practiceScore}</span>
                    )}
                  </td>

                  {/* Doc Remarks */}
                  <td className="border p-2">
                    {userRole === "auditor" ? (
                      <textarea
                        className="w-full border rounded p-1"
                        rows="2"
                        value={row.docRemarks}
                        onChange={(e) =>
                          handleAuditorChange(
                            row.idx,
                            "docRemarks",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <span>{row.docRemarks}</span>
                    )}
                  </td>

                  {/* Practice Remarks */}
                  <td className="border p-2">
                    {userRole === "auditor" ? (
                      <textarea
                        className="w-full border rounded p-1"
                        rows="2"
                        value={row.practiceRemarks}
                        onChange={(e) =>
                          handleAuditorChange(
                            row.idx,
                            "practiceRemarks",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <span>{row.practiceRemarks}</span>
                    )}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Modal for viewing uploaded document */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-white rounded-lg p-4 w-4/5 max-w-3xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">Uploaded Document</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-red-500"
              >
                <X size={20} />
              </button>
            </div>
            <iframe
              src={`http://localhost:4000${selectedDoc}`}
              className="w-full h-96 border rounded"
              title="Document Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAssessment;
