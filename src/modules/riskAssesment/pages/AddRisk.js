// import React from 'react';
// import { useHistory } from 'react-router-dom';
// import MultiStepFormManager from '../components/forms/MultiStepFormManager';
// import '../styles/GlobalStyles.css';

// const AddRisk = () => {
//   const history = useHistory();

//   const handleSubmit = (formData) => {
//     console.log('Risk Assessment Data:', formData);
//     // Here you would typically save the data to your backend or state management
//     // For now, we'll just redirect to the saved risks page
//     alert('Risk Assessment submitted successfully!');
//     history.push('/risk-assessment');
//   };

//   const handleCancel = () => {
//     history.push('/risk-assessment');
//   };

//   return (
//     <div className="page-container">
//       <div className="page-header">
//         <h1>Add New Risk Assessment</h1>
//       </div>

//       <MultiStepFormManager
//         onSubmit={handleSubmit}
//         onCancel={handleCancel}
//       />
//     </div>
//   );
// };

// export default AddRisk;

// import React from 'react';
// import { useLocation } from 'react-router-dom';
// import MultiStepFormManager from '../components/forms/MultiStepFormManager';

// const AddRisk = () => {
//   const location = useLocation();
//   const focusArea = location.state?.focusArea || 'risk';

//   const handleSubmit = (formData) => {
//     console.log('Risk Assessment Data:', formData);
//   };

//   return (
//     <div>
//       <MultiStepFormManager onSubmit={handleSubmit} focusArea={focusArea} />

//           </div>

//   );
// };

// export default AddRisk;

import React,{useEffect,useState} from "react";
import { useHistory, useLocation } from "react-router-dom";
import MultiStepFormManager from "../components/forms/MultiStepFormManager";

const AddRisk = () => {
  const history = useHistory();
  const location = useLocation();
  const focusArea = location.state?.focusArea || "risk";

  const [showButtons, setShowButtons] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // Scrolling down
        setShowButtons(false);
      } else {
        // Scrolling up
        setShowButtons(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const handleSubmit = (formData) => {
    console.log("Risk Assessment Data:", formData);
    // submission logic here...
  };

  return (
    <div className="page-container" style={{ padding: "30px 40px 0px 40px" }}>
      <button
        style={{
          position: "sticky",
          top: "0",
          margin: "10px",
          padding: "10px 24px",
          borderRadius: "8px",
          background: "#005FCC",
          border: "none",
          color: "#fff",
          fontWeight: "500",
          fontSize: "14px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "transform 0.3s ease, opacity 0.3s ease",
          zIndex: 999,
          transform: showButtons ? "translateY(0)" : "translateY(-100%)",
          opacity: showButtons ? 1 : 0,
        }}
        onClick={() => history.push("/risk-assessment")}
      >
        ← Back to Dashboard{" "}
      </button>

      <MultiStepFormManager onSubmit={handleSubmit} focusArea={focusArea} />
    </div>
  );
};

export default AddRisk;
