import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './EditEmployeeModal.css';

const EditEmployeeModal = ({ isOpen, onClose, employee, onEmployeeUpdated, departments, isManager }) => {
    const [initialEmployeeData, setInitialEmployeeData] = useState({});
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [departmentName, setDepartmentName] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [department, setDepartment] = useState(null);
    const [manager, setManager] = useState([]);
    const [managerName, setManagerName] = useState('');
    const [managerId, setManagerId] = useState([]);

    function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) === ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
      }

    const fetchManager = async (departmentId) => {
        try {
            const response = await Axios.get(`http://localhost:5000/manager/${departmentId}`, {
                headers: { Authorization: `Bearer ${getCookie('access_token')}` },
            });
            setManager(response.data);
            setManagerId(response.data?.id);
        } catch (error) {
            console.error('Error fetching managers:', error);
        }
    };

    useEffect(() => {
        if (employee) {
            const initialData = {
                firstName: employee.first_name,
                middleName: employee.middle_name,
                lastName: employee.last_name,
                email: employee.email,
                departmentName: employee.department_name,
                departmentId: departments.filter(d => d.name === employee.department_name)[0]?.id,
                managerName: employee.manager_first_name ? `${employee.manager_first_name} ${employee.manager_last_name}` : "None",
                managerId: [],
            };

            setInitialEmployeeData(initialData);
            setFirstName(initialData.firstName);
            setMiddleName(initialData.middleName);
            setLastName(initialData.lastName);
            setEmail(initialData.email);
            setDepartmentName(initialData.departmentName);
            setDepartmentId(initialData.departmentId);
            setDepartment(departments.filter(d => d.name === employee.department_name)[0]);
        }
    }, [employee, departments]);

    useEffect(() => {
        fetchManager(departmentId);
    }, [departmentId]);

    function changeDepartment(id) {
        setDepartmentId(id);
        setDepartment(departments.filter(d => d.id === id)[0]);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedEmployee = {
                firstName,
                middleName,
                lastName,
                email,
                departmentId,
                managerId
            };
            await Axios.patch(`http://localhost:5000/employee/${employee.id}`, updatedEmployee, {
                headers: { Authorization: `Bearer ${getCookie('access_token')}` }
            });
            onEmployeeUpdated();
            onClose();
        } catch (error) {
            console.error('Error updating employee:', error);
        }
    };

    const handleClose = () => {
        setFirstName(initialEmployeeData.firstName);
        setMiddleName(initialEmployeeData.middleName);
        setLastName(initialEmployeeData.lastName);
        setEmail(initialEmployeeData.email);
        setDepartmentName(initialEmployeeData.departmentName);
        setDepartmentId(initialEmployeeData.departmentId);
        setManagerName(initialEmployeeData.managerName);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <button className="close-button" onClick={handleClose}>X</button>
                <h2>Edit Employee</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>First Name:</label>
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div>
                        <label>Middle Name:</label>
                        <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                    </div>
                    <div>
                        <label>Last Name:</label>
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    {
                        isManager ?
                        <div>
                            <label>Department:</label>
                            <input value={department.name} type="text" disabled />
                        </div>
                        :
                        <div>
                            <label>Department:</label>
                            <select value={department?.id} onChange={(e) => changeDepartment(e.target.value)} required>
                                <option value={department?.id}>{department?.name}</option>
                                {departments.filter(d => d.id !== department?.id).map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    }
                    <div>
                        <label>Manager:</label>
                        <input type="text" value={isManager ? "N/A" : manager?.first_name + " " + manager?.last_name} disabled />
                    </div>
                    <button type="submit">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default EditEmployeeModal;

