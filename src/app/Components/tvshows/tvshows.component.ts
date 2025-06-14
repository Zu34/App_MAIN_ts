import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as AOS from 'aos';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataService } from 'src/app/Services/data.service';
import { WatchlistService } from 'src/app/Services/watchlist.service';

@Component({
  selector: 'app-tvshows',
  templateUrl: './tvshows.component.html',
  styleUrls: ['./tvshows.component.scss']
})
export class TVShowsComponent implements OnInit {
  notice: boolean = true;
  disablePrev: boolean = false;
  disableNext: boolean = true;
  page: number = 1;
  type: any = '';
  pageTitle: string = '';
  allData: any[] = [];
  tvShows: any[] = [];

  constructor(
    private _DataService: DataService,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
    private Spinner: NgxSpinnerService,
    private watchlistService: WatchlistService // ✅ Added
  ) {}

  ngOnInit(): void {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
    });

    this._ActivatedRoute.paramMap.subscribe(params => {
      this.type = params.get('genre');
      this.page = Number(params.get('page')) || 1;
      this.disablePrev = this.page > 1;

      switch (this.type) {
        case 'on_the_air':
          this.pageTitle = 'On Air';
          break;
        case 'popular':
          this.pageTitle = 'Popular TV Shows';
          break;
        case 'top_rated':
          this.pageTitle = 'Top Rated Shows';
          break;
        case 'airing_today':
          this.pageTitle = 'Airing Today';
          break;
        default:
          this.pageTitle = 'TV Shows';
      }

      this.loadData();
    });
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  isInWatchlist(tvId: number): boolean {
    return this.watchlistService.isInWatchlist(tvId, 'tv');
  }

  toggleWatchlist(tv: any): void {
    const isSaved = this.watchlistService.isInWatchlist(tv.id, 'tv');

    if (isSaved) {
      this.watchlistService.removeFromWatchlist(tv.id, 'tv');
    } else {
      this.watchlistService.addToWatchlist({ id: tv.id, type: 'tv' });
    }
  }

  loadData(): void {
    this.Spinner.show();
    this._DataService.getData('tv', this.type, this.page).subscribe(response => {
      this.notice = response.success;
      this.Spinner.hide();

      this.allData = response.results.filter((item: any) => item.poster_path != null);
      this.tvShows = this.allData.slice(0, 12);
      setTimeout(() => AOS.refresh(), 0);
    });
  }

  Next(): void {
    if (this.page < 1000) {
      this.page++;
      this._Router.navigate(['/tvshows', this.type, this.page]);
    }
  }

  Prev(): void {
    if (this.page > 1) {
      this.page--;
      this._Router.navigate(['/tvshows', this.type, this.page]);
    }
  }
}
