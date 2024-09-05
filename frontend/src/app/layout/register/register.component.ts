import { Component } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ImportsModule} from "../../imports";
import {RegisterService} from "../../services/register.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  standalone: true,
    imports: [
        ImportsModule,
    ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  constructor(private formBuilder: FormBuilder,
              private registerService: RegisterService,
              private router: Router) {
    this.registerForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.minLength(6)]),
      username: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    })
  }
  onSubmit() {
  const { email, username, password } = this.registerForm.value;
    this.registerService.signUp(email, username, password).subscribe({
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
