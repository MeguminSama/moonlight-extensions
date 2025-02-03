import { ChannelStore, ReadStateStore, UserStore } from "@moonlight-mod/wp/common_stores";

interface PartialMessage {
  id: string;
  channel_id: string;
  mentions: PartialUser[];
  mention_everyone: boolean;
}

interface PartialUser {
  id: string;
}

enum ChannelType {
  DM = 1,
  GROUP_DM = 3
}

enum TypeOfDM {
  USER_DM = "user_dm",
  GROUP_DM = "group_dm",
  BOTH = "both"
}

/**
 * Check if a private channel has been read or not.
 * @param message The received channel message
 * @returns If returns true, allow default pinging behaviour. If returns false, do not allow pings.
 */
export function isPrivateChannelRead(message: PartialMessage): boolean {
  const channelType: ChannelType = ChannelStore.getChannel(message.channel_id)?.type;

  const settings = {
    typeOfDM: moonlight.getConfigOption<TypeOfDM>("onePingPerDM", "typeOfDM"),
    allowMentionsBypass: moonlight.getConfigOption<boolean>("onePingPerDM", "allowMentionsBypass"),
    allowAtEveryoneBypass: moonlight.getConfigOption<boolean>("onePingPerDM", "allowAtEveryoneBypass")
  };

  // If the channel is not a User DM, and not a Group DM, use default behaviour.
  if (channelType !== ChannelType.DM && channelType !== ChannelType.GROUP_DM) return true;

  // If the channel is a User DM and the setting is set to Group DM, use default behaviour.
  if (channelType === ChannelType.DM && settings.typeOfDM === TypeOfDM.GROUP_DM) return true;

  // If the channel is a Group DM and the setting is set to User DM, use default behaviour.
  if (channelType === ChannelType.GROUP_DM && settings.typeOfDM === TypeOfDM.USER_DM) return true;

  // If allowAtEveryoneBypass is on, and the message mentions everyone, use default behaviour.
  if (settings.allowAtEveryoneBypass && message.mention_everyone) return true;

  // If allowMentionsBypass is on, and the message mentions the current user, use default behaviour.
  const currentUserId = UserStore.getCurrentUser().id;
  if (settings.allowMentionsBypass && message.mentions.some((m) => m.id === currentUserId)) return true;

  // If none of the above restrictions apply,
  // Only return true (allow ping) if the message is also the oldest unread message in the channel.
  return ReadStateStore.getOldestUnreadMessageId(message.channel_id) === message.id;
}
