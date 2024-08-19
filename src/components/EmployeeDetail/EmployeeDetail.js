import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EditEmployeeModal from '../../components/EditEmployeeModal/EditEmployeeModal';
import './EmployeeDetail.css';
import Axios from 'axios';
import { Button } from '@mui/material';

const EmployeeDetail = ({ departments, getEmployees }) => {
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
        const response = await Axios.get(`http://localhost:5000/employee/${window.location.pathname.split("/")[2]}`);
        setEmployee(response.data);
    };

    useEffect(() => {
        getEmployee();
    }, []);

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
                        <th>Middle Name</th>
                        <td>{employee.middle_name}</td>
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
                        <th>Department</th>
                        <td>{employee.department_name} {departments.filter(d => d.id === employee.department_id)[0]?.manager_id === employee.id ? "(Manager)" : ""}</td>
                    </tr>
                    <tr>
                        <th>Manager</th>
                        <td>{employee.manager_first_name ? `${employee.manager_first_name} ${employee.manager_last_name}` : "None"}</td>
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
                getEmployees={getEmployees}
                isManager={departments.filter(d => d.id === employee.department_id)[0]?.manager_id === employee.id}
            />
        </div>
    );
};

export default EmployeeDetail;

// import React, { useEffect, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import EditEmployeeModal from '../../components/EditEmployeeModal/EditEmployeeModal';
// import './EmployeeDetail.css';
// import Axios from 'axios';
// import { Button } from '@mui/material';

// const EmployeeDetail = ({ departments, getEmployees }) => {
//     const [employee, setEmployee] = useState({});
//     const [isModalOpen, setIsModalOpen] = useState(false);

//     const navigate = useNavigate();

//     const handleEditClick = () => {
//         setIsModalOpen(true);
//     };

//     const handleCloseModal = () => {
//         setIsModalOpen(false);
//     };

//     const handleEmployeeUpdated = () => {
//         window.location.reload();
//     };

//     const getEmployee = async () => {
//         console.log(window.location.pathname.split("/")[2]);
//         const response = await Axios.get(`http://localhost:5000/employee/${window.location.pathname.split("/")[2]}`);
//         setEmployee(response.data);
//     };

//     useEffect(() => {
//         getEmployee();
//     }, []);

//     return (
//         <div className="employee-detail">
//             <h1 style={{ "marginBottom": "15px" }}>Employee Detail</h1>
//             <table className="employee-detail-table">
//                 <tbody>
//                     <tr>
//                         <th>First Name</th>
//                         <td>{employee.first_name}</td>
//                     </tr>
//                     <tr>
//                         <th>Middle Name</th>
//                         <td>{employee.middle_name}</td>
//                     </tr>
//                     <tr>
//                         <th>Last Name</th>
//                         <td>{employee.last_name}</td>
//                     </tr>
//                     <tr>
//                         <th>Email</th>
//                         <td>{employee.email}</td>
//                     </tr>
//                     <tr>
//                         <th>Department</th>
//                         <td>{employee.department_name} {departments.filter(d => d.id === employee.department_id)[0]?.manager_id === employee.id ? "(Manager)" : ""}</td>
//                     </tr>
//                     <tr>
//                         <th>Manager</th>
//                         <td>{employee.manager_first_name ? `${employee.manager_first_name} ${employee.manager_last_name}` : "None"}</td>
//                     </tr>
                    
//                 </tbody>
//             </table>
//             <Button style={{ "marginRight": "15px" }} variant="contained" color="success" onClick={handleEditClick}>Edit</Button>
//             <Button variant="contained" onClick={() => navigate(`/employee/${employee.id}/leaves`)}>Leaves</Button>
//             <EditEmployeeModal
//                 isOpen={isModalOpen}
//                 onClose={handleCloseModal}
//                 employee={employee}
//                 onEmployeeUpdated={handleEmployeeUpdated}
//                 departments={departments}
//                 getEmployees={getEmployees}
//                 isManager={departments.filter(d => d.id === employee.department_id)[0]?.manager_id === employee.id}
//             />
//         </div>
//     );
// };

// export default EmployeeDetail;


