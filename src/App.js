import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import HamburgerMenu from "./components/navigations/HamburgerMenu";

// Risk Assessment Module Pages
import RiskAssessment from "./modules/riskAssesment/pages/RiskAssessment";
import AddRisk from "./modules/riskAssesment/pages/AddRisk";
import TemplatesPage from "./modules/riskAssesment/pages/TemplatesPage";
import TaskManagement from "./modules/riskAssesment/pages/TaskManagement";
import SavedRisksPage from "./modules/riskAssesment/pages/SavedRisksPage";

// Global Pages
import Documentation from "./modules/documentation/pages/Documentation";
import SoaPage from "./modules/documentation/pages/SoaPage";
import ControlsPage from "./modules/documentation/pages/ControlPage";
import ReportsPage from "./modules/documentation/pages/ReportPage";
import DocumentationSettingsPage from "./modules/documentation/pages/DocumentationSettingsPage";
import MLD from "./modules/documentation/pages/MLD";
import LoginPage from "./modules/departments/pages/loginPage";
import GapAssessmentDashboard from "./modules/gapAssessment/pages/GapAssessment";
import NewAssessment from "./modules/gapAssessment/pages/NewAssessment";
import AssessmentHistory from "./modules/gapAssessment/pages/AssessmentHistory";

import "./styles/GlobalStyles.css";

// --- ProtectedRoute Component
const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  // --- Get current user from sessionStorage
  const user = JSON.parse(sessionStorage.getItem("user"));
  return (
    <Route
      {...rest}
      render={(props) =>
        user && allowedRoles.includes(user.role) ? (
          <Component {...props} />
        ) : (
          <Redirect to="/" /> // redirect to login or unauthorized page
        )
      }
    />
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <HamburgerMenu />
        <main className="main-content">
          <Switch>
            {/* Risk Assessment Module Routes */}
            <Route exact path="/" component={LoginPage} />
            <Route exact path="/risk-assessment" component={RiskAssessment} />
            <Route path="/risk-assessment/add" component={AddRisk} />

            {/* 🔒 Only risk_owner and risk_manager can access */}
            <ProtectedRoute
              path="/risk-assessment/saved"
              component={SavedRisksPage}
              allowedRoles={["risk_owner", "risk_manager"]}
            />

            <Route
              path="/risk-assessment/templates"
              component={TemplatesPage}
            />
            <Route path="/risk-assessment/tasks" component={TaskManagement} />

            {/* Global App Routes */}
            <Route exact path="/documentation" component={Documentation} />
            <Route path="/documentation/soa" component={SoaPage} />
            <Route path="/documentation/controls" component={ControlsPage} />
            <Route path="/documentation/reports" component={ReportsPage} />
            <Route
              path="/documentation/settings"
              component={DocumentationSettingsPage}
            />
            <Route path="/documentation/mld" component={MLD} />
            <Route
              exact
              path="/gap-assessment"
              component={GapAssessmentDashboard}
            />
            <Route exact path="/gap-assessment/new" component={NewAssessment} />
            <Route
              exact
              path="/gap-assessment/history"
              component={AssessmentHistory}
            />
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
