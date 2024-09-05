import { Component } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ImportsModule} from "../../imports";
import { LoginService } from '../../services/login.service';
import {Router} from "@angular/router";

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
              private loginService: LoginService,
              private router: Router) {
    this.loginForm = this.formBuilder.group({
      username: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    })
  }

  onSubmit() {
    const { username, password } = this.loginForm.value;
      this.loginService.signIn(username, password).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.router.navigate(['/main']);
        },
        error: (error) => {
          console.error('Login failed:', error);
          // Handle error (e.g., show an error message)
        },
      });
  }
}
