import React from "@moonlight-mod/wp/react";

import spacepack from "@moonlight-mod/wp/spacepack_spacepack";

import Fuse from "fuse.js";

const i18n = spacepack.require("discord/intl");
const intl = spacepack.findObjectFromKey(i18n, "_forceLookupMatcher");

const styles = spacepack.findByCode("searchBar:", "searchHeader:", "header:")[0]
	.exports;

// biome-ignore lint/suspicious/noExplicitAny: typing class components is really painful
const SearchBar: any = (() => {
	const mod = spacepack.findByCode(`has${""}Content:`, "isLoading:", ".SMALL");

	return spacepack.findFunctionByStrings(
		mod[0].exports,
		`handle${""}OnChange`,
		"placeholder",
		"autoFocus",
	);
})();

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
		searchBarRef: React.Ref<typeof SearchBar>;
	};
	forceUpdate(): void;
}

export function renderGifSearchHeader(_this: GifPickerThis) {
	let [query, setQuery] = React.useState("");

	const onChange = React.useCallback(
		(query: string) => {
			setQuery(query);

			let { props } = _this;

			if (!query) {
				props.favorites = [...props.originalFavorites];
				_this.forceUpdate();
				return;
			}

			const fuse = new Fuse(_this.props.originalFavorites, { keys: ["url"] });
			const result = fuse.search(query);

			props.favorites = result.map((i) => i.item);

			_this.forceUpdate();
		},
		[_this],
	);

	const onClear = React.useCallback(() => {
		setQuery("");
		_this.props.favorites = [..._this.props.originalFavorites];
		_this.forceUpdate();
	}, [_this]);

	const favouritesStr = intl.string(i18n.t.y3LQCA);

	const autoFocus = moonlight.getConfigOption<boolean>(
		"favouriteGifSearch",
		"autoFocus",
	);

	return (
		<SearchBar
			className={styles.searchBar}
			size={SearchBar.Sizes.MEDIUM}
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
