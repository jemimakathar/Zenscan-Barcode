import { Component} from '@angular/core';
import { AdminNavComponent } from "../admin-nav/admin-nav.component";
@Component({
  selector: 'app-admin-home-page',
  standalone: true,
  imports: [AdminNavComponent],
  templateUrl: './admin-home-page.component.html',
  styleUrl: './admin-home-page.component.css',
})
export class AdminHomePageComponent  {



}
