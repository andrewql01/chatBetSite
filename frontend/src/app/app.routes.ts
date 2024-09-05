import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { WelcomeComponent } from './layout/welcome/welcome.component';
import { LoginComponent } from './layout/login/login.component';
import { RegisterComponent } from './layout/register/register.component';
import {MainComponent} from "./layout/main/main.component";

export const routes: Routes = [
  { path: '', component: WelcomeComponent },  // Default route
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'main', component: MainComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },  // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
