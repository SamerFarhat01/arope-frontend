import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EditEmployeeModal from '../../components/EditEmployeeModal/EditEmployeeModal';
import './EmployeeDetail.css';
import Axios from 'axios';
import { Button } from '@mui/material';

const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'

const EmployeeDetail = ({ departments, getEmployees, locations, employees}) => {
    const [employee, setEmployee] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();

    const handleEditClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleEmployeeUpdated = () => {
        window.location.reload();
    };

    const getEmployee = async () => {
        console.log(window.location.pathname.split("/")[2]);
        const response = await Axios.get(`${baseUrl}/employee/${window.location.pathname.split("/")[2]}`);
        setEmployee(response.data);
    };

    useEffect(() => {
        getEmployee();
    }, []);
    console.log(employee)
    return (
        <div className="employee-detail">
            <h1 style={{ "marginBottom": "15px" }}>Employee Detail</h1>
            <table className="employee-detail-table">
                <tbody>
                    <tr>
                        <th>First Name</th>
                        <td>{employee.first_name}</td>
                    </tr>
                    <tr>
                        <th>Last Name</th>
                        <td>{employee.last_name}</td>
                    </tr>
                    <tr>
                        <th>Email</th>
                        <td>{employee.email}</td>
                    </tr>
                    <tr>
                        <th>Days</th>
                        <td>{employee.days}</td>
                    </tr>
                    <tr>
                        <th>Department</th>
                        <td>{employee.department_name}</td>
                    </tr>
                    <tr>
                        <th>Manager</th>
                        <td>{employee.manager_full_name ? `${employee.manager_full_name}` : "None"}</td>
                    </tr>
                    <tr>
                        <th>First Approver</th>
                        <td>{employee.first_approver_full_name ? `${employee.first_approver_full_name}` : "None"}</td>
                    </tr>
                    <tr>
                        <th>Location</th>
                        <td>{employee.location_name}</td>
                    </tr>
                </tbody>
            </table>
            <Button style={{ "marginRight": "15px" }} variant="contained" color="success" onClick={handleEditClick}>Edit</Button>
            <Button variant="contained" onClick={() => navigate(`/employee/${employee.id}/leaves`)}>Leaves</Button>
            <EditEmployeeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                employee={employee}
                onEmployeeUpdated={handleEmployeeUpdated}
                departments={departments}
                locations={locations}
                employees={employees}
                isManager={departments.filter(d => d.id === employee.department_id)[0]?.manager_id === employee.id}
            />
        </div>
    );
};

export default EmployeeDetail;




