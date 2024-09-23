import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import EmployeeTable from './pages/employee-table/EmployeeTable';
import LeaveRequestsTable from './pages/employee-table/LeaveRequestTable';
import Login from './components/Login/Login';
import EmployeeDetail from './components/EmployeeDetail/EmployeeDetail';
import NavBar from './components/NavBar/NavBar';
import BlankPage from './components/BlankPage/BlankPage';
import Departments from './components/Departments/Departments';
import Logs from './components/Logs/Logs';
import Locations from './components/Locations/Locations';
import LeavesPage from './components/LeavesPage/LeavesPage';
import ManagerLeaveRequests from './components/ManagerLeaveRequests/ManagerLeaveRequests';
import HolidayForm from './components/HolidayForm/HolidayForm';
import { jwtDecode } from 'jwt-decode';
import HRSharedCalendar from './components/HRSharedCalendar/HRSharedCalendar';
import LeaveSummaryPage from './components/LeaveSummaryPage/LeaveSummaryPage';
import FirstApprovalRequests from './components/FirstApprover/FirstApprover';
import HRLeaveRequests from './components/HRLeaveRequests/HRLeaveRequests';

const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'

function App() {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [department, setDepartment] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isHr, setIsHr] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const [isFirstApprover, setIsFirstApprover] = useState(false);
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState(null);

    const getCookie = (cname) => {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };

    const deleteEmployee = async (id) => {
        try {
            const res = await Axios.delete(`${baseUrl}/employee/${id}`, {
                headers: { Authorization: `Bearer ${getCookie("access_token")}` },
            });
            setEmployees(employees.filter(e => e.id !== id));
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    const getUser = async () => {
        let token = getCookie("access_token");
        let id = jwtDecode(token).id;
        setUserId(id);
        try {
            const response = await Axios.get(`${baseUrl}/employee/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("User data:", response.data);
            setFirstName(response.data.first_name);
            setLastName(response.data.last_name);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const getEmployees = async () => {
        try {
            const response = await Axios.get(`${baseUrl}/employee`, {
                headers: { Authorization: `Bearer ${getCookie("access_token")}` },
            });
            console.log("Employees data:", response.data);
            
            // Map the response to include full_name and manager_full_name
            const employeesWithNames = response.data.map(e => ({
                ...e,
                full_name: `${e.first_name} ${e.last_name}`,  // Combine first and last name
                manager_full_name: e.manager_full_name != null ? e.manager_full_name : "None"
            }));
            
            setEmployees(employeesWithNames);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };
    

    const fetchDepartments = async () => {
        try {
            const response = await Axios.get(`${baseUrl}/departments`);
            console.log("Departments data:", response.data);
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };
    const fetchLocations = async () => {
        try {
            const response = await Axios.get(`${baseUrl}/location`, {
                headers: { Authorization: `Bearer ${getCookie('access_token')}` },
            });
            setLocations(response.data);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            getEmployees();
            getUser();
            fetchDepartments();
            fetchLocations();
            let token = getCookie("access_token");
            setIsHr(jwtDecode(token).is_hr);
            setIsManager(jwtDecode(token).is_manager);
            setIsFirstApprover(jwtDecode(token).is_first_approver); 
            console.log("Token decoded:", jwtDecode(token));
        } else {
            let token = getCookie("access_token");
            setToken(token);
            setIsAuthenticated(token != null && token !== '');

            if (token != null && token !== '') {
                setIsHr(jwtDecode(token).is_hr);
                setIsManager(jwtDecode(token).is_manager);
                setIsFirstApprover(jwtDecode(token).is_first_approver);
                console.log("Token decoded:", jwtDecode(token));

                if (token != null) {
                    getEmployees();
                    fetchDepartments();
                    fetchLocations();
                }
            }
        }
    }, [isAuthenticated]);

    const handleLoginSuccess = (token, userDepartment, userFirstName, userLastName, isHr, isManager, isFirstApprover) => {
        console.log('Login success:', token, userDepartment, userFirstName, userLastName, isHr, isManager, isFirstApprover);
        let expires = new Date();
        expires.setTime(expires.getTime() + 300000000);
        document.cookie = `access_token=${token}`;
        setDepartment(userDepartment);
        setFirstName(userFirstName);
        setLastName(userLastName);
        setIsHr(isHr);
        setIsManager(isManager);
        setIsFirstApprover(isFirstApprover);
        window.location.href = "/";
    };

    const handleLogout = () => {
        document.cookie = 'access_token=';
        setTimeout(() => {
            window.location.href = "/login";
        }, 1000)
    };

    console.log("dcndiciodi"+locations)
    

    return (
        <Router>
            <div className="App">
                {(isAuthenticated) && <NavBar isHr={isHr} isManager={isManager} firstName={firstName} lastName={lastName} handleLogout={handleLogout} />}
                <Routes>
                    <Route
                        path="/login"
                        element={!isAuthenticated ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />}
                    />
                    {isAuthenticated && (
                        <>
                            <Route
                                path="/"
                                element={<BlankPage isHr={isHr} isManager={isManager} isEmployee={!isHr && !isManager} isFirstApprover={isFirstApprover}/>}
                            />
                            <Route
                                path="/first-approval-requests"
                                element={isFirstApprover ? <FirstApprovalRequests token={token} /> : <Navigate to="/" />}
                            />
                            <Route
                                path="/employees"
                                element={
                                    isHr ? <Navigate to="/" /> : <LeaveRequestsTable userId={userId} token={token} employees={employees} departments={departments} />
                                }
                            />
                            <Route
                                path="/employee/:id"
                                element={
                                    <EmployeeDetail employees={employees} departments={departments} locations={locations} getEmployees={getEmployees} />
                                }
                            />
                            <Route
                                path="/leave-requests"
                                element={<LeaveRequestsTable userId={userId} token={token} employees={employees} departments={departments} />}
                            />
                            <Route
                                path="/departments"
                                element={<Departments token={token} />}
                            />
                            <Route
                                path="/staff"
                                element={<EmployeeTable token={token} locations = {locations} employees={employees} getEmployees={getEmployees} deleteEmployee={deleteEmployee} departments={departments} setEmployees={setEmployees} />}
                            />
                            <Route
                                path="/logs"
                                element={<Logs token={token} />}
                            />
                            <Route
                                path="/locations"
                                element={<Locations token={token} />}
                            />
                            <Route
                                path="/holiday-form"
                                element={<HolidayForm token={token} />} 
                            />
                            <Route
                                path="/employee/:id/leaves"
                                element={<LeavesPage />}
                            />
                            <Route
                                path="/manager-leave-requests"
                                element={<ManagerLeaveRequests token={token} />}
                                
                            />
                            <Route
                                path="/hr-leave-requests"
                                element={<HRLeaveRequests token={token} />}
                                
                            />
                            <Route
                                path="/shared-calendar"
                                element={<HRSharedCalendar token={token} />}
                                
                            />
                            <Route
                                path="/leave-summary"
                                element={<LeaveSummaryPage employeeId={userId} />} // New Route
                            />
                        </>
                    )}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
