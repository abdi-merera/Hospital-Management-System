
import { React, useState, useEffect, useContext } from 'react';
import Box from '@mui/material/Box';
import { UserContext } from '../../Context/UserContext'
import { NavLink } from 'react-router-dom';
import axios from "axios";
import moment from "moment"
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import Button from '@mui/material/Button';

const dashboardBodyClass = "min-h-screen w-full bg-[#efececa7]";
const welcomeBannerClass = "mt-[70px] h-[300px] w-full rounded-b-[22px] bg-[url('/public/images/welcomeBanner.png')] bg-cover bg-no-repeat p-[50px] max-[768px]:h-[320px] max-[768px]:p-5";
const horizontalLineClass = "w-[30%] border-t border-white pb-[30px]";
const patientPanelClass = "mx-auto w-full rounded-xl bg-[#ebe8e8]";
const patientPanelHeaderClass = "w-full rounded-t-xl bg-[#E0E0E0] p-2.5 !font-bold";
const patientPanelContentClass = "w-full p-5";
const patientContentCardClass = "grid w-full grid-cols-[25%_75%] px-2.5 py-5";
const patientContentEmptyClass = "flex w-full flex-col items-center justify-center px-2.5 py-5";
const patientDateClass = "flex flex-col items-center rounded-l-xl bg-[#31b372] p-[30px] text-white";
const patientDetailsClass = "flex flex-col justify-center rounded-r-xl bg-white p-[30px] text-black";
const patientDateNumberClass = "m-0 p-0 text-[2em] font-bold";
const patientTextClass = "m-0 p-0";
const patientDetailTextClass = "m-0 py-2";
const summaryGridClass = "mt-4 grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1";
const summaryCardClass = "rounded-xl bg-white p-4 shadow-[0_8px_18px_rgba(0,0,0,0.08)]";
const summaryLabelClass = "mb-2 text-sm font-bold uppercase text-[#666]";
const summaryValueClass = "m-0 text-2xl font-bold text-[#31b372]";
const summaryHintClass = "m-0 mt-2 text-sm text-[#555]";
const detailListClass = "m-0 list-none p-0";
const detailListItemClass = "mb-3 border-b border-[#e5e5e5] pb-3 last:mb-0 last:border-b-0 last:pb-0";




