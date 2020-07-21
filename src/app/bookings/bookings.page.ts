import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from './booking.service';
import { Booking } from './booking.model';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {

  loadedBookings: Booking[];
  private bookingSub: Subscription;
  isLoading = false;

  constructor(
    private bookingService: BookingService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    // this.loadedBookings = this.bookinService.bookings;
    this.bookingSub = this.bookingService.bookings.subscribe(bookings => {
      this.loadedBookings = bookings;
    });

  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingService.fetchBookings().subscribe(() => {
      this.isLoading = false;

    });
  }
  onCancel(offerId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    console.log('cancel booking ', offerId);
    // cancel booking here
  }

  onCancelBooking(bookingId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    this.loadingCtrl.create({ message: 'Cancelling...' }).then(loadingEl => {
      loadingEl.present();
      this.bookingService.cancelBooking(bookingId).subscribe(() => {
        loadingEl.dismiss();
      });
    });
  }


  ngOnDestroy() {
    if (this.bookingSub) {
      this.bookingSub.unsubscribe();
    }
  }

}
