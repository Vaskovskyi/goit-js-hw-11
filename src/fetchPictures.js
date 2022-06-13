const axios = require('axios');

const API_KEY = '25910562-a2104437e4307ded07a843390';

export async function fetchPictures(inputValue, page) {
  return await axios.get('https://pixabay.com/api/', {
    params: {
      key: API_KEY,
      q: inputValue,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page,
    },
  });
}
