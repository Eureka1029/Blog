import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
  title: 'Eureka的博客',
  subtitle: '华北浪革',
  lang: 'zh_CN',         // 在这里设置你的博客语言，'en', 'zh_CN', 'zh_TW', 'ja', 'ko'
  themeColor: {
    hue: 250,         // 在这里设置你的主题色， Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
    fixed: false,     // 选择是否固定主题色，默认false
  },
  banner: {
    enable: true,
    src: 'assets/images/demo-banner.png',   // 在这里设置你的首页横幅图片，Relative to the /src directory. Relative to the /public directory if it starts with '/'
    position: 'center',      // 在这里设置你的横幅图片位置，Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
    credit: {
      enable: false,         // 这里可以设置你的横幅图片的作者信息，Display the credit text of the banner image
      text: '',              // Credit text to be displayed
      url: ''                // (Optional) URL link to the original artwork or artist's page
    }
  },
  toc: {
    enable: true,           // 这里可以设置是否显示文章目录，Display the table of contents on the right side of the post
    depth: 2                // 文章目录默认显示到2级，Maximum heading depth to show in the table, from 1 to 3
  },
  favicon: [    // Leave this array empty to use the default favicon
    {
      src: '/favicon/touxiang.svg',    // Path of the favicon, relative to the /public directory
      //theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
      //sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
    }
  ]
}

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
    LinkPreset.Friends,
	],
};

export const profileConfig: ProfileConfig = {
  avatar: 'assets/images/touxiang.jpg',  // 个人头像，Relative to the /src directory. Relative to the /public directory if it starts with '/'
  name: 'Eureka',
  bio: '过去来的人',
  links: [
    {
      name: 'GitHub',
      icon: 'fa6-brands:github',
      url: 'https://github.com/Eureka1029',
    },
  ],
}

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
