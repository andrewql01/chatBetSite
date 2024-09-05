import { Component } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ImportsModule} from "../../imports";

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
  constructor(private formBuilder: FormBuilder) {
    this.registerForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.minLength(6)]),
      username: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    })
  }
  get email(){
    return this.registerForm.controls['email'].value;
  }
  get username(){
    return this.registerForm.controls['username'].value;
  }
  get password(){
    return this.registerForm.controls['password'].value;
  }

  onSubmit(){
    console.log(this.registerForm.value);
  }
}