export default function PatientDashboard() {
	const { currentUser } = useContext(UserContext);
	const [appsTodayCount, setAppsTodayCount] = useState(0);
	const [firstAppointmentInFuture, setFirstAppointmentInFuture] = useState({});
	const [bookedAppointments, setBookedAppointments] = useState([]);
	const [prescriptions, setPrescription] = useState([]);

	const appointmentDateValue = (value) => {
		if (!value) return null;
		const dateText = String(value);
		return new Date(dateText.endsWith('Z') ? dateText.slice(0, -1) : dateText);
	};

	const latestPrescription = prescriptions[0] || {};
	const latestPrescriptionItems = latestPrescription?.prescribedMed || [];
	const latestVisit = latestPrescription?.appointmentId || {};

	const getAppMonth = (dateOfJoining) => {
		if(!dateOfJoining){
			return;
		}
        let month = appointmentDateValue(dateOfJoining).getMonth();
		let monthList = ["January","February","March","April","May","June","July","August","September","October","November","December"]
        return monthList[month];
    }

	const getAppDate = (dateOfJoining) => {
		if(!dateOfJoining){
			return;
		}
        let date = appointmentDateValue(dateOfJoining).getDate();
        return date;
    }

	const getAppYear = (dateOfJoining) => {
		if(!dateOfJoining){
			return;
		}
        let year = appointmentDateValue(dateOfJoining).getFullYear();
        return year;
    }

	const getBookedSlots = async () => {
    
            let response = await axios.post(`http://localhost:3001/appointments`,
                {
                    'isTimeSlotAvailable': false
                },
                {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            if (response.data.message === "success") {
                // getAvailableSlot();
                // window.alert("success add")
                // setAvailableSlot(response.data.appointments)
                let aptms = response.data.appointments || [];
                setBookedAppointments(aptms);
                setAppsTodayCount(aptms.length);
				// console.log(firstAppointmentInFuture)
                const futureAppointments = aptms.filter(appointment => {
					const appointmentDate = appointmentDateValue(appointment.appointmentDate);
					const now = new Date();
					return appointmentDate > now;
				  });

				  if(futureAppointments && futureAppointments.length>0){
					const sortedAppointments = futureAppointments.sort((a, b) => {
						const aDate = appointmentDateValue(a.appointmentDate);
						const bDate = appointmentDateValue(b.appointmentDate);
						return aDate - bDate;
					  });
					  let firstApp= sortedAppointments.find(appointment => {
						const appointmentDate = appointmentDateValue(appointment.appointmentDate);
						const now = new Date();
						return appointmentDate > now;
					  });
					  setFirstAppointmentInFuture(firstApp)
				  }

				  
                // setBookedAppointments(sortedAptms);
                // console.log(aptms)
            }
            else {
                // window.alert("error add")
            }
        

    }
	const getPrescription = async () => {
        
        let response = await axios.post(`http://localhost:3001/prescriptions`,{},
            {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );
        if (response.data.message === "success") {
            let respPrescription = response.data.prescriptions;
            let newResp =respPrescription.sort((a, b) => {
                    const timeA = new Date(`${moment(appointmentDateValue(a.appointmentId.appointmentDate)).format('MM/DD/YYYY')} ${a.appointmentId.appointmentTime}`);
                    const timeB = new Date(`${moment(appointmentDateValue(b.appointmentId.appointmentDate)).format('MM/DD/YYYY')} ${b.appointmentId.appointmentTime}`);
                    // console.log(timeA)
                    return timeB - timeA;
                });
            //   console.log(newResp);
            setPrescription(newResp);
        } 
    };

	useEffect(() => {
		getBookedSlots();
		getPrescription();
		// Run once on mount; this dashboard refreshes when the patient returns to it.
	}, []); // eslint-disable-line react-hooks/exhaustive-deps


	return (
		<Box className={dashboardBodyClass} component="main" sx={{ flexGrow: 1, p: 3 }}>
			<div className={welcomeBannerClass}>
				<div className='text-white'>
					<h3 >Welcome!</h3>
					<br/>
					<h4> {currentUser.firstName} {currentUser.lastName} </h4>
					<br/>
					<div className={horizontalLineClass}></div>
					At Green Hills, we believe that every patient deserves the highest quality care possible. 
					<br/>
					Our commitment to excellence in healthcare is matched only by our compassion for those we serve.

				</div>

			</div>

			<div className={summaryGridClass}>
				<div className={summaryCardClass}>
					<p className={summaryLabelClass}>Next Appointment</p>
					<p className={summaryValueClass}>{firstAppointmentInFuture?.appointmentDate ? `${getAppDate(firstAppointmentInFuture.appointmentDate)} ${getAppMonth(firstAppointmentInFuture.appointmentDate)}` : 'None'}</p>
					<p className={summaryHintClass}>{firstAppointmentInFuture?.appointmentTime || 'No upcoming appointment booked'}</p>
				</div>
				<div className={summaryCardClass}>
					<p className={summaryLabelClass}>Appointments</p>
					<p className={summaryValueClass}>{bookedAppointments.length || appsTodayCount}</p>
					<p className={summaryHintClass}>Total booked appointments</p>
				</div>
				<div className={summaryCardClass}>
					<p className={summaryLabelClass}>Prescriptions</p>
					<p className={summaryValueClass}>{prescriptions.length}</p>
					<p className={summaryHintClass}>{latestPrescriptionItems.length > 0 ? `${latestPrescriptionItems.length} medicine item(s) in latest prescription` : 'No prescription yet'}</p>
				</div>
				<div className={summaryCardClass}>
					<p className={summaryLabelClass}>Last Visit</p>
					<p className={summaryValueClass}>{latestVisit?.appointmentDate ? `${getAppDate(latestVisit.appointmentDate)} ${getAppMonth(latestVisit.appointmentDate)}` : 'None'}</p>
					<p className={summaryHintClass}>{latestVisit?.doctorId?.department || 'No visit history yet'}</p>
				</div>
			</div>

			<div className='row mt-5 justify-content-center'>
				<div className='col-md-6 col-sm-12'>
					<div className={patientPanelClass} >
						<div className={patientPanelHeaderClass}>
							<h3 className='text-center'>Upcoming Appointment</h3>
						</div>
						<div className={patientPanelContentClass}>
							{firstAppointmentInFuture.appointmentDate  && <div className={patientContentCardClass}>
								<div className={patientDateClass}>
									<p className={patientDateNumberClass}>{getAppDate(firstAppointmentInFuture.appointmentDate)}</p>
									<p className={patientTextClass}>{getAppMonth(firstAppointmentInFuture.appointmentDate)}</p>
									<p className={patientTextClass}>{getAppYear(firstAppointmentInFuture.appointmentDate)}</p>
								</div>
								<div className={patientDetailsClass}>
									<p className={patientDetailTextClass}>
										<span className='font-bold'>Doctor Name </span>: {firstAppointmentInFuture?.doctorId?.userId.firstName} {firstAppointmentInFuture?.doctorId?.userId.lastName}
									</p>
									<p className={patientDetailTextClass}>
										<span className='font-bold'>Department </span>: {firstAppointmentInFuture?.doctorId?.department}
									</p>
									<p className={patientDetailTextClass}>
										<span className='font-bold'>Time</span>: {firstAppointmentInFuture?.appointmentTime}
									</p>
								</div>
							</div>}
							{!firstAppointmentInFuture.appointmentDate  && <div className={patientContentEmptyClass}>
									<p className='m-0 p-0 font-extrabold'>You have no upcoming Appointments</p>
									<p className='mt-5'>Would you like to book a new Appointment?</p>
									<Button
                                                            variant="contained"
                                                            color="success"
															className='my-3'
                                                            startIcon={<BookOnlineIcon />}
                                                            component={NavLink}
															to="/appointments"
                                                        >
                                                            Book Now
                                                        </Button>
								</div>}
						</div>
					</div>

				</div>
				<div className='col-md-6 col-sm-12'>
				<div className={patientPanelClass} >
						<div className={patientPanelHeaderClass}>
							<h3 className='text-center'>Latest Prescription</h3>
						</div>
						<div className={patientPanelContentClass}>
							{latestPrescription?.appointmentId &&
								<div className={patientContentCardClass}>
									<div className={patientDateClass}>
										<p className={patientDateNumberClass}>{getAppDate(latestPrescription?.appointmentId?.appointmentDate)}</p>
										<p className={patientTextClass}>{getAppMonth(latestPrescription?.appointmentId?.appointmentDate)}</p>
										<p className={patientTextClass}>{getAppYear(latestPrescription?.appointmentId?.appointmentDate)}</p>
									</div>
									<div className={patientDetailsClass}>
										<p className={patientDetailTextClass}>
											<span className='font-bold'>Doctor Name </span>: {latestPrescription?.appointmentId?.doctorId?.userId?.firstName} {latestPrescription?.appointmentId?.doctorId?.userId?.lastName}
										</p>
										<p className={patientDetailTextClass}>
											<span className='font-bold'>Department </span>: {latestPrescription?.appointmentId?.doctorId?.department} 
										</p>
										<ul className={detailListClass}>
											{latestPrescriptionItems.slice(0, 3).map((item) => (
												<li key={item._id || item.medicineId?._id} className={detailListItemClass}>
													<p className={patientDetailTextClass}><span className='font-bold'>Medicine </span>: {item.medicineId?.name || 'Medicine'}</p>
													<p className={patientDetailTextClass}><span className='font-bold'>Dosage </span>: {item.dosage || '-'}</p>
													<p className={patientDetailTextClass}><span className='font-bold'>Quantity </span>: {item.qty || '-'}</p>
												</li>
											))}
										</ul>
										<p className={patientDetailTextClass}>
											<span className='font-bold'>Doctor's Remarks </span>: {latestPrescription?.remarks || '-'} 
										</p>
									</div>
								</div>
							}
							{!latestPrescription?.appointmentId && <div className={patientContentEmptyClass}>
									<p className='m-0 p-0 font-extrabold'>You have no prescriptions yet</p>
								</div>
							}
							
						</div>
					</div>
				</div>
			</div>

			<div className='row mt-4 justify-content-center'>
				<div className='col-md-8 col-sm-12'>
					<div className={patientPanelClass}>
						<div className={patientPanelHeaderClass}>
							<h3 className='text-center'>Medical History</h3>
						</div>
						<div className={patientPanelContentClass}>
							{latestVisit?.appointmentDate ? (
								<div className={patientDetailsClass}>
									<p className={patientDetailTextClass}><span className='font-bold'>Last Visit </span>: {getAppDate(latestVisit.appointmentDate)} {getAppMonth(latestVisit.appointmentDate)} {getAppYear(latestVisit.appointmentDate)}</p>
									<p className={patientDetailTextClass}><span className='font-bold'>Doctor </span>: {latestVisit?.doctorId?.userId?.firstName} {latestVisit?.doctorId?.userId?.lastName}</p>
									<p className={patientDetailTextClass}><span className='font-bold'>Department </span>: {latestVisit?.doctorId?.department || '-'}</p>
									<p className={patientDetailTextClass}><span className='font-bold'>Remarks </span>: {latestPrescription?.remarks || 'No remarks recorded'}</p>
									<Button variant="outlined" color="success" component={NavLink} to="/prescriptions" className='mt-3'>
										View Prescriptions
									</Button>
								</div>
							) : (
								<div className={patientContentEmptyClass}>
									<p className='m-0 p-0 font-extrabold'>You have no medical history in this hospital</p>
								</div>
							)}
						</div>
					</div>
				</div>
				<div className='col-md-4 col-sm-12'>
					<div className={patientPanelClass}>
						<div className={patientPanelHeaderClass}>
							<h3 className='text-center'>Profile</h3>
						</div>
						<div className={patientPanelContentClass}>
							<div className={patientDetailsClass}>
								<p className={patientDetailTextClass}><span className='font-bold'>Name </span>: {currentUser.firstName} {currentUser.lastName}</p>
								<p className={patientDetailTextClass}><span className='font-bold'>Account </span>: Patient</p>
								<p className={patientDetailTextClass}>Keep your contact and emergency information up to date.</p>
								<Button variant="outlined" color="success" component={NavLink} to="/profile" className='mt-3'>
									Update Profile
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
			
		</Box>
	);
}

