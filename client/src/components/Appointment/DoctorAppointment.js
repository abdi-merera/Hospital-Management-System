import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import { UserContext } from '../../Context/UserContext'
import Box from '@mui/material/Box';
// import DatePicker from '../Datepicker/DatePicker';
import dayjs from 'dayjs';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
// import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
// import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import MyCalendar from '../Datepicker/MyCalendar';
import moment from "moment"
import axios from "axios";
import { BootstrapDialog, BootstrapDialogTitle } from "../MUIDialogueBox/BoostrapDialogueBox"
import DialogContent from '@mui/material/DialogContent';
import AppointmentForm from '../Forms/AppointmentForm'
import DoctorAppointmentTable from '../MUITable/DoctorAppointmentTable'
import { hospitalDepartments } from '../../constants/departments';

const appointmentMainClass = "mt-[50px] min-h-screen w-full pl-[50px]";
const pageTitleClass = "py-[5px] font-bold text-[#31b372]";
const slotGridClass = "grid grid-cols-[36%_64%] py-[20px] pl-0 pr-[5px] max-[1000px]:grid-cols-1";
const calendarDivClass = "rounded-lg !border-0 !align-middle max-[1000px]:hidden";
const slotCreationDivClass = "pl-[70px] max-[1000px]:pl-[30px] [&_h4]:font-bold [&_h4]:text-[#31b372]";
const availableSlotsHeaderClass = "[&_h4]:font-bold [&_h4]:text-[#31b372]";
const slotCardClass = "m-2.5 w-[120px] cursor-pointer border border-[#31b372] py-[5px] text-center hover:scale-[1.05]";
const createButtonClass = "btn btn-primary float-right btn-rounded py-2 px-4";
const emptyStateClass = "mt-5 rounded border border-dashed border-[#31b372] bg-[#f6fff9] p-4 text-[#315f45]";
const allTimeSlots = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM"];

