import React, { useEffect, useState } from "react";
import InputField from "../inputs/InputField";
import SelectField from "../inputs/SelectField";
import TextAreaField from "../inputs/TextAreaField";
import Select from "react-select";

const RiskDetailsForm = ({
  formData,
  handleInputChange,
  generateRiskId,
  existingRiskIds = [],
  isEditing = false,
  originalRiskId = "",
  departments = [],
}) => {
  const [selectedThreat, setSelectedThreat] = useState("");
  const [isCustomThreat, setIsCustomThreat] = useState(false);
  const [customVulnerability, setCustomVulnerability] = useState("");

  

  useEffect(() => {
    // always reset to top when component loads
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (!formData.riskId && !isEditing) {
      generateRiskId();
    }
  }, [formData.riskId, isEditing, generateRiskId]);
  useEffect(() => {
    if (!formData.riskType) {
      handleInputChange({ target: { name: "riskType", value: "Operational" } });
    }
  }, [formData.riskType, handleInputChange]);

  useEffect(() => {
    if (!formData.date) {
      const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD
      handleInputChange({ target: { name: "date", value: today } });
    }
  }, [formData.date, handleInputChange]);
  const riskTypeOptions = [
    { value: "Operational", label: "Operational" },
    { value: "Tactical", label: "Tactical" },
    { value: "Strategic", label: "Strategic" },
  ];

  const assetTypeOptions = [
    { value: "Public", label: "Public" },
    { value: "Private", label: "Private" },
    { value: "Sensitive", label: "Sensitive" },
    { value: "Confidential", label: "Confidential" },
  ];

  // Example threat-vulnerability mapping
  const threatVulnerabilityMapping = {
    "Phishing Attack": {
      vulnerabilities: ["Weak Email Filters", "Lack of User Awareness"],
      description:
        "Employees may fall victim to phishing due to weak email filters or lack of awareness.",
    },
    "Malware Infection": {
      vulnerabilities: ["Outdated Antivirus", "Unpatched Software"],
      description:
        "Systems may be compromised if antivirus is outdated or patches are missing.",
    },
    "Insider Threat": {
      vulnerabilities: ["Weak Access Controls", "Excessive Privileges"],
      description:
        "Unauthorized actions from insiders due to poor access management.",
    },
  };

  const [selectedVulnerabilities, setSelectedVulnerabilities] = useState([]);

  useEffect(() => {
    if (selectedThreat && selectedVulnerabilities.length > 0) {
      const newDescription = `Risk of loss of information due to ${selectedThreat} because of ${selectedVulnerabilities.join(
        ", "
      )}`;

      handleInputChange({
        target: { name: "riskDescription", value: newDescription },
      });
    }
  }, [selectedThreat, selectedVulnerabilities]);

  //auto populate
  const assetCIAValues = {
    Public: { confidentiality: 1, integrity: 1, availability: 1 },
    Private: { confidentiality: 2, integrity: 2, availability: 2 },
    Sensitive: { confidentiality: 3, integrity: 3, availability: 2 },
    Confidential: { confidentiality: 3, integrity: 3, availability: 3 },
  };

  const ciaOptions = [
    { value: 1, label: "1 - Low" },
    { value: 2, label: "2 - Medium" },
    { value: 3, label: "3 - High" },
  ];
  const liklihoodOptions = [
    { value: 1, label: "1 - Unlikely" },
    { value: 2, label: "2 - Possible" },
    { value: 3, label: "3 - Likely" },
    { value: 4, label: "4 - Almost Certain" },
  ];

  const calculateAsset = () => {
    const c = parseInt(formData.confidentiality) || 0;
    const i = parseInt(formData.integrity) || 0;
    const a = parseInt(formData.availability) || 0;
    return c + i + a;
  };

  const calculateImpact = () => {
    const c = parseInt(formData.confidentiality) || 0;
    const i = parseInt(formData.integrity) || 0;
    const a = parseInt(formData.availability) || 0;
    formData.impact = Math.max(c, i, a);
    return Math.max(c, i, a);
  };

  useEffect(() => {
    if (formData.assetType && assetCIAValues[formData.assetType]) {
      const { confidentiality, integrity, availability } =
        assetCIAValues[formData.assetType];
      handleInputChange({
        target: { name: "confidentiality", value: confidentiality },
      });
      handleInputChange({ target: { name: "integrity", value: integrity } });
      handleInputChange({
        target: { name: "availability", value: availability },
      });
    }
  }, [formData.assetType]);

  const calculateRiskLevel = (score) => {
    if (score <= 3) return "Low";
    if (score <= 8) return "Medium";
    if (score <= 12) return "High";
    return "Critical";
  }; // Auto-save Risk Score & Risk Level into formData
  useEffect(() => {
    const impact = calculateImpact();
    const probability = parseInt(formData.probability) || 0;
    const riskScore = impact * probability;
    const riskLevel = calculateRiskLevel(riskScore);
    handleInputChange({ target: { name: "riskScore", value: riskScore } });
    handleInputChange({ target: { name: "riskLevel", value: riskLevel } });
  }, [
    formData.confidentiality,
    formData.integrity,
    formData.availability,
    formData.probability,
  ]);

  const isDuplicateRiskId = () => {
    if (isEditing && formData.riskId === originalRiskId) {
      return false; // Not a duplicate if it's the same risk being edited
    }
    return existingRiskIds.includes(formData.riskId);
  };

  // inside RiskDetailsForm

  const formStyle = {
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    padding: "20px", // reduced from 40px
    borderRadius: "10px", // reduced from 16px
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)", // lighter
    maxWidth: "800px", // reduced width
    margin: "0 auto",
    border: "1px solid #e9ecef",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "20px", // reduced
    paddingBottom: "10px", // reduced
    borderBottom: "2px solid #3498db", // thinner
  };

  const titleStyle = {
    color: "#2c3e50",
    fontSize: "22px", // reduced from 28px
    fontWeight: "600",
    marginBottom: "4px",
  };

  const subtitleStyle = {
    color: "#7f8c8d",
    fontSize: "13px", // reduced from 16px
    fontWeight: "400",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", // smaller min size
    gap: "15px", // reduced from 25px
    marginBottom: "20px", // reduced
  };

  const riskIdSectionStyle = {
    background: "rgba(52, 152, 219, 0.03)", // lighter background
    padding: "15px", // reduced from 25px
    borderRadius: "8px", // reduced
    border: "1px solid rgba(52, 152, 219, 0.1)",
    marginBottom: "20px",
  };

  const sectionStyle = {
    background: "rgba(52, 152, 219, 0.03)",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid rgba(52, 152, 219, 0.1)",
    marginBottom: "15px",
  };

  const sectionTitleStyle = {
    color: "#2c3e50",
    fontSize: "16px", // reduced from 20px
    fontWeight: "600",
    marginBottom: "10px",
  };

  const calculatedFieldsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    background: "#f4f6f7",
    padding: "15px", // reduced
    borderRadius: "8px",
    marginTop: "15px",
  };

  const calculatedItemStyle = {
    textAlign: "center",
    background: "white",
    padding: "12px", // reduced
    borderRadius: "6px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  };

  const calculatedLabelStyle = {
    display: "block",
    fontWeight: "500",
    color: "#34495e",
    marginBottom: "6px",
    fontSize: "12px", // reduced
    textTransform: "uppercase",
  };

  const calculatedValueStyle = {
    fontSize: "18px", // reduced from 24px
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "6px",
    background: "#ffffff",
    color: "#2c3e50",
    border: "1px solid #ecf0f1", // thinner
  };

  const fullWidthStyle = {
    gridColumn: "1 / -1",
  };

  const duplicateWarningStyle = {
    color: "#e74c3c",
    fontSize: "12px",
    marginTop: "5px",
    fontWeight: "600",
  };

  const autoGenButtonStyle = {
    background: "#3498db",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s ease",
  };

  const riskIdHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  };
  useEffect(() => {
    if (selectedThreat) {
      const vulArray = isCustomThreat
        ? customVulnerability
            .split(",")
            .map((v) => v.trim())
            .filter((v) => v)
        : selectedVulnerabilities;

      const newDescription = `Risk of loss of information due to ${selectedThreat}${
        vulArray.length > 0 ? " because of " + vulArray.join(", ") : ""
      }`;

      handleInputChange({
        target: { name: "riskDescription", value: newDescription },
      });

      // Always update formData with current threat & vulnerabilities
      handleInputChange({
        target: { name: "threat", value: selectedThreat },
      });
      handleInputChange({
        target: { name: "vulnerability", value: vulArray },
      });
    }
  }, [
    selectedThreat,
    selectedVulnerabilities,
    customVulnerability,
    isCustomThreat,
  ]);

  const responsiveStyle = `
    @media (max-width: 768px) {
      .risk-form {
        padding: 25px 20px !important;
        margin: 0 10px !important;
      }
      .risk-grid {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
      }
      .cia-grid {
        grid-template-columns: 1fr !important;
      }
      .calculated-fields {
        grid-template-columns: 1fr !important;
      }
      .form-title {
        font-size: 24px !important;
      }
      .risk-id-header {
        flex-direction: column !important;
        gap: 15px !important;
        align-items: flex-start !important;
      }
    }
    @media (max-width: 480px) {
      .risk-form {
        padding: 20px 15px !important;
      }
    }
  `;

  return (
    <>
      <style>{responsiveStyle}</style>
      <div style={formStyle} className="risk-form">
        <div style={headerStyle}>
          <h2 style={titleStyle} className="form-title">
            📋 Risk Assessment
          </h2>
          <p style={subtitleStyle}>Identify and Assess Risks</p>
        </div>

        {/* Risk ID Section */}
        <div style={riskIdSectionStyle}>
          <div style={riskIdHeaderStyle} className="risk-id-header">
            <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}>
              🆔 Risk Identification
            </h3>
            {!isEditing && (
              <button
                style={autoGenButtonStyle}
                onClick={generateRiskId}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#2980b9")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#3498db")
                }
              >
                🔄 Generate New ID
              </button>
            )}
          </div>

          <div style={gridStyle} className="risk-grid">
            <div>
              <InputField
                label="Risk ID"
                name="riskId"
                value={formData.riskId || ""}
                onChange={handleInputChange}
                placeholder="Auto-generated or enter custom ID"
                required
                readOnly={isEditing}
              />
              {isDuplicateRiskId() && (
                <div style={duplicateWarningStyle}>
                  ⚠️ This Risk ID already exists. Please use a different ID.
                </div>
              )}
            </div>

            <SelectField
              label="Department"
              name="department"
              value={formData.department || ""}
              onChange={handleInputChange}
              options={departments.map((dept) => ({
                value: dept.name,
                label: dept.name,
              }))}
              placeholder="Select Department"
              required
            />

            <InputField
              label="Date"
              name="date"
              type="date"
              value={formData.date || ""}
              onChange={handleInputChange}
              required
              readOnly
            />

            <SelectField
              label="Risk Type"
              name="riskType"
              value={formData.riskType || ""}
              onChange={handleInputChange}
              options={riskTypeOptions}
              placeholder="Select the type of risk"
              required
            />

            <SelectField
              label="Asset Type"
              name="assetType"
              value={formData.assetType || ""}
              onChange={handleInputChange}
              options={assetTypeOptions}
              placeholder="Select asset classification"
              required
            />

            <InputField
              label="Asset"
              name="location"
              value={formData.location || ""}
              onChange={handleInputChange}
              placeholder="Enter the asset"
              required
            />
            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>⚠️ Threat & Vulnerabilities</h3>
              <div style={gridStyle} className="risk-grid">
                {/* Threat Selection */}
                <Select
                  value={
                    selectedThreat
                      ? { value: selectedThreat, label: selectedThreat }
                      : null
                  }
                  onChange={(option) => {
                    if (!option) return;
                    const value = option.value;
                    if (value === "Others") {
                      setIsCustomThreat(true);
                      setSelectedThreat("");
                      handleInputChange({
                        target: { name: "threat", value: "" },
                      });
                    } else {
                      setIsCustomThreat(false);
                      setSelectedThreat(value);
                      handleInputChange({ target: { name: "threat", value } });
                    }
                    setSelectedVulnerabilities([]);
                  }}
                  options={[
                    ...Object.keys(threatVulnerabilityMapping).map(
                      (threat) => ({
                        value: threat,
                        label: threat,
                      })
                    ),
                    { value: "Others", label: "Others" },
                  ]}
                  placeholder="Select Threat"
                  isClearable
                />

                {/* Custom Threat Input */}
                {isCustomThreat && (
                  <InputField
                    label="Threat (Custom)"
                    name="threat"
                    value={selectedThreat}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedThreat(value);
                      handleInputChange({ target: { name: "threat", value } });
                    }}
                    placeholder="Enter custom threat"
                    required
                  />
                )}

                {/* Vulnerabilities */}
                {!isCustomThreat ? (
                  <Select
                    value={selectedVulnerabilities.map((v) => ({
                      value: v,
                      label: v,
                    }))}
                    onChange={(options) => {
                      const vulArray = options
                        ? options.map((opt) => opt.value)
                        : [];
                      setSelectedVulnerabilities(vulArray);
                      handleInputChange({
                        target: { name: "vulnerability", value: vulArray },
                      });
                    }}
                    options={
                      selectedThreat &&
                      threatVulnerabilityMapping[selectedThreat]
                        ? threatVulnerabilityMapping[
                            selectedThreat
                          ].vulnerabilities.map((vul) => ({
                            value: vul,
                            label: vul,
                          }))
                        : []
                    }
                    placeholder="Select Vulnerabilities"
                    isMulti
                    isClearable
                  />
                ) : (
                  <InputField
                    label="Vulnerabilities (Custom, comma-separated)"
                    name="vulnerabilities"
                    value={customVulnerability}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomVulnerability(value);
                      const vulArray = value
                        .split(",")
                        .map((v) => v.trim())
                        .filter((v) => v);
                      setSelectedVulnerabilities(vulArray);
                      handleInputChange({
                        target: { name: "vulnerability", value: vulArray },
                      });
                    }}
                    placeholder="Enter custom vulnerabilities separated by commas"
                    required
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={fullWidthStyle}>
          <TextAreaField
            label="Risk Description"
            name="riskDescription"
            value={formData.riskDescription || ""}
            onChange={handleInputChange}
            placeholder="This will be auto-filled when Threat & Vulnerabilities are selected"
            rows={4}
            required
          />
        </div>

        <SelectField
          label="Likelihood"
          name="probability"
          value={formData.probability || ""}
          onChange={handleInputChange}
          options={liklihoodOptions}
          placeholder="Select probability level"
          required
        />

        <div style={calculatedFieldsStyle} className="calculated-fields">
          <div style={calculatedItemStyle}>
            <label style={calculatedLabelStyle}>Impact Score</label>
            <span style={calculatedValueStyle}>{calculateImpact() || 0}</span>
          </div>

          <div style={calculatedItemStyle}>
            <label style={calculatedLabelStyle}>Likelihood Score</label>
            <span style={calculatedValueStyle}>
              {formData.probability || 0}
            </span>
          </div>

          <div style={calculatedItemStyle}>
            <label style={calculatedLabelStyle}>Risk Score</label>
            <span style={calculatedValueStyle}>{formData.riskScore || 0}</span>
          </div>

          <div style={calculatedItemStyle}>
            <label style={calculatedLabelStyle}>Risk Level</label>
            <span
              style={{
                ...calculatedValueStyle,
                backgroundColor:
                  formData.riskLevel === "Low"
                    ? "#d5f4e6"
                    : formData.riskLevel === "Medium"
                    ? "#fef9e7"
                    : formData.riskLevel === "High"
                    ? "#fdf2e9"
                    : "#fadbd8",
                color:
                  formData.riskLevel === "Low"
                    ? "#27ae60"
                    : formData.riskLevel === "Medium"
                    ? "#f39c12"
                    : formData.riskLevel === "High"
                    ? "#e67e22"
                    : "#e74c3c",
                border: `2px solid ${
                  formData.riskLevel === "Low"
                    ? "#27ae60"
                    : formData.riskLevel === "Medium"
                    ? "#f39c12"
                    : formData.riskLevel === "High"
                    ? "#e67e22"
                    : "#e74c3c"
                }`,
              }}
            >
              {formData.riskLevel || "Not Identified"}
            </span>
          </div>
        </div>

        <div style={fullWidthStyle}>
          <TextAreaField
            label="Existing Controls"
            name="existingcontrols"
            value={formData.existingcontrols || ""}
            onChange={handleInputChange}
            placeholder="Controls which are already implemented..."
            rows={3}
          />
        </div>
      </div>
    </>
  );
};

export default RiskDetailsForm;
