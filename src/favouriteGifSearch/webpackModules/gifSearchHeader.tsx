import React from "@moonlight-mod/wp/react";

import spacepack from "@moonlight-mod/wp/spacepack_spacepack";

import Fuse from "fuse.js";

const i18n = spacepack.require("discord/intl");
const SearchBar = spacepack.require("discord/uikit/search/SearchBar").default;
const styles = spacepack.findByCode("searchBar:", "searchHeader:", "header:")[0].exports;

interface FavouriteGif {
  order: number;
  format: number;
  width: number;
  height: number;
  src: string;
  url: string;
}

interface GifPickerThis {
  props: {
    favorites: FavouriteGif[];
    originalFavorites: FavouriteGif[];
    _fuzzyFuse: Fuse<FavouriteGif>;
    searchBarRef: React.Ref<typeof SearchBar>;
  };
  forceUpdate(): void;
}

export function renderGifSearchHeader(_this: GifPickerThis) {
  const [query, setQuery] = React.useState("");

  const onChange = React.useCallback(
    (query: string) => {
      setQuery(query);

      const { props } = _this;

      if (!query) {
        props.favorites = [...props.originalFavorites];
        _this.forceUpdate();
        return;
      }

      const result = _this.props._fuzzyFuse.search(query);

      props.favorites = result.map((i) => i.item);

      _this.forceUpdate();
    },
    [_this]
  );

  const onClear = React.useCallback(() => {
    setQuery("");
    _this.props.favorites = [..._this.props.originalFavorites];
    _this.forceUpdate();
  }, [_this]);

  const favouritesStr = i18n.intl.string(i18n.t.y3LQCA);

  const autoFocus = moonlight.getConfigOption<boolean>("favouriteGifSearch", "autoFocus");

  return (
    <SearchBar
      className={styles.searchBar}
      size="md"
      query={query}
      onChange={onChange}
      onClear={onClear}
      placeholder={`Search ${favouritesStr}`}
      aria-label={`Search ${favouritesStr}`}
      ref={_this.props.searchBarRef}
      autoFocus={autoFocus}
    />
  );
}

export function createFuse(_this: GifPickerThis) {
  const fuse = new Fuse(_this.props.originalFavorites, {
    keys: [
      {
        name: "_fuzzyQuery.pathName",
        weight: 10
      },
      {
        name: "_fuzzyQuery.queryParams",
        weight: 5
      },
      {
        name: "_fuzzyQuery.website",
        weight: 1
      }
    ]
  });

  return fuse;
}

/**
 * This functions loops over the favourite gifs, and generates fuzzy queries for them
 *
 * These are prioritised in the fuzzy search in the following order:
 *
 * 1. pathName: This is the "/path/to/name.gif" of the file.
 *              If the domain is discord or tenor, it will just be the file name.
 *
 * 2. queryParams: This is the ?query=params in the URL.
 *
 * 3. website: This is either "discord", "tenor", or "".
 *             This allows you to search "cat discord" or "cat tenor" to sort the gifs based on the website.
 * @param favs The Discord favourites array
 * @returns The favourites array with the fuzzy filter values inserted.
 */
export function generateFilters(favs: FavouriteGif[]): FavouriteGif[] {
  return favs.map((fav) => {
    try {
      const url = new URL(fav.url);

      // If the domain is Discord, remove the /attachments/:id1/:id2/
      const hostname = url.hostname.toLowerCase();
      let pathName = url.pathname.toLowerCase();
      let website = url.hostname;

      const isDiscord =
        hostname === "cdn.discordapp.com" || // cdn URLs
        hostname.endsWith("discordapp.net"); // media., images-ext-\d, ...

      const isTenor = hostname === "tenor.com" || hostname.startsWith(".tenor.com");

      if (isDiscord) {
        website = "discord";
        if (pathName.startsWith("/attachments/") || pathName.startsWith("/external/")) {
          pathName = pathName.split("/").pop() ?? pathName;
        }
      } else if (isTenor) {
        website = "tenor";
        pathName = pathName.split("/").pop() ?? pathName;
      } else {
        // Improve search by separating the path name into separate words
        pathName = pathName.split("/").join(" ");
      }

      return {
        ...fav,
        _fuzzyQuery: {
          pathName: pathName, // first priority
          queryParams: url.search, // second priority
          website: website // third priority
        }
      };
    } catch {
      return { ...fav };
    }
  });
}
