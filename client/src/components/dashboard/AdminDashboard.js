
import { React, useState, useEffect, useContext } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import axios from "axios";
import { NavLink } from 'react-router-dom';
import moment from "moment"
import { UserContext } from '../../Context/UserContext'

const dashboardBodyClass = "min-h-screen w-full bg-[#efececa7]";
const welcomeBannerClass = "mt-[70px] h-[300px] w-full rounded-b-[22px] bg-[url('/public/images/welcomeBanner.png')] bg-cover bg-no-repeat p-[50px] max-[768px]:h-[320px] max-[768px]:p-5";
const horizontalLineClass = "w-[30%] border-t border-white pb-[30px]";
const statGridClass = "mt-5 grid grid-cols-4 gap-2.5 p-5 max-[1000px]:grid-cols-2 max-[1000px]:p-0 max-[1000px]:pb-5 max-[768px]:grid-cols-1";
const statCardClass = "mb-5 bg-white p-0 shadow-[1px_1px_1px_1px_rgba(0,0,0,0.1)] hover:scale-[1.02] max-[1000px]:m-0";
const dashWidgetClass = "relative rounded p-5";
const dashWidgetInfoClass = "text-right";
const dashWidgetInfoH3Class = "mb-2 text-2xl font-medium";
const iconBaseClass = "float-left block h-[65px] w-[65px] rounded-full text-center text-[40px] leading-[65px] text-white";
const widgetTitleBaseClass = "rounded px-2.5 py-[5px] text-[13px] text-white [&_i]:ml-[5px] [&_i]:inline-block [&_i]:h-4 [&_i]:w-4 [&_i]:rounded-full [&_i]:bg-white [&_i]:text-center [&_i]:text-[9px] [&_i]:leading-4 [&_i]:text-[#666666]";
const appointmentTableTdClass = "min-w-[200px]";

