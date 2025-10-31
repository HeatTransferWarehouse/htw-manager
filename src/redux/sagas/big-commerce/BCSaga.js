import { all } from 'redux-saga/effects';
import HTWOrdersSaga from './orders/htw/htwOrdersSaga';
import SFFOrdersSaga from './orders/sff/sffOrdersSaga';

// rootSaga is the primary saga.
// It bundles up all of the other sagas so our project can use them.
// This is imported in index.js as rootSaga
export default function* BCSaga() {
  yield all([HTWOrdersSaga(), SFFOrdersSaga()]);
}
