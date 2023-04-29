//2.1.
import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '35805429-18a150f429e0469a7a93e7211';

//2.2.
export class ImgApiServ {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }
  //2.2.2.
  async fetchImg() {
    const params = new URLSearchParams({
      key: API_KEY,
      q: this.searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page: this.page,
    });
    //2.2.3
    try {
      const {
        data: { hits, totalHits },
      } = await axios.get(BASE_URL, { params });

      return { hits, totalHits };
    } catch (error) {
      console.error(error.response);
    }
  }
  //2.2.4.
  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }
  //2.2.5.
  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
