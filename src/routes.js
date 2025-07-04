/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ResetPassword from "layouts/authentication/reset-password/cover";
import ChangePassword from "layouts/authentication/change-password";

// @mui icons
import Icon from "@mui/material/Icon";

//Content Page
import Employee from "layouts/dashboard/employee";
import Positions from "layouts/dashboard/positions";
import Platforms from "layouts/dashboard/platforms";
import Tags from "layouts/dashboard/tags";
import Questions from "layouts/dashboard/questions";
import MainPage from "layouts/content_page/main";
import Careers from "layouts/content_page/careers";
import Response from "layouts/content_page/careers/response";
import PersonalInformation from "layouts/content_page/careers/personal-information";
import PersonalForm from "layouts/content_page/careers/personal-information/personal";
import WorkExperienceForm from "layouts/content_page/careers/personal-information/work-experience";
import ExperienceForm from "layouts/content_page/careers/personal-information/work-experience/experience";
import PersonalDetailsForm from "layouts/content_page/careers/personal-information/personal-details";
import CareerQuestionsForm from "layouts/content_page/careers/career-questions";
import ReferenceInformation from "layouts/content_page/careers/reference-information";
import ReferenceForm from "layouts/content_page/careers/reference-information/reference";
import CareerSubmitted from "layouts/content_page/careers/submit";
import Educational from "layouts/content_page/careers/personal-information/educational";
import EducationalAttainmentForm from "layouts/content_page/careers/personal-information/educational/education";
import Dependents from "layouts/content_page/careers/personal-information/dependents";
import DependentsForm from "layouts/content_page/careers/personal-information/dependents/dependents";
import Report from "layouts/dashboard/report";
import Designation from "layouts/dashboard/designation";
import GenerateExel from "layouts/dashboard/employee/generate-exel";
import AttendanceAdminProfile from "layouts/attendance_dashboard/admin_profile";
import AttendanceAdminDashboard from "layouts/attendance_dashboard/index";
import AttendanceAdminAssignEmployee from "layouts/attendance_dashboard/client/";
import AttendanceAdminActivitiesHistory from "layouts/attendance_dashboard/client/activities";
import AttendanceAdminEmployee from "layouts/attendance_dashboard/index";
import AttendanceAdminEmployeeBrowse from "layouts/attendance_dashboard/client/browse";
import AttendanceAdminLogs from "layouts/attendance_dashboard/logs/index";
import AttendanceAdminLeaveDashboard from "layouts/attendance_dashboard/leave/index";
import AttendanceAdminLeaveClient from "layouts/attendance_dashboard/leave/leave_credit";
import AttendanceAdminClient from "layouts/attendance_dashboard/client/dashboard";
import AttendanceAdminRequest from "layouts/attendance_dashboard/client/request";
import AttendanceAdminTimesheet from "layouts/attendance_dashboard/timesheet";
import AttendanceAdminSchedule from "layouts/attendance_dashboard/schedule";
import AttendanceAdminPTO from "layouts/attendance_dashboard/client/pto";
import AttendanceUserProfile from "layouts/attendance/user_profile";
import AttendanceUserDashboard from "layouts/attendance/index";
import AttendanceUserLogs from "layouts/attendance/logs/"
import AttendanceUserPayslip from "layouts/attendance/payslip/";
import AttendanceUserLeave from "layouts/attendance/leave/index"; 
import AttendanceUserMakeUpHours from "layouts/attendance/make_up_request";
import AttendanceUserScheduleRequest from "layouts/attendance/schedule_request";
import AttendanceUserTimesheet from "layouts/attendance/timesheet";
const routes = [
  {
    type: "hidden",
    key: "dashboard",
    route: "/",
    component: <MainPage />,
  },
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Report",
    key: "report",
    icon: <Icon fontSize="small">assessment</Icon>,
    route: "/report",
    component: <Report />,
  },
  {
    type: "collapse",
    name: "Candidate",
    key: "candidate",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/candidate",
    component: <Employee />,
  },
  {
    type: "collapse",
    name: "Hired",
    key: "hired",
    icon: <Icon fontSize="small">accessibility</Icon>,
    route: "/hired",
    component: <Designation />,
  },
  {
    type: "collapse",
    name: "Platform",
    key: "platform",
    icon: <Icon fontSize="small">language</Icon>,
    route: "/platform",
    component: <Platforms />,
  },
  {
    type: "collapse",
    name: "Tags",
    key: "tags",
    icon: <Icon fontSize="small">style</Icon>,
    route: "/tags",
    component: <Tags />,
  },
  {
    type: "collapse", 
    name: "Positions",
    key: "positions",
    icon: <Icon fontSize="small">apps</Icon>,
    route: "/positions",
    component: <Positions />,
  },
  {
    type: "collapse",
    name: "Questions",
    key: "questions",
    icon: <Icon fontSize="small">quiz</Icon>,
    route: "/questions",
    component: <Questions />,
  },
  // {
  //   type: "collapse",
  //   name: "Careers",
  //   key: "careers",
  //   icon: <Icon fontSize="small">table_view</Icon>,
  //   collapse: [
  //   ]
  // },
  // {
  //   type: "collapse",
  //   name: "Tables",
  //   key: "tables",
  //   icon: <Icon fontSize="small">table_view</Icon>,
  //   route: "/tables",
  //   component: <Tables />,
  // },
  // {
  //   type: "collapse",
  //   name: "Billing",
  //   key: "billing",
  //   icon: <Icon fontSize="small">receipt_long</Icon>,
  //   route: "/billing",
  //   component: <Billing />,
  // },
  // {
  //   type: "collapse",
  //   name: "RTL",
  //   key: "rtl",
  //   icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
  //   route: "/rtl",
  //   component: <RTL />,
  // },
  // {
  //   type: "collapse",
  //   name: "Notifications",
  //   key: "notifications",
  //   icon: <Icon fontSize="small">notifications</Icon>,
  //   route: "/notifications",
  //   component: <Notifications />,
  // },
  {
    type: "hidden",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "hidden",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "hidden",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
  {
    type: "hidden", //hidden
    name: "Reset Password",
    key: "reset-password",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/reset-password",
    component: <ResetPassword />,
  },
  {
    type: "hidden", //hidden
    name: "Change Password",
    key: "change-password",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/change-password",
    component: <ChangePassword />,
  },
  {
    type: "hidden", //hidden
    key: "careers",
    route: "/careers",
    component: <Careers />,
  },
  {
    type: "hidden", //hidden
    key: "response",
    route: "/careers/response",
    component: <Response />,
  },
  {
    type: "hidden", //hidden
    key: "personal",
    route: "/careers/personalinfo",
    component: <PersonalInformation />,
  },
  {
    type: "hidden", //hidden
    key: "personalform",
    route: "/careers/personalinfo/personalform",
    component: <PersonalForm />,
  },
  {
    type: "hidden", //hidden
    key: "workexperienceform",
    route: "/careers/personalinfo/workexperienceform",
    component: <WorkExperienceForm />,
  },
  {
    type: "hidden", //hidden
    key: "experienceform",
    route: "/careers/personalinfo/experienceform",
    component: <ExperienceForm />,
  },
  {
    type: "hidden", //hidden
    key: "personaldetailsform",
    route: "/careers/personalinfo/detailsform",
    component: <PersonalDetailsForm />,
  },
  {
    type: "hidden", //hidden
    key: "educational",
    route: "/careers/personalinfo/educational",
    component: <Educational />,
  },
  {
    type: "hidden", //hidden
    key: "dependents",
    route: "/careers/personalinfo/dependents",
    component: <Dependents />,
  },
  {
    type: "hidden", //hidden
    key: "dependentsform",
    route: "/careers/personalinfo/dependentsForm",
    component: <DependentsForm />,
  },
  {
    type: "hidden", //hidden
    key: "educationalform",
    route: "/careers/personalinfo/educational/form",
    component: <EducationalAttainmentForm />,
  },
  {
    type: "hidden", //hidden
    key: "careerquestions",
    route: "/careers/questions",
    component: <CareerQuestionsForm />,
  },
  {
    type: "hidden", //hidden
    key: "referrenceform",
    route: "/careers/reference/referenceform",
    component: <ReferenceForm />,
  },
  {
    type: "hidden", //hidden
    key: "submitted",
    route: "/careers/submitted",
    component: <CareerSubmitted />,
  },
  {
    type: "hidden", //hidden
    key: "generate",
    route: "/candidate/export",
    component: <GenerateExel />,
  },
  // {
  //   type: "collapse",
  //   name: "Main Page",
  //   key: "main-page",
  //   icon: <Icon fontSize="small">home</Icon>,
  //   route: "/",
  //   component: <MainPage />,
  // },
  
  //For ATTENDANCE ROUTES
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/user",
    component: <AttendanceUserDashboard />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/user/log",
    component: <AttendanceUserLogs />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/user/payslip",
    component: <AttendanceUserPayslip />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/user/leave",
    component: <AttendanceUserLeave />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/user/make-up",
    component: <AttendanceUserMakeUpHours />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/user/schedule-request",
    component: <AttendanceUserScheduleRequest />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/user/timesheet",
    component: <AttendanceUserTimesheet />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/user/profile",
    component: <AttendanceUserProfile />
  },
  {
    type: "hidden", 
    key: "submitted",
    route: "/attendance/admin/dashboard",
    component: <AttendanceAdminDashboard />,
  },
   {
    type: "hidden",
    key: "submitted",
    route: "/attendance/admin/client",
    component: <AttendanceAdminClient />
  },
    {
    type: "hidden",
    key: "submitted",
    route: "/attendance/admin/request",
    component: <AttendanceAdminRequest />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/admin/logs",
    component: <AttendanceAdminLogs />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/admin/timesheet",
    component: <AttendanceAdminTimesheet />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/admin/profile",
    component: <AttendanceAdminProfile />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/admin/leave",
    component: <AttendanceAdminLeaveDashboard />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/admin/leave-credit",
    component: <AttendanceAdminLeaveClient />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/admin/employee",
    component: <AttendanceAdminEmployee />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/admin/dashboard/browse",
    component: <AttendanceAdminEmployeeBrowse />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/admin/assign-users",
    component: <AttendanceAdminAssignEmployee />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "/attendance/admin/activities-history",
    component: <AttendanceAdminActivitiesHistory />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "attendance/admin/schedule",
    component: <AttendanceAdminSchedule />
  },
  {
    type: "hidden",
    key: "submitted",
    route: "attendance/admin/pto",
    component: <AttendanceAdminPTO />
  },
];

export default routes;
