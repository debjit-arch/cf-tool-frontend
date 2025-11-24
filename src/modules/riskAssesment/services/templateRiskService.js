let templateRisks = [
  {
    riskId: "",
    department: "Information Security Officer (ISO)",
    date: "2025-09-05",
    riskType: "Cybersecurity",
    assetType: "Critical",
    asset: "Email Server",
    riskDescription: "Risk of phishing attacks leading to credential compromise due to lack of email filtering.",
    confidentiality: 3,
    integrity: 2,
    availability: 2,
    probability: 3,
    existingControls: "Basic spam filter",
    additionalNotes: "",
    controlReference: "5.25",
    additionalControls: `1) Deploy advanced phishing detection.
2) Conduct employee awareness training.
3) Implement email authentication protocols (DMARC, SPF, DKIM).`,
    numberOfDays: 20,
    deadlineDate: "2025-09-25",
    status: "Active",
    riskScore: 9,
    riskLevel: "High",
    likelihoodAfterTreatment: 1,
    impactAfterTreatment: 2,
    createdAt: "2025-09-05T08:10:45.233Z",
    updatedAt: "2025-09-05T10:40:01.120Z",
  },
  {
    riskId: "",
    department: "ISMS Steering Committee",
    date: "2025-09-09",
    riskType: "Operational",
    assetType: "Confidential",
    asset: "Payroll System",
    riskDescription: "Risk of incorrect salary disbursements due to system misconfiguration.",
    confidentiality: 1,
    integrity: 3,
    availability: 2,
    probability: 2,
    existingControls: "Manual reviews",
    additionalNotes: "",
    controlReference: "8.3",
    additionalControls: `1) Enable system-based validation rules.
2) Conduct peer review before payroll release.
3) Automate calculation checks.`,
    numberOfDays: 18,
    deadlineDate: "2025-09-27",
    status: "Active",
    riskScore: 6,
    riskLevel: "Medium",
    likelihoodAfterTreatment: 1,
    impactAfterTreatment: 1,
    createdAt: "2025-09-09T11:30:12.910Z",
    updatedAt: "2025-09-09T12:50:18.554Z",
  },
  {
    riskId: "",
    department: "Admin & Facilities",
    date: "2025-09-14",
    riskType: "Compliance",
    assetType: "Internal",
    asset: "Vendor Data",
    riskDescription: "Risk of dealing with non-compliant vendors due to outdated vendor information.",
    confidentiality: 1,
    integrity: 2,
    availability: 2,
    probability: 3,
    existingControls: "Annual vendor form collection",
    additionalNotes: "",
    controlReference: "7.5",
    additionalControls: `1) Implement automated vendor verification.
2) Require quarterly updates.
3) Conduct compliance audits.`,
    numberOfDays: 35,
    deadlineDate: "2025-10-19",
    status: "Active",
    riskScore: 6,
    riskLevel: "Medium",
    likelihoodAfterTreatment: 1,
    impactAfterTreatment: 1,
    createdAt: "2025-09-14T15:21:33.101Z",
    updatedAt: "2025-09-14T16:05:19.882Z",
  },
  {
    riskId: "",
    department: "IT Department",
    date: "2025-09-12",
    riskType: "Reputational",
    assetType: "Private",
    asset: "Employee Records",
    riskDescription: "Risk of privacy complaints due to improper handling of employee grievances.",
    confidentiality: 2,
    integrity: 1,
    availability: 2,
    probability: 2,
    existingControls: "Basic HR policy",
    additionalNotes: "",
    controlReference: "6.6",
    additionalControls: `1) Implement secure grievance portal.
2) Train HR on privacy handling.
3) Encrypt sensitive complaint data.`,
    numberOfDays: 22,
    deadlineDate: "2025-10-04",
    status: "Active",
    riskScore: 5,
    riskLevel: "Medium",
    likelihoodAfterTreatment: 1,
    impactAfterTreatment: 1,
    createdAt: "2025-09-12T09:55:51.200Z",
    updatedAt: "2025-09-12T10:21:41.114Z",
  },
  {
    riskId: "",
    department: "IT Infra",
    date: "2025-09-20",
    riskType: "Technical",
    assetType: "Internal",
    asset: "Backup Server",
    riskDescription: "Risk of data loss due to incomplete backup cycles.",
    confidentiality: 2,
    integrity: 3,
    availability: 3,
    probability: 2,
    existingControls: "Weekly backups",
    additionalNotes: "",
    controlReference: "5.31",
    additionalControls: `1) Introduce daily incremental backups.
2) Test restores monthly.
3) Monitor backup logs in real time.`,
    numberOfDays: 30,
    deadlineDate: "2025-10-20",
    status: "Active",
    riskScore: 8,
    riskLevel: "High",
    likelihoodAfterTreatment: 1,
    impactAfterTreatment: 1,
    createdAt: "2025-09-20T13:40:25.001Z",
    updatedAt: "2025-09-20T15:11:12.450Z",
  },
  {
    riskId: "",
    department: "Vendor Management",
    date: "2025-09-07",
    riskType: "Strategic",
    assetType: "Critical",
    asset: "Logistics Network",
    riskDescription: "Risk of delivery delays due to third-party transportation issues.",
    confidentiality: 1,
    integrity: 2,
    availability: 3,
    probability: 2,
    existingControls: "SLAs with vendors",
    additionalNotes: "",
    controlReference: "9.4",
    additionalControls: `1) Maintain backup transport partners.
2) Add penalty clauses.
3) Implement delivery tracking tools.`,
    numberOfDays: 40,
    deadlineDate: "2025-10-17",
    status: "Active",
    riskScore: 6,
    riskLevel: "Medium",
    likelihoodAfterTreatment: 1,
    impactAfterTreatment: 2,
    createdAt: "2025-09-07T10:40:11.200Z",
    updatedAt: "2025-09-07T11:21:10.771Z",
  },
  {
    riskId: "",
    department: "Procurement",
    date: "2025-09-14",
    riskType: "Compliance",
    assetType: "Internal",
    asset: "Vendor Data",
    riskDescription: "Risk of dealing with non-compliant vendors due to outdated vendor information.",
    confidentiality: 1,
    integrity: 2,
    availability: 2,
    probability: 3,
    existingControls: "Annual vendor form collection",
    additionalNotes: "",
    controlReference: "7.5",
    additionalControls: `1) Implement automated vendor verification.
2) Require quarterly updates.
3) Conduct compliance audits.`,
    numberOfDays: 35,
    deadlineDate: "2025-10-19",
    status: "Active",
    riskScore: 6,
    riskLevel: "Medium",
    likelihoodAfterTreatment: 1,
    impactAfterTreatment: 1,
    createdAt: "2025-09-14T15:21:33.101Z",
    updatedAt: "2025-09-14T16:05:19.882Z",
  },
  {
    riskId: "",
    department: "Legal",
    date: "2025-09-18",
    riskType: "Compliance",
    assetType: "Confidential",
    asset: "Legal Contracts",
    riskDescription: "Risk of expired contracts remaining in use due to lack of renewal reminders.",
    confidentiality: 2,
    integrity: 2,
    availability: 2,
    probability: 3,
    existingControls: "Manual tracking",
    additionalNotes: "",
    controlReference: "7.8",
    additionalControls: `1) Implement automated contract expiry alerts.
2) Maintain centralized contract repository.
3) Conduct quarterly contract audits.`,
    numberOfDays: 55,
    deadlineDate: "2025-11-12",
    status: "Active",
    riskScore: 6,
    riskLevel: "Medium",
    likelihoodAfterTreatment: 1,
    impactAfterTreatment: 1,
    createdAt: "2025-09-18T10:20:33.911Z",
    updatedAt: "2025-09-18T11:08:11.771Z",
  },
  {
    riskId: "",
    department: "HR",
    date: "2025-09-12",
    riskType: "Reputational",
    assetType: "Private",
    asset: "Employee Records",
    riskDescription: "Risk of privacy complaints due to improper handling of employee grievances.",
    confidentiality: 2,
    integrity: 1,
    availability: 2,
    probability: 2,
    existingControls: "Basic HR policy",
    additionalNotes: "",
    controlReference: "6.6",
    additionalControls: `1) Implement secure grievance portal.
2) Train HR on privacy handling.
3) Encrypt sensitive complaint data.`,
    numberOfDays: 22,
    deadlineDate: "2025-10-04",
    status: "Active",
    riskScore: 5,
    riskLevel: "Medium",
    likelihoodAfterTreatment: 1,
    impactAfterTreatment: 1,
    createdAt: "2025-09-12T09:55:51.200Z",
    updatedAt: "2025-09-12T10:21:41.114Z",
  },
  {
    riskId: "",
    department: "IT Applications",
    date: "2025-09-25",
    riskType: "Technical",
    assetType: "Critical",
    asset: "Firewall",
    riskDescription: "Risk of security breach due to outdated firewall rules.",
    confidentiality: 3,
    integrity: 3,
    availability: 2,
    probability: 2,
    existingControls: "Quarterly rule review",
    additionalNotes: "",
    controlReference: "5.14",
    additionalControls: `1) Conduct monthly rule updates.
2) Remove obsolete rules.
3) Implement automated rule testing.`,
    numberOfDays: 12,
    deadlineDate: "2025-10-07",
    status: "Active",
    riskScore: 8,
    riskLevel: "High",
    likelihoodAfterTreatment: 1,
    impactAfterTreatment: 1,
    createdAt: "2025-09-25T12:10:10.998Z",
    updatedAt: "2025-09-25T12:48:55.110Z",
  }
];



const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAllTemplateRisks = async () => {
  await delay(200);
  return [...templateRisks];
};

export const getTemplateRiskById = async (riskId) => {
  await delay(100);
  return templateRisks.find((r) => r.riskId === riskId);
};

export const saveTemplateRisk = async (risk) => {
  await delay(100);
  const index = templateRisks.findIndex((r) => r.riskId === risk.riskId);
  if (index > -1) {
    templateRisks[index] = { ...risk };
  } else {
    templateRisks.push({ ...risk });
  }
  return risk;
};

export const deleteTemplateRisk = async (riskId) => {
  await delay(100);
  templateRisks = templateRisks.filter((r) => r.riskId !== riskId);
  return true;
};

export default {
  getAllTemplateRisks,
  getTemplateRiskById,
  saveTemplateRisk,
  deleteTemplateRisk,
};
