import Simplelightbox from 'simplelightbox';
import { PicsApiService } from './js/pics-api-service';
import Notiflix from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const observedEl = document.querySelector('.sentinel');

const picsApiService = new PicsApiService();

let lightbox = new Simplelightbox('.gallery a', {
  captionDelay: 500,
  captionsData: 'alt',
});

formEl.addEventListener('submit', onSearch);

function onSearch(event) {
  event.preventDefault();

  picsApiService.query = event.currentTarget.elements.searchQuery.value.trim();
  picsApiService.resetPage();
  clearGallery();
  if (!picsApiService.query) {
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  fetchResult();
}

function fetchResult() {
  infScroll.unobserve(observedEl);
  renderOnRequest();
}

function onCheckInput(totalHits) {
  if (picsApiService.query === '' || totalHits <= 2) {
    // додав перевірку для totalHits тому, що ліміт за запитом на Pixabay складає від 3 картинок
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
}

function renderOnRequest() {
  picsApiService.fetchPics().then(({ hits, totalHits }) => {
    if (picsApiService.page === 1) {
      onCheckInput(totalHits);
    }

    appendPicsMarkup(hits);
    lightbox.refresh();
    infScroll.observe(observedEl);
    if (picsApiService.page === Math.ceil(totalHits / 40)) {
      infScroll.unobserve(observedEl);
      lightbox.refresh();
      return Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
    picsApiService.incrementPage();
  });
}

function appendPicsMarkup(hits) {
  const markup = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
  <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" width=320 height=240/></a>
  <div class="info">
  <p class="info-item">Likes: 
    <b>${likes}</b>
  </p>
    <p class="info-item">Views: 
      <b>${views}</b>
    </p>
    <p class="info-item">Comments: 
      <b>${comments}</b>
    </p>
    <p class="info-item">Downloads:
      <b>${downloads}</b> 
    </p>
  </div>
</div>`;
      }
    )
    .join('');

  galleryEl.insertAdjacentHTML('beforeend', markup);
}

function clearGallery() {
  galleryEl.innerHTML = '';
}

const options = {
  rootMargin: '300px',
  history: false,
};

const onEntry = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && picsApiService.query !== '') {
      if (picsApiService.page === 1) {
        return;
      }
      renderOnRequest();
    }
  });
};

const infScroll = new IntersectionObserver(onEntry, options);
infScroll.observe(observedEl);
