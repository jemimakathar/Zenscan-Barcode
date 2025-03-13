import { Component} from '@angular/core';
import { InvoicesComponent } from '../invoices/invoices.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthenticationService } from '../../../Services/authentication.service';
import { CouchdbService } from '../../../Services/couchdb.service';
@Component({
  selector: 'app-dash-board',
  standalone: true,
  imports: [FormsModule,CommonModule,HttpClientModule],
  templateUrl: './dash-board.component.html',
  styleUrl: './dash-board.component.css',
  providers: [HttpClient,AuthenticationService,CouchdbService,InvoicesComponent  ]
})
export class DashBoardComponent{

}

