import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlankPage.css';
import videoFile from '../../assets/anim_logo_eng_arb_1-1835582063.mp4';
import { Button, Menu, MenuItem } from '@mui/material';

const BlankPage = ({ isHr, isManager, isEmployee, isFirstApprover  }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNavigate = (path) => {
        handleMenuClose();
        navigate(path);
    };

    return (
        <div className="blank-page">
            <video className="background-video" autoPlay loop muted>
                <source src={videoFile} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <Button
                variant="contained"
                onClick={handleMenuClick}
                className="menu-button"
            >
                Menu
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {isHr && (
                    <>
                        <MenuItem onClick={() => handleNavigate('/departments')}>Departments</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/locations')}>Locations</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/staff')}>Staff</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/logs')}>Logs</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/holiday-form')}>Holiday Form</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/shared-calendar')}>Shared Calendar</MenuItem>
                    </>
                )}
                {isManager && (
                    <>
                        <MenuItem onClick={() => handleNavigate('/manager-leave-requests')}>Manager Leave Requests</MenuItem>
                    </>
                )}
                {isFirstApprover && (
                    <>
                        <MenuItem onClick={() => handleNavigate('/first-approval-requests')}>Employee Leave Requests</MenuItem>
                    </>
                )}
                {(isHr || isManager || isEmployee || isFirstApprover) && (
                    <>
                        <MenuItem onClick={() => handleNavigate('/leave-requests')}>Leave Requests</MenuItem>
                        <MenuItem onClick={() => handleNavigate('/leave-summary')}>Leave Summary</MenuItem>
                    </>
                )}
            </Menu>
        </div>
    );
};

export default BlankPage;



// app.get('/employee', hrAuthenticateToken, (req, res) => {
//     var query = `
//         SELECT e.id, e.first_name, e.middle_name, e.last_name, e.email, e.days,
//                d.name AS "department_name", e.manager_id, 
//                me.first_name AS "manager_first_name", me.last_name AS "manager_last_name" 
//         FROM employee e
//         LEFT JOIN department d ON e.department_id = d.id
//         LEFT JOIN employee me ON e.manager_id = me.id;
//     `;
//     db.query(query, (err, result) => {
//         if (err) res.send(err);
//         else res.send(result);
//     });
// });

// app.get('/employee/:id', (req, res) => {
//     const id = req.params.id;
//     var query = `
//         SELECT e.id, e.first_name, e.middle_name, e.last_name, e.email, e.days, e.start_date, e.end_date, e.birthday, e.start_date, e.end_date, e.birthday, 
//                d.id AS "department_id", d.name AS "department_name", e.manager_id, 
//                me.first_name AS "manager_first_name", me.last_name AS "manager_last_name"
//         FROM employee e
//         LEFT JOIN department d ON e.department_id = d.id
//         LEFT JOIN employee me ON e.manager_id = me.id
//         WHERE e.id = ${id};
//     `;
//     db.query(query, (err, result) => {
//         if (err) res.send(err);
//         else res.send(result[0]);
//     });
// });

// app.post('/employee', hrAuthenticateToken, async (req, res) => {
//     const { firstName, middleName, lastName, departmentId, managerId, birthday, startDate, endDate } = req.body;
//     const hrUserId = getIdFromToken(req);
//     const email = `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}@arope.com`;

//     const query = `
//         INSERT INTO employee 
//         (first_name, middle_name, last_name, email, department_id, manager_id, birthday, start_date, end_date) 
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
//     `;
//     db.query(query, [firstName, middleName, lastName, email, departmentId, managerId, birthday, startDate, endDate], (err, result) => {
//         if (err) {
//             res.send(err);
//         } else {
//             addLog(hrUserId, 'Add Employee', `Added employee: ${firstName} ${middleName} ${lastName}`);
//             setLeaveDays(result.insertId)
//                 .then(() => res.send(result))
//                 .catch(err => res.status(500).send(err));
//         }
//     });
// });

// app.patch('/employee/:id', hrAuthenticateToken, (req, res) => {
//     const id = req.params.id;
//     const hrUserId = getIdFromToken(req);

//     db.query(`SELECT * FROM employee WHERE id = ?`, [id], (err, result) => {
//         if (err) {
//             res.send(err);
//         } else {
//             const originalEmployee = result[0];
//             const updatedEmployee = { ...originalEmployee, ...camelToSnake(req.body) };
//             const { first_name, middle_name, last_name, email, department_id, manager_id, start_date, end_date, birthday } = updatedEmployee;
//             const query = `
//                 UPDATE employee
//                 SET first_name = ?, middle_name = ?, last_name = ?, email = ?, department_id = ?, manager_id = ?, start_date = ?, end_date = ?, birthday = ?
//                 WHERE id = ?;
//             `;
//             db.query(query, [first_name, middle_name, last_name, email, department_id, manager_id, start_date, end_date, birthday, id], (err, result) => {
//                 if (err) {
//                     res.send(err);
//                 } else {
//                     const changes = Object.keys(updatedEmployee)
//                         .filter(key => updatedEmployee[key] !== originalEmployee[key])
//                         .map(key => `${key}: ${originalEmployee[key]} => ${updatedEmployee[key]}`)
//                         .join(', ');

//                     addLog(hrUserId, 'Edit Employee', `Edited employee: ${first_name} ${last_name}, changes: ${changes}`);
//                     setLeaveDays(id)
//                         .then(() => res.send(result))
//                         .catch(err => res.status(500).send(err));
//                 }
//             });
//         }
//     });
// });
