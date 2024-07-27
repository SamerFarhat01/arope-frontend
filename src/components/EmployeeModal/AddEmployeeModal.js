import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './AddEmployeeModal.css';

const AddEmployeeModal = ({ token, isOpen, onClose, onEmployeeAdded, departments, selectedEmployee }) => {
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [department, setDepartment] = useState({});
    const [managerId, setManagerId] = useState('');
    const [manager, setManager] = useState([]);
    

    useEffect(() => {
        const department = departments.filter(d => d.id == departmentId)[0];
        setDepartment(department);
        if (department?.id != null) {
            fetchManager(department.id);
        }
    }, [departmentId]);

    const fetchManager = async (departmentId) => {
        try {
            const response = await Axios.get(`http://localhost:5000/manager/${departmentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setManager(response.data);
        } catch (error) {
            console.error('Error fetching managers:', error);
        }
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        let managerId = manager.id;
        const hrUser = getCookie('user_id'); // Retrieve the HR user ID from cookie
        const newEmployee = {
            firstName,
            middleName,
            lastName,
            departmentId,
            managerId,
            hrUser
        };

        try {
            await Axios.post('http://localhost:5000/employee', newEmployee, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onEmployeeAdded();
            onClose();
        } catch (error) {
            console.error('Error adding employee:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>Add Employee</h2>
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
                        <label>Department:</label>
                        <select value={department?.id} onChange={(e) => setDepartmentId(e.target.value)} required>
                            <option value={department?.id}>{department?.name}</option>
                            {departments.filter(d => d.id != department?.id).map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Manager:</label>
                        <input type="text" value={manager.id == null ? "Select department first" : manager.first_name + " " + manager.last_name} disabled />
                    </div>
                    <button type="submit">Add Employee</button>
                </form>
            </div>
        </div>
    );
};

export default AddEmployeeModal;
