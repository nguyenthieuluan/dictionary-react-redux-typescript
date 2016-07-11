import { handleActions, Action } from "redux-actions";
import { DEFINITION_START, DEFINITION_DONE, DEFINITION_ERROR } from "../actions/definition";
import { IEntry } from "../api/Entry";

interface IDefinitionState {
  entries?: IEntry[];
  error?: Error;
  isLoading?: boolean;
}

const initialState: IDefinitionState = {
  entries: [],
  error: null,
  isLoading: false,
};

export const definitionReducer = handleActions({

  DEFINITION_START: (state: IDefinitionState, action: Action<any>): IDefinitionState =>
    Object.assign({}, state, {
      error: null,
      isLoading: true,
    } as IDefinitionState),

  DEFINITION_DONE: (state: IDefinitionState, action: Action<any>): IDefinitionState =>
    Object.assign({}, state, {
      entries: action.payload,
      error: null,
      isLoading: false,
    } as IDefinitionState),

  DEFINITION_ERROR: (state: IDefinitionState, action: Action<any>): IDefinitionState =>
    Object.assign({}, state, {
      entries: [],
      error: action.payload,
      isLoading: false,
    } as IDefinitionState),

}, initialState);

export default definitionReducer;
