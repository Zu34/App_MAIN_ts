import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataService } from 'src/app/Services/data.service';


// Define outside the component
interface Movie {
  poster_path: string;
  title: string;
}


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {
  allData: any[] = [];
  trendingMovies: any[] = [];
  trendingShows: any[] = [];
  news: any[] = [];
  topTenMovies: any[] = [];


moreToExplore: {
  title: string;
  linkText: string;
  link: string;
  posters: Movie[];
}[] = [
  {
    title: 'Staff Picks: What to Watch',
    linkText: 'See our picks',
    link: '#',
    posters: []
  },
  {
    title: 'Everything New on Netflix',
    linkText: 'See the list',
    link: '#',
    posters: []
  },
  {
    title: 'Movies That Make Us Love L.A.',
    linkText: 'Vote now',
    link: '#',
    posters: []
  }
];

exclusiveVideos: {
  title: string;
  videoUrl: string;
  imageUrl: string;
  key: string;

}[] = [];

  @ViewChild('movieSlider', { static: false }) movieSlider!: ElementRef;

  constructor(
    private _DataService: DataService,
    private spinner: NgxSpinnerService
  ) {}

    ngOnInit(): void {
      this.fetchTrendingData();
      this.fetchNews();
      this.fetchExclusiveVideos();

      setInterval(() => {
      this.scrollRight();
    }, 3000);
    
  }


fetchTrendingData(): void {
  this.spinner.show();

  this._DataService.getTrending("all").subscribe({
    next: (data) => {
      this.spinner.hide();

      this.allData = data.results.filter((item: any) => item.poster_path != null);

      const movies = this.shuffle(this.allData.filter((item: any) => item.media_type === "movie"));
      const shows = this.shuffle(this.allData.filter((item: any) => item.media_type === "tv"));

      this.trendingMovies = movies;
      this.trendingShows = shows;

      this.moreToExplore[0].posters = movies.slice(0, 4);
      this.moreToExplore[1].posters = shows.slice(0, 8);
      this.moreToExplore[2].posters = movies.slice(8, 12);
    },
    error: (err) => {
      this.spinner.hide();
      console.error("Error fetching trending (all):", err);
    }
  });

  // 🎯 Separate call just for clean TV poster set
  this._DataService.getTrending("tv").subscribe({
    next: (tvRes) => {
      const validTv = tvRes.results.filter((show: any) => show.poster_path);
      this.topTenMovies = this.shuffle(validTv).slice(0, 6);
    },
    error: (err) => console.error("Error fetching trending (tv):", err)
  });
}


  fetchNews(): void {
    this._DataService.getEntertainmentNews().subscribe({
      next: (data) => {
        this.news = data.articles.slice(0, 6); 
      },
      error: (err) => {
        console.error('Error fetching entertainment news:', err);
      }
    });
  }
  
  shuffle(array: any[]): any[] {
    return array.sort(() => Math.random() - 0.5);
  }

  scrollLeft(): void {
    this.movieSlider.nativeElement.scrollBy({ left: -800, behavior: 'smooth' });
  }

  scrollRight(): void {
    this.movieSlider.nativeElement.scrollBy({ left: 800, behavior: 'smooth' });
  }

  
  fetchExclusiveVideos(): void {
    const API_KEY = 'd229a3f3a83df351970dc2d5600d2410';
    const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
  
    this._DataService.fetchFromApi(API_URL).subscribe(async (data: any) => {
      const results = data.results.slice(0, 5);
      const videos: any[] = [];
  
      for (const movie of results) {
        const videoKey = await this._DataService.getYoutubeTrailerKey(movie.id, API_KEY);
        if (videoKey) {
          videos.push({
            title: movie.title,
            videoUrl: `https://www.youtube.com/watch?v=${videoKey}`,
            imageUrl: movie.backdrop_path
              ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
              : 'https://via.placeholder.com/500',
              key: videoKey // <- add this line

          });
        }
      }
  
      this.exclusiveVideos = videos.slice(0, 3);
    });
  }

}