function DoctorAppointment() {
    const navigate = useNavigate();
    const { currentUser } = useContext(UserContext);

    //this tells you which slot was clicked among the "available slots"
    const [clickedTimeSlot, setClickedTimeSlot] = useState('');

    // const [dateClicked,setDateClicked] = useState(dayjs());
    const [date, setDate] = useState(new Date());
    const [availableSlots, setAvailableSlots] = useState([])
    const [bookedSlots, setBookedSlots] = useState([])
    const [bookedAppointments, setBookedAppointments] = useState([])


    const [departmentList, setDepartmentList] = useState([]);
    const [doctorList, setDoctorList] = useState([]);
    const [patientList, setPatientList] = useState([]);


    const [departmentSelected, setDepartmentSelected] = useState("");
    const [doctorSelected, setDoctorSelected] = useState("");

    const handleDepartmentChange = (event) => {
        setDepartmentSelected(event.target.value);
        setDoctorSelected("");
    };
    const handleDoctorChange = (event) => {
        setDoctorSelected(event.target.value);
    };

    const hasOpenSlotToCreate = allTimeSlots.some(slot => !(availableSlots.includes(slot)) && !(bookedSlots.includes(slot)));


    const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
    const [errorList, setErrorList] = useState([]);
    const handleErrorDialogueOpen = () => {
        setErrorDialogueBoxOpen(true)
    };
    const handleErrorDialogueClose = () => {
        setErrorList([]);
        setErrorDialogueBoxOpen(false)
    };

    const [openDialgueBox, setOpenDialgueBox] = React.useState(false);

    //fhandler function for bootstrap dialogue box 
    const handleClickOpen = () => {
        setOpenDialgueBox(true);
    };
    const handleClose = () => {
        setOpenDialgueBox(false);
    };

    const addAppointmentFormSubmitted = async (event) => {
        event.preventDefault();
        const form = document.forms.addAppointment;
        let reqObj = {
            "appDate": form.appDate.value,
            "appTime": form.appTime.value,
            "doctorId": form.doctor.value,
            "patientId": form.patient.value
        }
        // console.log("reqObj",reqObj);

        let response = await axios.put(`http://localhost:3001/appointments/`,
            reqObj,
            {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );
        if (response.data.message == "success") {
            // getAvailableSlot();
            // window.alert("success add")
            getAvailableSlots();
            getBookedSlots();
        }

        handleClose();


    }

    const getformDate = (mydate) => {
        const parts = mydate.split('-');
        const d = new Date(+parts[0], parts[1] - 1, +parts[2], 12);
        return d;
    }

    const formatDateForDateInput = (dateOfJoining) => {
        dateOfJoining = moment(new Date(dateOfJoining)).format('YYYY-MM-DD');
        // console.log("dateOfJoining",dateOfJoining);
        return dateOfJoining;
    }

    const slotClicked = (slot) => {
        // console.log(slot)
        setClickedTimeSlot(slot)
        handleClickOpen()
    }

    const getAvailableSlots = async () => {
        // let newSlotList = availableSlots;
        // newSlotList[newSlotList.length] = "hello"
        // setAvailableSlots(newSlotList);
        // if (doctorSelected) {
        let response = await axios.post(`http://localhost:3001/appointments`,
            {
                'isTimeSlotAvailable': true,
                'appDate': formatDateForDateInput(date),
                // 'doctorID': doctorSelected
            },
            {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );
        if (response.data.message == "success") {
            // getAvailableSlot();
            //window.alert("success")
            // setAvailableSlot(response.data.appointments)
            let aptms = response.data.appointments;

            let slots = aptms.map(apt =>
                apt.appointmentTime
            )
            slots.sort((a, b) => {
                const timeA = new Date(`01/01/2000 ${a}`);
                const timeB = new Date(`01/01/2000 ${b}`);
                return timeA - timeB;
            });

            setAvailableSlots(slots);
        }
        else {
            // window.alert("error add")
        }


    }

    const getBookedSlots = async () => {
        // let newSlotList = availableSlots;
        // newSlotList[newSlotList.length] = "hello"
        // setAvailableSlots(newSlotList);

        let response = await axios.post(`http://localhost:3001/appointments`,
            {
                'isTimeSlotAvailable': false,
                'appDate': formatDateForDateInput(date)
            },
            {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );
        if (response.data.message == "success") {
            // getAvailableSlot();
            // window.alert("success add")
            // setAvailableSlot(response.data.appointments)
            let aptms = response.data.appointments;
            let sortedAptms = aptms.sort((a, b) => {
                const timeA = new Date(`01/01/2000 ${a['appointmentTime']}`);
                const timeB = new Date(`01/01/2000 ${b["appointmentTime"]}`);
                return timeA - timeB;
            });
            console.log("aptms", sortedAptms);

            setBookedAppointments(aptms);
            console.log(aptms)
            let slots = aptms.map(apt =>
                apt.appointmentTime
            )
            slots.sort((a, b) => {
                const timeA = new Date(`01/01/2000 ${a}`);
                const timeB = new Date(`01/01/2000 ${b}`);
                return timeA - timeB;
            });

            setBookedSlots(slots);
        }
        else {
            // window.alert("error add")
        }


    }

    const deleteBookedSlots = async (appId) => {
        console.log("delete slot with id", appId);
        let response = await axios.delete(`http://localhost:3001/appointments/`,
            {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                data: {
                    appointmentId: appId,
                },
            }
        );
        if (response.data.message == "success") {
            // getAvailableSlot();
            // window.alert("success add")
            getAvailableSlots();
            getBookedSlots();
        }
    }

    const getDoctorList = async () => {
        let response = await axios.get(`http://localhost:3001/doctors`,
            {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );
        let doctors = response.data;
        if (doctors.length > 0) {
            const currentDoctor = doctors.find((doctor) => doctor.userId?._id === currentUser.userId);

            if (currentDoctor) {
                setDoctorList([currentDoctor]);
                if (doctorSelected !== currentDoctor._id) {
                    setDoctorSelected(currentDoctor._id);
                }
            }
            else {
                setDoctorList(doctors);
            }

        }
        else {
            // window.alert("error add")
        }

    }

    const getDepartmentList = async () => {
        let response = await axios.get(`http://localhost:3001/departments`,
            {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            }
        );
        let departments = response.data.departments || [];
        setDepartmentList([...new Set([...hospitalDepartments, ...departments])]);

    }

    const getPatients = async () => {
        const response = await axios.get("http://localhost:3001/patients", {
            headers: {
                authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });
        setPatientList(response.data);
    };

    const handleCreateSlotSubmit = async (event) => {
        event.preventDefault();
        const form = document.forms.createSlotForm;
        let timeSlots = Array.from(form.querySelectorAll('input[type="checkbox"]:checked'))
            .map(input => input.value);

        if (!(timeSlots.length > 0)) {
            setErrorList(["Please choose a time slot"])
            handleErrorDialogueOpen();
            return;
        }

        try {
            let response = await axios.post(`http://localhost:3001/appointments/add`,
                {
                    'appDate': getformDate(form.appDate.value),
                    'timeSlots': timeSlots,
                },
                {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            if (response.data.message == "success") {
                getAvailableSlots();
                getBookedSlots();
            }
        }
        catch (error) {
            setErrorList(error.response?.data?.errors || ["Could not create appointment slots"])
            handleErrorDialogueOpen();
        }

        form.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
    }

    useEffect(() => {
        getDepartmentList()
        getDoctorList()
        getAvailableSlots()
        getBookedSlots()
        getPatients()

    }, [date, departmentSelected, doctorSelected])



    return (
        <Box className={appointmentMainClass} component="main" sx={{ flexGrow: 1, p: 3 }}>
            <div>
                <h3 className={pageTitleClass}> Appointments</h3>
            </div>

            <div className={slotGridClass}>
                <div className={calendarDivClass}>
                    <MyCalendar date={date} setDate={setDate} />
                </div>
                <div className={slotCreationDivClass}>
                    <form name='createSlotForm' id="createSlotForm" onSubmit={handleCreateSlotSubmit} >
                        <h4>Select Date </h4>
                        <div className='mt-4 row'>
                            <div className="col-12">
                                <label htmlFor="appDate" className="col-sm-3 col-form-label ">Date: </label>
                                <input id="appDate" name="appDate" type="date" className="col-form-control col-sm-7"
                                    value={formatDateForDateInput(date)}
                                    onChange={(e) => setDate(getformDate(e.target.value))}
                                />
                            </div>

                        </div>
                        <h4 className="mt-5">Create Available Slots</h4>
                        <div className='my-4 row'>
                            <label htmlFor="appTime" className="col-sm-3 col-form-label ">Time slots: </label>
                            <span className='col-sm-9'>
                                {allTimeSlots.map((slot) => {
                                    if (!(availableSlots.includes(slot)) && !(bookedSlots.includes(slot))) {
                                        return (
                                            <div className="form-check form-check-inline px-3 py-1" key={slot}>
                                                <input className="form-check-input" type="checkbox" id={slot} value={slot} />
                                                <label className="form-check-label" htmlFor={slot}>{slot}</label>
                                            </div>
                                        )
                                    }

                                    return null;
                                })}
                                {!hasOpenSlotToCreate && <p className="m-0 text-muted">All slots for this date have already been created or booked.</p>}
                            </span>
                        </div>

                        <input type='submit' className={createButtonClass} value='Create' />
                    </form>

                    <div className=' row'>
                        {/* <div className="col-12"> */}

                        {/* </div> */}
                        {availableSlots.length > 0 ? <div className={availableSlotsHeaderClass}> <h4 className="mt-5">Available Slots</h4> <p>Click a slot to book appointments</p></div> : <div className={emptyStateClass}>No available slots for this date yet. Choose time slots above and click Create.</div>}

                        <div className='d-flex flex-wrap'>
                            {
                                availableSlots.map(slot => {
                                    return <div onClick={() => slotClicked(slot)} className={slotCardClass} key={slot}>{slot}</div>
                                })
                            }
                        </div>
                    </div>



                </div>

            </div>



            {bookedAppointments.length > 0 ?
                <div className={availableSlotsHeaderClass}>
                    <h4 className="mt-5">
                        Booked Appointments
                    </h4>
                    <DoctorAppointmentTable
                        bookedAppointments={bookedAppointments}
                        deleteBookedSlots={deleteBookedSlots}
                        doctorList={doctorList}
                        patientList={patientList}
                        availableSlots={availableSlots}
                        getAvailableSlots={getAvailableSlots}
                        getBookedSlots={getBookedSlots}
                    />
                </div> : <div></div>}




            <ErrorDialogueBox
                open={errorDialogueBoxOpen}
                handleToClose={handleErrorDialogueClose}
                ErrorTitle="Error"
                ErrorList={errorList}
            />
            <BootstrapDialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={openDialgueBox}
            >
                <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
                    Book Appointment
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <AppointmentForm
                        formName="addAppointment"
                        formOnSubmit={addAppointmentFormSubmitted}
                        appDate={formatDateForDateInput(date)}
                        appTime={clickedTimeSlot}
                        doctorList={doctorList}
                        doctorSelected={doctorSelected}
                        patientList={patientList}
                        availableSlots={availableSlots} />
                </DialogContent>
            </BootstrapDialog>
        </Box>
    );
}

export default DoctorAppointment;