export default function AdminDashboard() {

	const [doctorCount, setDoctorCount] = useState(0);
	const [patientCount, setPatientCount] = useState(0);
	const [appsTodayCount, setAppsTodayCount] = useState(0);
	const [pendingAppsTodayCount, setPendingAppsTodayCount] = useState(0);
	const [bookedAppointments, setBookedAppointments] = useState([]);
	const [doctors, setdoctor] = useState([]);
	const { currentUser } = useContext(UserContext);

	const getUserCountByRole = async (userType) => {
		const response = await axios.post(`http://localhost:3001/count/users`,
			{
				'userType': userType
			},
			{
				headers: {
					authorization: `Bearer ${localStorage.getItem("token")}`
				}
			}
		);
		let count = response.data.count
		if (count) {
			if (userType == "Doctor")
				setDoctorCount(count);
			else if (userType == "Patient")
				setPatientCount(count);
		}

	};

	const getAppointmentCount = async () => {
		const response = await axios.get(`http://localhost:3001/count/appointments`,
			{
				headers: {
					authorization: `Bearer ${localStorage.getItem("token")}`
				}
			}
		);
		if (response?.data?.totalAppointments) {
			setAppsTodayCount(response?.data?.totalAppointments);
		}
		if (response?.data?.pendingAppointments) {
			setPendingAppsTodayCount(response?.data?.pendingAppointments)
		}
	}

	const getBookedSlots = async () => {
		// console.log(moment(new Date()).format('YYYY-MM-DD'))
		let response = await axios.post(`http://localhost:3001/appointments`,
			{
				'isTimeSlotAvailable': false,
				'appDate': moment(new Date()).format('YYYY-MM-DD')
			},
			{
				headers: {
					authorization: `Bearer ${localStorage.getItem("token")}`
				}
			}
		);
		if (response.data.message == "success") {

			let aptms = response.data.appointments;
			console.log("aptms", aptms);

			setBookedAppointments(aptms);
			// console.log(aptms);

		}

		// else {
		// 	setBookedAppointments([]);
		// }

	}

	const getdoctors = async () => {
		const response = await axios.get("http://localhost:3001/doctors");
		setdoctor(response.data);
		setDoctorCount(response.data.length || 0);
	};

	useEffect(() => {
		//setting count of Patients on dashboard
		getUserCountByRole("Patient");
		getAppointmentCount()
		getBookedSlots();
		getdoctors();
	}, []);

	return (
		<Box className={dashboardBodyClass} component="main" sx={{ flexGrow: 1, p: 3 }}>
			<div className={welcomeBannerClass}>
				<div className='text-white'>
					<h3 >Welcome!</h3>
					<br/>
					<h4>{currentUser.firstName} {currentUser.lastName}</h4>
					<br/>
					<div className={horizontalLineClass}></div>
					At Green Hills, we believe that every patient deserves the highest quality care possible. 
					<br/>
					Our commitment to excellence in healthcare is matched only by our compassion for those we serve.

				</div>

			</div>
			<div className={statGridClass}>
				<div className={statCardClass}>
					<div className={dashWidgetClass}>
						<span className={`${iconBaseClass} bg-[#009efb]`}><i className="fa fa-stethoscope" aria-hidden="true"></i></span>
						<div className={dashWidgetInfoClass} >
							<h3 className={dashWidgetInfoH3Class}>{doctorCount}</h3>
							<span className={`${widgetTitleBaseClass} bg-[#009efb]`}>Doctors <i className="fa fa-check" aria-hidden="true"></i></span>
						</div>
					</div>
				</div>
				<div className={statCardClass}>
					<div className={dashWidgetClass}>
						<span className={`${iconBaseClass} bg-[#55ce63]`}><i className="fa fa-user-o" aria-hidden="true"></i></span>
						<div className={dashWidgetInfoClass} >
							<h3 className={dashWidgetInfoH3Class}>{patientCount}</h3>
							<span className={`${widgetTitleBaseClass} bg-[#55ce63]`}>Patients <i className="fa fa-check" aria-hidden="true"></i></span>
						</div>
					</div>
				</div>
				<div className={statCardClass}>
					<div className={dashWidgetClass}>
						<span className={`${iconBaseClass} bg-[#7a92a3]`}><i className=" fa fa-calendar" aria-hidden="true"></i></span>
						<div className={dashWidgetInfoClass} >
							<h3 className={dashWidgetInfoH3Class}>{appsTodayCount}</h3>
							<span className={`${widgetTitleBaseClass} bg-[#7a92a3]`}>Appointments Today <i className="fa fa-check" aria-hidden="true"></i></span>
						</div>
					</div>
				</div>
				<div className={statCardClass}>
					<div className={dashWidgetClass}>
						<span className={`${iconBaseClass} bg-[#ffbc35]`}><i className="fa fa-heartbeat" aria-hidden="true"></i></span>
						<div className={dashWidgetInfoClass} >
							<h3 className={dashWidgetInfoH3Class}>{pendingAppsTodayCount}</h3>
							<span className={`${widgetTitleBaseClass} bg-[#ffbc35]`}>Pending Appointments <i className="fa fa-check" aria-hidden="true"></i></span>
						</div>
					</div>
				</div>
			</div>

			<div className="row ">
				<div className="col-12 col-lg-8 col-xl-8">
					<div className="card appointment-panel">
						<div className="card-header">
							<h4 className="card-title d-inline-block">Upcoming Appointments</h4> <NavLink to="/appointments" className="btn btn-primary float-end">View all</NavLink>
						</div>
						<div className="card-body">
							<div className="table-responsive">
								<table className="table mb-0">
									<thead className="d-none">
										<tr>
											<th>Patient Name</th>
											<th>Doctor Name</th>
											<th>Timing</th>
											<th className="text-right">Status</th>
										</tr>
									</thead>
									<tbody>
										{bookedAppointments.map((apt) => {
											return (
												<tr>
													<td className={appointmentTableTdClass}>
														<a className="avatar" href="">{apt?.patientId?.userId?.firstName?.charAt(0)}</a>
														<h2 className='ps-3'><a href="">{apt?.patientId?.userId?.firstName} {apt?.patientId?.userId?.lastName} <span>{apt?.patientId?.address}</span></a></h2>
													</td>
													<td>
														<h5 className="time-title p-0">Appointment With</h5>
														<p>Dr. {apt?.doctorId?.userId?.firstName} {apt?.doctorId?.userId?.lastName}</p>
													</td>
													<td>
														<h5 className="time-title p-0">Timing</h5>
														<p>{apt?.appointmentTime}</p>
													</td>
													{/* <td className="text-right">
														<a href="" className="btn btn-outline-primary take-btn">Take up</a>
													</td> */}
												</tr>
											)
										})
										}


									</tbody>
								</table>
								{(!bookedAppointments || bookedAppointments?.length === 0) &&
									<h3 className='mt-5 text-center '>
										You have no appointments today
									</h3>		
								}
							</div>
						</div>
					</div>
				</div>
				<div className="col-12 col-lg-4 col-xl-4">
					<div className="card member-panel">
						<div className="card-header bg-white">
							<h4 className="card-title mb-0">Doctors</h4>
						</div>
						<div className="card-body">
							<ul className="contact-list">
								{doctors && doctors.map((doc) => {
									return (
										<li>
											<div className="contact-cont">
												<div className="float-left user-img m-r-10">
													{/* <a href="profile.html" title="John Doe"><span className="status online"></span></a> */}
												</div>
												<div className="contact-info">
													<span className="contact-name text-ellipsis">{doc.userId?.firstName} {doc.userId?.lastName}</span>
													<span className="contact-date">{doc.department} </span>
												</div>
											</div>
										</li>
									)
								})
								}

							</ul>
						</div>
						<div className="card-footer text-center bg-white">
							<NavLink to="/doctors" className="text-muted">View all Doctors</NavLink>
						</div>
					</div>
				</div>
			</div>
		</Box>
	);
}

