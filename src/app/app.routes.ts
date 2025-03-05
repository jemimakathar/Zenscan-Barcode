import { Routes } from '@angular/router';
import { SellerRegisterComponent } from './Modules/Seller/seller-register/seller-register.component';
import { SellerLoginComponent } from './Modules/Seller/seller-login/seller-login.component';
import { PricingComponent } from './Modules/Seller/pricing/pricing.component';
import { SellerProductsComponent } from './Modules/Seller/seller-products/seller-products.component';
import { SellerCategoryComponent } from './Modules/Seller/seller-category/seller-category.component';
import { SellerNavComponent } from './Modules/Seller/seller-nav/seller-nav.component';
import { BillingComponent } from './Modules/Seller/billing/billing.component';
import { HomePageComponent } from './Modules/landingPage/home-page/home-page.component';
import { InvoicesComponent } from './Modules/Seller/invoices/invoices.component';
import { AdminPageComponent } from './Modules/Admin/admin-page/admin-page.component';
import { SellerHomePageComponent } from './Modules/Seller/seller-home-page/seller-home-page.component';
import { AdminHomePageComponent } from './Modules/Admin/admin-home-page/admin-home-page.component';
import { DemoComponent } from './Modules/Demo/demo/demo.component';





export const routes: Routes = [
    {path:'',component:HomePageComponent},
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'seller-product', component: SellerProductsComponent },
    {path:'seller-login',component:SellerLoginComponent},
    { path: 'register', component: SellerRegisterComponent },
    { path: 'home-pricing', component: PricingComponent },
    {path:'seller-category',component:SellerCategoryComponent},
    {path:'seller-nav',component:SellerNavComponent},
    {path:'billing',component:BillingComponent},
    {path:'invoice',component:InvoicesComponent},
    {path:'pricing',component:PricingComponent},
    {path:'seller-homepage',component:SellerHomePageComponent},
    {path:'admin-homePage',component:AdminHomePageComponent},  
    {path:'admin-page',component:AdminPageComponent},
    {path:'demo',component:DemoComponent},
];
