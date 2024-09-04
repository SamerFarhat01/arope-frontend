import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './EditEmployeeModal.css';

const EditEmployeeModal = ({ isOpen, onClose, employee, onEmployeeUpdated, departments, isManager, locations }) => {
    const [initialEmployeeData, setInitialEmployeeData] = useState({});
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [departmentName, setDepartmentName] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [department, setDepartment] = useState(null);
    const [manager, setManager] = useState([]);
    const [location, setLocation] = useState(null);
    const [locationId, setLocationId] = useState(null);
    const [managerName, setManagerName] = useState('');
    const [managerId, setManagerId] = useState([]);
    const [managersOfManagers, setManagersOfManagers] = useState([]);
    const [managerOfManagerId, setManagerOfManagerId] = useState(null);
    const [managerOfManagerName, setManagerOfManagerName] = useState(null);

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

    const fetchNonDepartmentManagers = async () => {
        try {
            const response = await Axios.get(`http://localhost:5000/managers-of-managers`, {
                headers: { Authorization: `Bearer ${getCookie('access_token')}` },
            });
            setManagersOfManagers(response.data.filter(mom => mom.id != employee.id));
        } catch (error) {
            console.error('Error fetching managers:', error);
        }
    }


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
                managerOfManagerId: employee.department_name == "Manager" ? employee.manager_id : null,
                managerId: [],
                locationName: employee.location_name
            };

            setInitialEmployeeData(initialData);
            setFirstName(initialData.firstName);
            setMiddleName(initialData.middleName);
            setLastName(initialData.lastName);
            setEmail(initialData.email);
            setDepartmentName(initialData.departmentName);
            setDepartmentId(initialData.departmentId);
            setDepartment(departments.filter(d => d.name === employee.department_name)[0]);
            setManagerOfManagerId(initialData.managerOfManagerId);
            setManagerOfManagerName(initialData.managerName);
            setLocation(initialData.locationName);
            setLocationId(locations?.filter(loc => loc.location_name == initialData.locationName)[0]?.id)
        }
    }, [employee, departments, locations]);

    useEffect(() => {
        fetchManager(departmentId);
    }, [departmentId]);

    function changeDepartment(id) {
        setDepartmentId(id);
        setDepartment(departments.filter(d => d.id === id)[0]);
    }
    console.log(departments)
    console.log(locations)

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedEmployee = {
                firstName,
                middleName,
                lastName,
                email,
                departmentId,
                managerId,
                locationId
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

    const changeManagerOfManager = (id) => {
        (id == "None") ? setManagerId(null) : setManagerId(id)
    }

    const changeLocation = (id) => {
        console.log("Location ID: ", id)
        setLocationId(id)
        const selectedLocation = locations.find(loc => loc.id == id);
        console.log(selectedLocation)
        setLocation(selectedLocation.location_name);
    }

    useEffect(() => {
        fetchNonDepartmentManagers()
    }, [])

    if (!isOpen) return null;
    console.log("locations: "+locationId)

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
                        {
                            (isManager || department?.name == "Manager") ?
                            <select value={managerOfManagerId} onChange={(e) => changeManagerOfManager(e.target.value)} required>
                                <option value={managerOfManagerId}>{managerOfManagerName || "None"}</option>
                                {managersOfManagers.map(mom => (
                                    <option key={mom.id} value={mom.id}>{mom.first_name} {mom.last_name}</option>
                                ))}
                            </select>
                            :
                            <input type="text" value={manager?.first_name + " " + manager?.last_name} disabled />
                        }
                    </div>
                    <div>
                        <label>Location:</label>
                        <select value={locations?.filter(loc => loc.location_name == location)[0].id} onChange={(e) => changeLocation(e.target.value)} required>
                            <option value={locations?.filter(loc => loc.location_name == location)[0].id}>{location}</option>
                            {locations.filter(loc => loc.location_name !== location).map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.location_name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default EditEmployeeModal;