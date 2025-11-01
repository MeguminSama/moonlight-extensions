import { ExtensionWebExports } from "@moonlight-mod/types";

export const patches: ExtensionWebExports["patches"] = [
  {
    find: ".getDesktopType()===",
    replace: [
      {
        match: /if\(o.Z.dispatch\({type:"RPC_NOTIFICATION_CREATE",/,
        replacement: `if(!require("onePingPerDM_utils").isPrivateChannelRead(arguments[0]?.message))return; $&`,
      },
      {
        match: /(\i\.\i\.getDesktopType\(\)===\i\.\i\.NEVER)\)/,
        replacement: '$&if(!require("onePingPerDM_utils").isPrivateChannelRead(arguments[0]?.message))return;else '
      },
      {
        match: /sound:(\i\?\i:void 0,soundpack:\i,volume:\i,onClick)/,
        replacement: 'sound:!require("onePingPerDM_utils").isPrivateChannelRead(arguments[0]?.message)?undefined:$1'
      }
    ]
  }
];

export const webpackModules: ExtensionWebExports["webpackModules"] = {
  utils: {}
};
