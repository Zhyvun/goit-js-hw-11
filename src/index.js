//3.2.
import Simplelightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { ImgApiServ } from './js/img_api_serv';
import Notiflix from 'notiflix';
const optionsNtf = {
  position: 'left-top',
  timeout: 10000,
  clickToClose: true,
  cssAnimationStyle: 'zoom',
};

// 3.3.
const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const trackEl = document.querySelector('.tracker');
// 3.4.
const imgApiServ = new ImgApiServ();

let lightbox = new Simplelightbox('.gallery a', {
  captionDelay: 500,
  captionsData: 'alt',
  captionPosition: 'button',
  disableRightClick: true,
  fadeSpeed: 500,
});
//3.5.
formEl.addEventListener('submit', onSearch);
//3.6.
function onSearch(event) {
  event.preventDefault();

  imgApiServ.query = event.currentTarget.elements.searchQuery.value.trim();
  imgApiServ.resetPage();
  cleanGallery();
  if (!imgApiServ.query) {
    return Notiflix.Notify.failure(
      '🤷‍♂️ Sorry, there are no images matching your search query. Please try again.',
      optionsNtf
    );
  }
  fetchResult();
}
//3.7.
function fetchResult() {
  infScroll.unobserve(trackEl);
  renderOnRequest();
}
//3.9.
function onCheckInput(totalHits) {
  if (imgApiServ.query === '' || totalHits <= 2) {
    return Notiflix.Notify.failure(
      '🤷‍♀️ Sorry, there are no images matching your search query. Please try again.',
      optionsNtf
    );
  }
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`, optionsNtf);
}
//3.10.
function renderOnRequest() {
  imgApiServ.fetchImg().then(({ hits, totalHits }) => {
    if (imgApiServ.page === 1) {
      onCheckInput(totalHits);
    }
    //3.11.
    appendPicsMarkup(hits);
    lightbox.refresh();
    infScroll.observe(trackEl);
    if (imgApiServ.page === Math.ceil(totalHits / 40)) {
      infScroll.unobserve(trackEl);
      lightbox.refresh();
      return Notiflix.Notify.info(
        " 😒 We're sorry, but you've reached the end of search results.",
        optionsNtf
      );
    }
    imgApiServ.incrementPage();
  });
}
//3.11.
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
//3.12.
function cleanGallery() {
  galleryEl.innerHTML = '';
}
//3.7.
const variable = {
  rootMargin: '300px',
  history: false,
};
//3.8.
const onScroll = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && imgApiServ.query !== '') {
      if (imgApiServ.page === 1) {
        return;
      }
      renderOnRequest();
    }
  });
};
//3.7.
const infScroll = new IntersectionObserver(onScroll, variable);
infScroll.observe(trackEl);
