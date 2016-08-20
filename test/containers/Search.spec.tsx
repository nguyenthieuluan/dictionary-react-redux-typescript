import * as expect from "expect";
import * as React from "react";
import "react-dom";
import * as Helmet from "react-helmet";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import createMockStore from "../_helpers/createMockStore";
import { searchStart } from "../../src/actions/search";
import { searchTask } from "../../src/sagas/search";
import { createEntry } from "../../src/api/Entry";
import Search from "../../src/containers/Search";
import EntryList from "../../src/components/EntryList";
import EntryListItem from "../../src/components/EntryListItem";
import LoadingIndicator from "../../src/components/LoadingIndicator";
import SearchInput from "../../src/components/SearchInput";
import Warning from "../../src/components/Warning";

describe("<Search />", () => {
  let state;
  let store;
  let wrapper;

  beforeEach(() => {
    state = {
      search: {
        entries: [
          createEntry("a", "a:1", { "@n": "1", "@id": "a:1", form: { orth: "A" }, sense: [] }),
          createEntry("a", "a:2", { "@n": "2", "@id": "a:2", form: { orth: "A" }, sense: [] }),
          createEntry("a", "a:3", { "@n": "3", "@id": "a:3", form: { orth: "A" }, sense: [] }),
        ],
        error: null,
        isLoading: false,
        params: {
          prefix: "test",
        },
        prefix: "test",
      },
    };

    store = createMockStore(state);

    wrapper = mount(
      <Provider store={store}>
        <Search />
      </Provider>
    );
  });

  it("preloads search results", () => {
    const prefix = "test";
    const preloaders = (Search as any).preload({ prefix });

    preloaders.forEach(preloader => {
      expect(preloader[0]).toBe(searchTask);
      expect(preloader[1]).toEqual(searchStart(prefix));
    });
  });

  it("renders", () => {
    expect(wrapper.find("section.search").length).toBe(1);
  });

  it("contains a single <SearchInput /> component", () => {
    expect(wrapper.find(SearchInput).length).toBe(1);
  });

  it("contains a <EntryListItem /> per results entry", () => {
    expect(wrapper.find(EntryListItem).length).toBe(state.search.entries.length);
  });

  ["test", "0", "", null].forEach((prefix) => {
    const contextDescription = prefix != null ? `when searching "${prefix}"` : "when not searching";
    const doesOrDoesNotDisplay = prefix ? "displays" : "does not display";

    context(contextDescription, () => {
      it(doesOrDoesNotDisplay + " an <EntryList /> component", () => {
        state.search.prefix = prefix;

        store = createMockStore(state);

        wrapper = mount(
          <Provider store={store}>
            <Search />
          </Provider>
        );

        expect(wrapper.find(EntryList).length).toBe(prefix ? 1 : 0);
      });

      it(doesOrDoesNotDisplay + " a loading indicator", () => {
        state.search.isLoading = true;
        state.search.prefix = prefix;

        store = createMockStore(state);

        wrapper = mount(
          <Provider store={store}>
            <Search />
          </Provider>
        );

        expect(wrapper.find(LoadingIndicator).length).toBe(prefix ? 1 : 0);
      });

      it(doesOrDoesNotDisplay + " an error on no results", () => {
        state.search.isLoading = false;
        state.search.entries = [];
        state.search.prefix = prefix;

        store = createMockStore(state);

        wrapper = mount(
          <Provider store={store}>
            <Search />
          </Provider>
        );

        expect(wrapper.find(Warning).length).toBe(prefix ? 1 : 0);
      });
    });
  });

  it("displays a warning on error", () => {
    const message = "Error message";

    state.search.error = new Error(message);

    store = createMockStore(state);

    wrapper = mount(
      <Provider store={store}>
        <Search />
      </Provider>
    );

    expect((Helmet as any).peek().title).toBe(message);
    expect(wrapper.find(Warning).length).toBe(1);
    expect(wrapper.find(Warning).props().message).toBe(message);
  });

  it("displays a warning when no definition found", () => {
    const message = "Palavra não encontrada";

    state.search.entries = [];

    store = createMockStore(state);

    wrapper = mount(
      <Provider store={store}>
        <Search />
      </Provider>
    );

    expect((Helmet as any).peek().title).toBe(message);
    expect(wrapper.find(Warning).length).toBe(1);
    expect(wrapper.find(Warning).props().message).toBe(message);
  });

  it("dispatches a SEARCH_START on query", () => {
    const prefix = "test";

    wrapper.find("input").simulate("change", {
      target: {
        value: prefix,
      },
    });

    const actions = store.getActions();

    expect(actions[1]).toEqual(searchStart(prefix));
  });

  it("sets the SearchInput text to the prefix parameter if property null", () => {
    const prefix = "parâmetro";
    const params = { prefix };

    state.search.prefix = null;

    store = createMockStore(state);

    wrapper = mount(
      <Provider store={store}>
        <Search {...{params}} />
      </Provider>
    );

    expect(wrapper.find(SearchInput).props().text).toBe(prefix);
  });

  it("dispatches a SEARCH_START on mount with prefix parameter", () => {
    const prefix = "parâmetro";
    const params = { prefix };

    state.search.prefix = null;

    store = createMockStore(state);

    wrapper = mount(
      <Provider store={store}>
        <Search {...{params}} />
      </Provider>
    );

    const actions = store.getActions();
    expect(actions[0]).toEqual(searchStart(prefix));
  });

  xit("sets the URL for the current search when pressing the Enter key", () => {
    const prefix = "test";

    wrapper.find("input").simulate("change", {
      target: {
        value: prefix,
      },
    });

    wrapper.find("input").simulate("keyup", {
      keyCode: 13,
    });

    expect(window.location.pathname).toBe("/search/" + prefix);
  });
});
