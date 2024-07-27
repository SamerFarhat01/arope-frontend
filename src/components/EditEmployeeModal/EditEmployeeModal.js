import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './EditEmployeeModal.css';

const EditEmployeeModal = ({ isOpen, onClose, employee, onEmployeeUpdated, departments, isManager }) => {
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
            setFirstName(employee.first_name);
            setMiddleName(employee.middle_name);
            setLastName(employee.last_name);
            setEmail(employee.email);
            setDepartmentName(employee.department_name);
            setManagerName(employee.manager_first_name ? `${employee.manager_first_name} ${employee.manager_last_name}` : "None");
            setDepartmentId(departments.filter(d => d.name === employee.department_name)[0]?.id);
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

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <button className="close-button" onClick={onClose}>X</button>
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
