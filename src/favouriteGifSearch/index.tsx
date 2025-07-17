import { ExtensionWebExports } from "@moonlight-mod/types";

export const patches: ExtensionWebExports["patches"] = [
	{
		find: /.handleSelectGIF,/g,
		replace: {
			match: /case (\i\.\i\.FAVORITES):return(\(0,(\i)\.jsx\))/g,
			replacement: (_orig, matchCase, createElement) => `case ${matchCase}: {
        if (!this.props.originalFavorites) this.props.originalFavorites = [...this.props.favorites];
        return ${createElement}(require("favouriteGifSearch_gifSearchHeader").renderGifSearchHeader, this);
      } let __ignore__ =`,
		},
	},
];

export const webpackModules: ExtensionWebExports["webpackModules"] = {
	gifSearchHeader: {
		dependencies: [
			{ id: "react" },
			{ id: "discord/intl" },
			{ ext: "spacepack", id: "spacepack" },
			"searchBoxInputWrapper:",
		],
	},
};
