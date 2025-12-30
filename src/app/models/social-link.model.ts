import { SocialLinkType } from "../enums/social-link-type.enum";

export interface SocialLink {
  type: SocialLinkType;
  url: string;
}