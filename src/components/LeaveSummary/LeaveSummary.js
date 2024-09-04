import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import moment from 'moment';
import './LeaveSummary.css';

const LeaveSummary = ({ employeeId }) => {
    const [leaveSummary, setLeaveSummary] = useState([]);
    const [gridData, setGridData] = useState({});
    const [employeeInfo, setEmployeeInfo] = useState({});
    const [totals, setTotals] = useState({});
    const [totalSickLeaves, setTotalSickLeaves] = useState(0);
    const [totalPTO, setTotalPTO] = useState(0);
    const [daysToBeConsumedByJune30, setDaysToBeConsumedByJune30] = useState(0);

    useEffect(() => {
        const fetchLeaveSummary = async () => {
            try {
                const response = await Axios.get(`http://localhost:5000/employee/${employeeId}/leave-summary`);
                setLeaveSummary(response.data);
            } catch (error) {
                console.error('Error fetching leave summary:', error);
            }
        };

        const fetchEmployeeInfo = async () => {
            try {
                const response = await Axios.get(`http://localhost:5000/employee/${employeeId}`);
                const employeeData = response.data;
                setEmployeeInfo(employeeData);

                // Calculate service years
                const startMoment = moment(employeeData.start_date);
                const currentMoment = moment();
                const yearsOfService = currentMoment.diff(startMoment, 'years');

                // Calculate leave days per year based on service years and manager status
                let leaveDaysPerYear = 15;
                if (employeeData.is_manager) {
                    leaveDaysPerYear = 21;
                } else if (yearsOfService >= 15) {
                    leaveDaysPerYear = 21;
                } else if (yearsOfService >= 5) {
                    leaveDaysPerYear = 18;
                }

                // Calculate days to be consumed by June 30
                const daysToBeConsumed = employeeData.days - (leaveDaysPerYear * 2);
                if (daysToBeConsumed > 0) {
                    setDaysToBeConsumedByJune30(daysToBeConsumed);
                }
            } catch (error) {
                console.error('Error fetching employee info:', error);
            }
        };

        fetchLeaveSummary();
        fetchEmployeeInfo();
    }, [employeeId]);

    useEffect(() => {
        const generateGridData = () => {
            const data = {};
            const monthTotals = {};
            let totalDaysUsed = 0;
            let sickLeaveDays = 0;
            let currentMonthPtoMinutes = 0;
            const currentMonth = new Date().getMonth();

            leaveSummary.forEach(leave => {
                const date = new Date(leave.date);
                const month = date.getMonth();
                const day = date.getDate();
                let duration = Math.abs(parseFloat(leave.net_amount)) || 0;
                const leaveType = leave.leave_type;

                if (!data[month]) {
                    data[month] = {};
                }
                if (!monthTotals[month]) {
                    monthTotals[month] = 0;
                }

                if (leaveType === 'Personal Time Off' && leave.time_intervals) {
                    const ptoMinutes = leave.time_intervals.split(',').reduce((total, interval) => {
                        const [start, end] = interval.trim().split(' - ');
                        const startTime = moment(`1970-01-01 ${start}`, "YYYY-MM-DD HH:mm:ss");
                        const endTime = moment(`1970-01-01 ${end}`, "YYYY-MM-DD HH:mm:ss");
                        const minutes = endTime.diff(startTime, 'minutes');
                        return total + minutes;
                    }, 0);

                    if (month === currentMonth) {
                        currentMonthPtoMinutes += ptoMinutes;
                    }

                    duration = `${ptoMinutes}min`;
                    data[month][day] = { duration, leaveType: 'Personal Time Off' };
                } else {
                    data[month][day] = { duration, leaveType };
                    monthTotals[month] += duration;

                    if (leaveType === 'Annual Paid Leave' || leaveType === 'Unpaid Leave' || leave.request_status === 'HR Remove') {
                        totalDaysUsed += duration;
                    }

                    if (leaveType.includes('Sick Leave')) {
                        sickLeaveDays += duration;
                    }
                }
            });

            setGridData(data);
            setTotals(monthTotals);
            setTotalSickLeaves(sickLeaveDays);
            setTotalPTO(currentMonthPtoMinutes);
            setEmployeeInfo(prev => {
                const updatedInfo = { ...prev, daysUsed: totalDaysUsed };
                return updatedInfo;
            });
        };

        generateGridData();
    }, [leaveSummary]);

    const renderGrid = () => {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        return (
            <table className="leave-summary-table">
                <thead>
                    <tr>
                        <th></th>
                        {months.map((month, index) => (
                            <th key={index}>{month}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 31 }, (_, i) => (
                        <tr key={i}>
                            <td>{i + 1}</td>
                            {months.map((_, monthIndex) => (
                                // <td key={monthIndex}>
                                //     {gridData[monthIndex] && gridData[monthIndex][i + 1]
                                //         ? (
                                //             <span className={gridData[monthIndex][i + 1].leaveType.includes('Sick Leave') ? 'sick-leave' : ''}>
                                //                 {gridData[monthIndex][i + 1].leaveType === 'Personal Time Off' ? gridData[monthIndex][i + 1].duration : gridData[monthIndex][i + 1].duration}
                                //             </span>
                                //         ) : ""}
                                // </td>
                                <td key={monthIndex}>
                                    {gridData[monthIndex] && gridData[monthIndex][i + 1] ? (
                                        (() => {
                                            let className = '';
                                            const leaveType = gridData[monthIndex][i + 1].leaveType;

                                            if (leaveType.includes('Sick Leave')) {
                                                className = 'sick-leave';
                                            } else if (['Condolences', 'Marital', 'Maternity', 'Paternity'].includes(leaveType)) {
                                                className = 'other-leave';
                                            } else if (leaveType === 'Personal Time Off') {
                                                className = 'pto-leave';
                                            }

                                            return (
                                                <span className={className}>
                                                    {gridData[monthIndex][i + 1].duration}
                                                </span>
                                            );
                                        })()
                                    ) : ""}
                                </td>
                            ))}
                        </tr>
                    ))}
                    <tr>
                        <td><b>Total</b></td>
                        {months.map((_, monthIndex) => (
                            <td key={monthIndex}>
                                <b>{totals[monthIndex] ? totals[monthIndex].toFixed(1) : 0}</b>
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        );
    };
console.log("wjkdncnc:   "+leaveSummary.forEach(leave=>console.log(leave.leaveType)))
    return (
        <div className="leave-summary">
            <h2>Leave Summary</h2>
            <div className="employee-info">
                <p><b>Name: </b>{employeeInfo.first_name} {employeeInfo.last_name}</p>
                <p><b>Employee ID: </b>{employeeInfo.id}</p>
                <p><b>Remaining Days: </b>{employeeInfo.days}</p>
                <p><b>Days Used: </b>{employeeInfo.daysUsed}</p>
                <p><b className="sick-leave">Sick Leaves: </b><span className="sick-leave">{totalSickLeaves}</span></p>
                <p><b className="pto-leave">Personal Time Off: </b><span className="pto-leave">{totalPTO} minutes</span></p>
                {daysToBeConsumedByJune30 > 0 && (
                    <p><b>Days to be consumed by June 30: </b>{daysToBeConsumedByJune30}</p>
                )}
            </div>
            {renderGrid()}
        </div>
    );
};

export default LeaveSummary;

