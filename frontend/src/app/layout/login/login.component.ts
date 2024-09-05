import { Component } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ImportsModule} from "../../imports";
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private loginService: LoginService,) {
    this.loginForm = this.formBuilder.group({
      username: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    })
  }
  get username(){
    return this.loginForm.controls['username'].value;
  }
  get password(){
    return this.loginForm.controls['password'].value;
  }

  onSubmit() {
    const { username, password } = this.loginForm.value;
      this.loginService.signIn(username, password).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          // Handle success (e.g., navigate to another page)
        },
        error: (error) => {
          console.error('Login failed:', error);
          // Handle error (e.g., show an error message)
        },
        complete: () => {
          console.log('Login completed');
          // Optional: Handle when the observable completes
        }
      });
  }
}
