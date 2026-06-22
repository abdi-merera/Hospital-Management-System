import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';



function SignupPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [passwordMatchDisplay, setPasswordMatchDisplay] = useState('none');
  // const [passwordValidationDisplay, setPasswordValidationDisplay] = useState('none')
  const [passwordValidationMessage, setPasswordValidationMessage] = useState('')


  const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
  const [errorList, setErrorList] = useState([]);
  const handleDialogueOpen = () => {
    setErrorDialogueBoxOpen(true)
  };
  const handleDialogueClose = () => {
    setErrorList([]);
    setErrorDialogueBoxOpen(false)
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Handle signup form submission'
    const form = document.forms.signUpform;
    let user = {
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      email: form.email.value,
      password: form.password.value,
      confirmPassword: form.confirmPassword.value,
      userType: form.userType.value
    }
    fetch('http://localhost:3001/signUp', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
      .then(response => response.json())
      .then(data => {
        let respMessage = data.message;
        if (respMessage === "success") {
          navigate("/");
        }
        else {
          //TODO: display error message
          setErrorList(data.errors);
          handleDialogueOpen();
        }
      });
  };

  useEffect(() => {
    if (password.length > 0 && password?.trim()?.length <= 6) {
      setPasswordValidationMessage('Password Length must be greater than 6 characters');
      // setPasswordValidationDisplay('block');
    }
    else {
      setPasswordValidationMessage('');
      // setPasswordValidationDisplay('none');
    }
    if (password === confirmPassword) {
      setPasswordMatchDisplay('none');
    }
    else {
      setPasswordMatchDisplay('block');
    }
  }, [password, confirmPassword])

  return (
    <div className="grid h-screen w-full grid-cols-[45%_55%] items-center font-proxima max-[1000px]:grid-cols-[0%_100%]">

      <div className="bg-[url('/public/images/signup-background.png')] bg-cover bg-no-repeat">
        <div className="h-screen bg-[rgba(126,211,165,0.44)]">

        </div>
      </div>
      <div>
        <h2 className="text-center text-[#048C7F]">Create An Account</h2>
        <form className="mx-auto w-3/5" name='signUpform' onSubmit={handleSubmit}>
          <div className='d-flex flex-column flex-lg-row flex-sm-column mt-5'>
            <div className='col-12 col-sm-12 col-lg-6  form-floating mx-2 '>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="first name"
                value={firstName}
                required
                onChange={(event) => setFirstName(event.target.value)}
                className="form-control !rounded-none !border-0 !border-b !border-b-[#c0c0c0] !bg-transparent"
              />
              <label htmlFor="firstName">First Name</label>
            </div>
            <div className='col-12  col-sm-12 col-lg-6  mt-3 mt-sm-3 mt-lg-0 form-floating mx-2'>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="last name"
                value={lastName}
                required
                onChange={(event) => setLastName(event.target.value)}
                className="form-control !rounded-none !border-0 !border-b !border-b-[#c0c0c0] !bg-transparent"
              />
              <label htmlFor="lastName">Last Name</label>
            </div>
          </div>
          <div className='form-floating mt-3 col-12 mx-2'>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="form-control !rounded-none !border-0 !border-b !border-b-[#c0c0c0] !bg-transparent"
            />
            <label htmlFor="email" >Email</label>
          </div>
          <div className='form-floating mt-3 col-12 mx-2'>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="form-control !rounded-none !border-0 !border-b !border-b-[#c0c0c0] !bg-transparent"
              required
              placeholder="password"
            />
            <label htmlFor="password">Password</label>
          </div>
          <div
            className="mx-2 text-danger"
          > {passwordValidationMessage}</div>
          <div className='form-floating mt-3 col-12 mx-2'>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="form-control !rounded-none !border-0 !border-b !border-b-[#c0c0c0] !bg-transparent"
              required
              placeholder="confirm password"
            />
            <label htmlFor="confirmPassword">Confirm Password</label>
          </div>
          <div
            className="mx-2 text-danger"
            style={{
              display: `${passwordMatchDisplay}`
            }}> Password did not match</div>
          <div className='form-floating mt-3 col-12 mx-2'>
            <select
              id="userType"
              name="userType"
              value={userType}
              onChange={(event) => setUserType(event.target.value)}
              className="form-select !rounded-none !border-0 !border-b !border-b-[#c0c0c0] !bg-transparent"
              required
            >
              <option value=""></option>
              <option value="Patient">Patient</option>
              <option value="Staff">Staff</option>
            </select>
            <label htmlFor="userType">User Type</label>
          </div>
          <div className="form-group form-check mt-5 mx-2">
            <input type="checkbox" className="form-check-input !rounded-[3px] !border !border-black" id="terms-chkbox" required />
            <label className='' htmlFor="terms-chkbox">I agree with the terms and conditons</label>
          </div>
          <div className='text-center'>
            <button className="m-10 bg-[#31b372] px-[60px] py-2.5 text-white transition duration-100 ease-in-out hover:scale-110 max-[1000px]:px-[50px]" type="submit">Sign Up</button>
          </div>
          <div className='text-center'>
            Already have an account? <NavLink to="/login">Sign In</NavLink>
          </div>

        </form>
      </div>
      <ErrorDialogueBox
        open={errorDialogueBoxOpen}
        handleToClose={handleDialogueClose}
        ErrorTitle="Error Signing Up"
        ErrorList={errorList}
      />
    </div>
  );
}

export default SignupPage;
