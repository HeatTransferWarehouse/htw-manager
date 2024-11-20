import { all } from "redux-saga/effects";
import htwProductsSaga from "./htw";
import sffProductsSaga from "./sff";

export default function* rootProductsSage() {
  yield all([htwProductsSaga(), sffProductsSaga()]);
}
