import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import documentationService from "../services/documentationService";
import { FileText, FileSpreadsheet, Shield, BookOpen } from "lucide-react"; // 🔹 Added Lucide icons
import Joyride, { STATUS } from "react-joyride";
import { DOCUMENT_MAPPING } from "../constants";

const Documentation = () => {
  const history = useHistory();
  const [documentStats, setDocumentStats] = useState({
    total: 0,
    uploaded: 0,
    pending: 0,
  });

  const user = JSON.parse(sessionStorage.getItem("user"));
  const role = user?.role || "";

  useEffect(() => {
    const loadDocumentStats = async () => {
      try {
        const soas = (await documentationService.getSoAEntries()) || [];
        const docs = (await documentationService.getDocuments()) || [];

        const total = Array.isArray(soas) ? soas.length : 0;

        // Count uploaded documents per SoA
        const uploadedCount = Array.isArray(docs) ? docs.length : 0;
        // Filter & sort as in your MLD logic
        let filteredAndSortedSoas = [...soas];

        // optional: if you want search/sort here, add conditions similar to your MLD useMemo

        // Get department-specific uploaded docs
        const { docCount, userDocs } = getDocsForUser(
          filteredAndSortedSoas,
          user,
          docs
        );

        setDocumentStats({
          total: userDocs.length,
          uploaded: docCount,
          pending: userDocs.length - docCount,
        });
      } catch (error) {
        console.error("Error loading document stats:", error);
        setDocumentStats({ total: 0, uploaded: 0, pending: 0 });
      }
    };

    loadDocumentStats();
  }, [user]);

  const getDocsForUser = (soas, user, docs) => {
    const docsSet = new Set();
    let docCount = 0;
    docs.forEach((doc) => {
      soas.forEach((soa) => {
        if(doc.soaId === soa.id.toString() && user.department.name === doc.departmentName)
          docCount=docCount+1;
        const refs = Array.isArray(soa.documentRef)
          ? soa.documentRef
          : [soa.documentRef];
        refs.forEach((ref) => {
          for (const key in DOCUMENT_MAPPING) {
            if (
              DOCUMENT_MAPPING[key].docs?.includes(ref) &&
              DOCUMENT_MAPPING[key].dept.some((d) =>
                user.department.name.includes(d)
              )
            ) {
              docsSet.add(ref);
            }
          }
        });
      });
    });
    return { docCount, userDocs: Array.from(docsSet) };
  };
  // User and role loaded once
  const [joyrideRun, setJoyrideRun] = useState(false);
  const joyrideSteps = [
    {
      target: "#total-risks",
      content:
        "This shows the total number of documents need to uploaded by the organization.",
    },
    {
      target: "#with-controls",
      content:
        "This shows the number of documents already uploaded by the organization.",
    },
    {
      target: "#without-controls",
      content:
        "This shows the number of documents yet to be uploaded by the organization.",
    },
    {
      target: "#mld-button",
      content:
        "Click here to access the Master List of Documents (MLD). Here you can go and upload the required documents for your department",
    },
  ];

  // Styles
  const pageStyle = {
    marginTop: "50px",
    padding: "10px",
    maxWidth: "900px",
    margin: "50px auto 0",
  };

  const headerStyle = {
    background: "white",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "15px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e9ecef",
    textAlign: "center",
  };

  const statsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px",
    marginBottom: "15px",
  };

  const statCardStyle = {
    background: "white",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    textAlign: "center",
    border: "1px solid #e9ecef",
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  const actionsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  };

  const actionCardStyle = {
    background: "white",
    padding: "14px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    textAlign: "center",
    border: "1px solid #e9ecef",
    transition: "all 0.2s ease",
    cursor: "pointer",
  };

  const iconStyle = { width: 36, height: 36, marginBottom: 10 };

  return (
    <div style={pageStyle}>
      <Joyride
        steps={joyrideSteps}
        run={joyrideRun}
        continuous
        scrollToFirstStep
        showSkipButton
        styles={{ options: { zIndex: 10000 } }}
        callback={(data) => {
          const { status } = data;
          if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setJoyrideRun(false);
          }
        }}
      />
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ color: "#2c3e50", marginBottom: "8px", fontSize: "22px" }}>
          Documentation Dashboard
        </h1>
        <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
          Generate and manage your Statement of Applicability (SoA) and control
          documentation.
        </p>
        <button
          onClick={() => setJoyrideRun(true)}
          style={{
            marginTop: "10px",
            padding: "6px 12px",
            borderRadius: "6px",
            background: "#005FCC",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Start Tour
        </button>
      </div>

      {/* Stats Cards */}
      <div style={statsStyle}>
        <div
          id="total-risks"
          style={{ ...statCardStyle, borderLeft: "3px solid #9b59b6" }}
          onClick={() => history.push("/documentation/soa")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{ color: "#9b59b6", margin: "0 0 6px 0", fontSize: "28px" }}
          >
            {documentStats.total}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              margin: 0,
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Total Documents to Upload
          </p>
        </div>

        <div
          id="with-controls"
          style={{ ...statCardStyle, borderLeft: "3px solid #27ae60" }}
          onClick={() => history.push("/documentation/soa")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{ color: "#27ae60", margin: "0 0 6px 0", fontSize: "28px" }}
          >
            {documentStats.uploaded}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              margin: 0,
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Uploaded
          </p>
        </div>

        <div
          id="without-controls"
          style={{ ...statCardStyle, borderLeft: "3px solid #e74c3c" }}
          onClick={() => history.push("/documentation/soa")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h2
            style={{ color: "#e74c3c", margin: "0 0 6px 0", fontSize: "28px" }}
          >
            {documentStats.pending}
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              margin: 0,
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Pending
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={actionsStyle}>
        {/* Only Super Admin Actions */}
        {role === "super_admin" && (
          <>
            {/* SoA */}
            <div
              style={{
                ...actionCardStyle,
                background: "linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)",
                color: "white",
              }}
              onClick={() => history.push("/documentation/soa")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-3px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <FileSpreadsheet style={iconStyle} />
              <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>
                Generate SoA
              </h3>
              <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
                Automatically create Statement of Applicability from controls
              </p>
            </div>

            {/* Control Library */}
            <div
              style={{
                ...actionCardStyle,
                background: "linear-gradient(135deg, #f39c12 0%, #d35400 100%)",
                color: "white",
              }}
              onClick={() => history.push("/documentation/controls")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-3px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <Shield style={iconStyle} />
              <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>
                Control Library
              </h3>
              <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
                Browse and manage security controls
              </p>
            </div>
          </>
        )}

        {/* Accessible to all roles */}
        <div
          id="mld-button"
          style={{
            ...actionCardStyle,
            background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
            color: "white",
          }}
          onClick={() => history.push("/documentation/mld")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-3px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>List of Documents</h3>
          <p style={{ margin: 0, fontSize: "13px", opacity: 0.9 }}>
            
          </p>
        </div>
      </div>
    </div>
  );
};
export default Documentation;
