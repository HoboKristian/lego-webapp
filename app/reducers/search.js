import { createSelector } from 'reselect';
import { Search } from '../actions/ActionTypes';

const initialState = {
  results: [],
  autocomplete: [],
  query: '',
  searching: false,
  open: false
};

const searchMapping = {
  'users.user': {
    label: 'fullName',
    color: '#A1C34A',
    path: '/users/',
    value: 'id',
    profilePicture: 'profilePicture'
  },
  'articles.article': {
    icon: 'newspaper-o',
    label: 'title',
    picture: 'cover',
    color: '#52B0EC',
    path: '/articles/',
    value: 'id',
    content: 'text'
  },
  'events.event': {
    icon: 'calendar',
    value: 'title',
    color: '#E8953A',
    picture: 'cover',
    path: '/events/',
    value: 'id',
    content: 'description'
  },
  'flatpages.page': {
    profilePicture: 'picture',
    value: 'title',
    color: '#E8953A',
    path: '/pages/',
    value: 'slug',
    content: 'content'
  }
};

export default function search(state = initialState, action) {
  switch (action.type) {
    case Search.SEARCH.BEGIN:
      return {
        ...state,
        query: action.meta.query,
        searching: true
      };

    case Search.AUTOCOMPLETE.BEGIN:
      return {
        ...state,
        query: action.meta.query,
        searching: true
      };

    case Search.SEARCH.SUCCESS:
      if (action.meta.query !== state.query) {
        return state;
      }

      return {
        ...state,
        results: action.payload,
        searching: false
      };

    case Search.AUTOCOMPLETE.SUCCESS:
      if (action.meta.query !== state.query) {
        return state;
      }

      return {
        ...state,
        autocomplete: action.payload,
        searching: false
      };

    case Search.SEARCH.FAILURE:
      return {
        ...state,
        searching: false
      };

    case Search.AUTOCOMPLETE.FAILURE:
      return {
        ...state,
        searching: false
      };

    case Search.TOGGLE_OPEN:
      return {
        ...state,
        autocomplete: [],
        open: !state.open
      };

    default:
      return state;
  }
}

const transformResult = result => {
  const fields = searchMapping[result.contentType];
  const item = {};

  Object.keys(fields).forEach(field => {
    item[field] = result[fields[field]] || fields[field];
  });

  item.link = item.path + item.value;

  return item;
};

export const selectAutocomplete = createSelector(
  state => state.search.autocomplete,
  autocomplete => autocomplete.map(result => transformResult(result))
);

export const selectResult = createSelector(
  state => state.search.results,
  results => results.map(result => transformResult(result))
);
