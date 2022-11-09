import { IPasswordValidator, IRegisterValidator } from "../interfaces";


function validateEmail(email: string):boolean {
  const re:RegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email)
}


export const registerValidator = ({ name, email, password, cf_password }: IRegisterValidator):string | void => {
  if(!name || !email || !password) {
    return 'Please add all fields'
  }

  if(!validateEmail(email)) {
    return 'Invalid email'
  }

  if(password.length < 6) {
    return 'Password must be at least 6 characters'
  }

  if(password !== cf_password) {
    return 'Confirm password did not match'
  }
}


export const passwordValidator = ({ newPassword, confirmNewPassword }: IPasswordValidator): string | void => {
  if(newPassword.length < 6) {
    return 'New Password must be at least 6 characters'
  }

  if(newPassword !== confirmNewPassword) {
    return 'Confirm password did not match'
  }
}