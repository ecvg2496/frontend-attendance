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
import SignIn from "layouts/authentication/sign-in";
import ChangePassword from "layouts/authentication/change-password";

// @mui icons
import Icon from "@mui/material/Icon";

//Content Page
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
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
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
    key: "generate",
    route: "/candidate/export",
    component: <GenerateExel />,
  },

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
